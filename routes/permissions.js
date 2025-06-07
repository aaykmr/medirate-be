const express = require("express");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Get all roles and their permissions
router.get("/roles", authMiddleware, async (req, res) => {
  try {
    const roles = {
      admin: {
        canManageUsers: true,
        canManageHospitals: true,
        canManageReviews: true,
        canManagePermissions: true,
      },
      hospital_admin: {
        canManageUsers: false,
        canManageHospitals: true,
        canManageReviews: true,
        canManagePermissions: false,
      },
      user: {
        canManageUsers: false,
        canManageHospitals: false,
        canManageReviews: true,
        canManagePermissions: false,
      },
    };

    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
