const express = require("express");
const { Doctor, Hospital, Review } = require("../models");
const authMiddleware = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const router = express.Router();

// Get all doctors (public)
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Hospital,
          as: "hospital",
        },
        {
          model: Review,
          as: "reviews",
        },
      ],
    });
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get doctor by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [
        {
          model: Hospital,
          as: "hospital",
        },
        {
          model: Review,
          as: "reviews",
        },
      ],
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new doctor (admin and hospital_admin only)
router.post(
  "/",
  [authMiddleware, roleAuth("admin", "hospital_admin")],
  async (req, res) => {
    try {
      const { name, specialty, hospitalId } = req.body;
      const doctor = await Doctor.create({
        name,
        specialty,
        hospitalId,
      });
      res.status(201).json(doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update doctor (admin and hospital_admin only)
router.put(
  "/:id",
  [authMiddleware, roleAuth("admin", "hospital_admin")],
  async (req, res) => {
    try {
      const { name, specialty, hospitalId } = req.body;
      const doctor = await Doctor.findByPk(req.params.id);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });

      await doctor.update({
        name: name || doctor.name,
        specialty: specialty || doctor.specialty,
        hospitalId: hospitalId || doctor.hospitalId,
      });

      res.json(doctor);
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete doctor (admin only)
router.delete("/:id", [authMiddleware, roleAuth("admin")], async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await doctor.destroy();
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
