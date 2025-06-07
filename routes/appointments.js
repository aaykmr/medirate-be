const express = require("express");
const { Op } = require("sequelize");
const db = require("../models");
const authMiddleware = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const router = express.Router();

// Get all appointments (filtered by role)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const whereClause = {};
    const include = [
      {
        model: db.User,
        as: "patient",
        attributes: ["id", "name", "email"],
      },
      {
        model: db.Doctor,
        as: "doctor",
        attributes: ["id", "name", "specialty"],
      },
      {
        model: db.Hospital,
        as: "hospital",
        attributes: ["id", "name", "address"],
      },
    ];

    // Filter based on user role
    if (req.user.role === "user") {
      whereClause.userId = req.user.id;
    } else if (
      req.user.role === "hospital_admin" ||
      req.user.role === "admin"
    ) {
      // Hospital admin can see appointments for their hospital
      const hospital = await db.Hospital.findOne({
        where: { adminId: req.user.id },
      });
      if (hospital) {
        whereClause.hospitalId = hospital.id;
      }
    }

    const appointments = await db.Appointment.findAll({
      where: whereClause,
      include,
      order: [["appointmentDate", "ASC"]],
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new appointment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { doctorId, hospitalId, appointmentDate, reason, duration } =
      req.body;

    // Validate required fields
    if (!doctorId || !hospitalId || !appointmentDate) {
      return res.status(400).json({
        message: "Doctor ID, hospital ID, and appointment date are required",
      });
    }

    // Check if doctor exists and belongs to the hospital
    const doctor = await db.Doctor.findOne({
      where: {
        id: doctorId,
        hospitalId: hospitalId,
      },
    });

    if (!doctor) {
      return res.status(400).json({
        message:
          "Doctor not found or does not belong to the specified hospital",
      });
    }

    // Check for appointment conflicts
    const existingAppointment = await db.Appointment.findOne({
      where: {
        doctorId,
        appointmentDate: {
          [Op.between]: [
            new Date(appointmentDate),
            new Date(
              new Date(appointmentDate).getTime() + (duration || 30) * 60000
            ),
          ],
        },
        status: {
          [Op.notIn]: ["cancelled", "no_show"],
        },
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "Time slot is already booked",
      });
    }

    const appointment = await db.Appointment.create({
      userId: req.user.id,
      doctorId,
      hospitalId,
      appointmentDate,
      reason,
      duration: duration || 30,
      status: "scheduled",
    });

    // Fetch the created appointment with related data
    const createdAppointment = await db.Appointment.findByPk(appointment.id, {
      include: [
        {
          model: db.User,
          as: "patient",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialty"],
        },
        {
          model: db.Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
      ],
    });

    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update appointment status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await db.Appointment.findByPk(req.params.id, {
      include: [
        {
          model: db.Hospital,
          as: "hospital",
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      req.user.role !== "hospital_admin" &&
      appointment.userId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized to update this appointment",
      });
    }

    // Hospital admin can only update appointments for their hospital
    if (
      req.user.role === "hospital_admin" &&
      appointment.hospital.adminId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized to update appointments for this hospital",
      });
    }

    // Validate status
    const validStatuses = ["scheduled", "completed", "cancelled", "no_show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Must be one of: scheduled, completed, cancelled, no_show",
      });
    }

    await appointment.update({ status });

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get available time slots for a doctor
router.get("/available-slots/:doctorId", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.doctorId;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get doctor's appointments for the day
    const appointments = await db.Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: {
          [Op.between]: [startDate, endDate],
        },
        status: {
          [Op.notIn]: ["cancelled", "no_show"],
        },
      },
    });

    // Generate available time slots (assuming 30-minute slots from 9 AM to 5 PM)
    const slots = [];
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0);

    while (startTime < endTime) {
      const slotEnd = new Date(startTime.getTime() + 30 * 60000);
      const isBooked = appointments.some(
        (apt) =>
          new Date(apt.appointmentDate) <= slotEnd &&
          new Date(apt.appointmentDate).getTime() + apt.duration * 60000 >=
            startTime.getTime()
      );

      if (!isBooked) {
        slots.push(new Date(startTime));
      }

      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    res.json(slots);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get appointment details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await db.Appointment.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          as: "patient",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialty"],
        },
        {
          model: db.Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      req.user.role !== "hospital_admin" &&
      appointment.userId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized to view this appointment",
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
