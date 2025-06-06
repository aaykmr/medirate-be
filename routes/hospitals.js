const express = require("express");
const { Hospital, Review, Doctor } = require("../models");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Get all hospitals
router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
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

// Create new hospital
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, address } = req.body;
    const hospital = await Hospital.create({
      name,
      address,
      averageRating: 0,
    });
    res.status(201).json(hospital);
  } catch (error) {
    console.error("Error creating hospital:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update hospital
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, address } = req.body;
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });

    await hospital.update({
      name: name || hospital.name,
      address: address || hospital.address,
    });

    res.json(hospital);
  } catch (error) {
    console.error("Error updating hospital:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete hospital
router.delete("/:id", authMiddleware, async (req, res) => {
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
