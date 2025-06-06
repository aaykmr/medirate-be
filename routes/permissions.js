const express = require("express");
const db = require("../models");
const authMiddleware = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
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

// Admin: Update user permissions
router.put(
  "/users/:id",
  [authMiddleware, roleAuth("admin")],
  async (req, res) => {
    try {
      const { role } = req.body;
      const user = await db.User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent admin from changing their own role
      if (user.id === req.user.id) {
        return res.status(403).json({
          message: "Admin cannot modify their own permissions",
        });
      }

      // Validate role
      const validRoles = ["user", "admin", "hospital_admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role. Must be one of: user, admin, hospital_admin",
        });
      }

      // Update user role
      await user.update({ role });

      // Log the permission change
      console.log(
        `User ${user.id} role changed to ${role} by admin ${req.user.id}`
      );

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error("Error updating user permissions:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user permissions
router.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: ["id", "email", "name", "role"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow users to view their own permissions or admins to view any
    if (user.id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to view these permissions",
      });
    }

    const permissions = {
      canManageUsers: user.role === "admin",
      canManageHospitals:
        user.role === "admin" || user.role === "hospital_admin",
      canManageReviews: true, // All users can manage their own reviews
      canManagePermissions: user.role === "admin",
    };

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Get all users with their permissions
router.get("/users", [authMiddleware, roleAuth("admin")], async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ["id", "email", "name", "role"],
    });

    const usersWithPermissions = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: {
        canManageUsers: user.role === "admin",
        canManageHospitals:
          user.role === "admin" || user.role === "hospital_admin",
        canManageReviews: true,
        canManagePermissions: user.role === "admin",
      },
    }));

    res.json(usersWithPermissions);
  } catch (error) {
    console.error("Error fetching users with permissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
