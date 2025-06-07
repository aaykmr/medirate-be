require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const hospitalRoutes = require("./routes/hospitals");
const doctorRoutes = require("./routes/doctors");
const permissionRoutes = require("./routes/permissions");
const appointmentRoutes = require("./routes/appointments");
const { connectDB } = require("./config/db");
const db = require("./models");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MySQL and sync models
const initDB = async () => {
  try {
    await connectDB();
    // Sync without force to preserve data
    await db.sequelize.sync({ alter: true });
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Database sync error:", error);
    process.exit(1);
  }
};

initDB();

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.status(200).json({
      status: "OK",
      database: "Connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      error: error.message,
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/appointments", appointmentRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
