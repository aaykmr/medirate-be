const express = require("express");
const { Op, literal } = require("sequelize");
const { Hospital, Review, Doctor } = require("../models");
const authMiddleware = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const router = express.Router();

// Get all hospitals with optional radius search
router.get("/", async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    let whereClause = {};

    // If coordinates and radius are provided, add distance calculation
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = parseFloat(radius);

      // Haversine formula for distance calculation
      const distanceFormula = literal(
        `(
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        )`
      );

      whereClause = {
        [Op.and]: literal(`(
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) <= ${rad}`),
      };
    }

    const hospitals = await Hospital.findAll({
      where: whereClause,
      attributes: {
        include: [
          [
            literal(
              `(
                6371 * acos(
                  cos(radians(${latitude || 0})) * 
                  cos(radians(latitude)) * 
                  cos(radians(longitude) - radians(${longitude || 0})) + 
                  sin(radians(${latitude || 0})) * 
                  sin(radians(latitude))
                )
              )`
            ),
            "distance",
          ],
        ],
      },
      order:
        latitude && longitude ? literal("distance ASC") : [["name", "ASC"]],
    });

    res.json(hospitals);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get hospital by ID
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id, {
      include: [
        {
          model: Review,
          as: "reviews",
        },
        {
          model: Doctor,
          as: "doctors",
        },
      ],
    });
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });
    res.json(hospital);
  } catch (error) {
    console.error("Error fetching hospital:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new hospital (admin only)
router.post("/", authMiddleware, roleAuth(["admin"]), async (req, res) => {
  try {
    const { name, address, latitude, longitude, adminId } = req.body;

    // Validate coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const hospital = await Hospital.create({
      name,
      address,
      latitude,
      longitude,
      adminId,
    });

    res.status(201).json(hospital);
  } catch (error) {
    console.error("Error creating hospital:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update hospital (admin only)
router.put("/:id", authMiddleware, roleAuth(["admin"]), async (req, res) => {
  try {
    const { name, address, latitude, longitude, adminId } = req.body;

    // Validate coordinates if provided
    if (latitude && (latitude < -90 || latitude > 90)) {
      return res.status(400).json({ message: "Invalid latitude" });
    }
    if (longitude && (longitude < -180 || longitude > 180)) {
      return res.status(400).json({ message: "Invalid longitude" });
    }

    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });

    await hospital.update({
      name,
      address,
      latitude,
      longitude,
      adminId,
    });

    res.json(hospital);
  } catch (error) {
    console.error("Error updating hospital:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete hospital (admin only)
router.delete("/:id", authMiddleware, roleAuth(["admin"]), async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });

    await hospital.destroy();
    res.json({ message: "Hospital deleted successfully" });
  } catch (error) {
    console.error("Error deleting hospital:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit review for hospital
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });

    const review = await Review.create({
      userId: req.user.id,
      hospitalId: req.params.id,
      rating,
      comment,
    });

    // Calculate new average rating
    const reviews = await Review.findAll({
      where: { hospitalId: req.params.id },
    });

    const newAverageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await hospital.update({ averageRating: newAverageRating });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
//28.490762998613913, 77.10670419388701
