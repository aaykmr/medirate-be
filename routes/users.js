const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const authMiddleware = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const router = express.Router();

// Get current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await db.User.findByPk(req.user.id);

    if (email && email !== user.email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    await user.update({ name, email });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db.User.findByPk(req.user.id);

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the current password",
        });
    }

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedPassword });
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
router.get("/", authMiddleware, roleAuth("admin"), async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role (admin only)
router.put("/:id/role", authMiddleware, roleAuth("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await db.User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ role });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (admin only)
router.delete("/:id", authMiddleware, roleAuth("admin"), async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
