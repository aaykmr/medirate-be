const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../models");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  console.log("Registration attempt:", { email, name });

  try {
    const existingUser = await db.User.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await db.User.create({
      email: email,
      password: password,
      name: name,
      role: "user", // Default role for normal registration
    });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Admin registration route (should be protected in production)
router.post("/register/admin", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.User.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await db.User.create({
      email: email,
      password: password,
      name: name,
      role: "admin",
    });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email });

  try {
    const user = await db.User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
