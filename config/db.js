const mysql = require("mysql2/promise");

const connectDB = async () => {
  try {
    console.log("Variables", process.env);
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "admin",
      database: process.env.DB_NAME || "medirate",
      ssl: false, // Disable SSL for now
      socketPath: undefined, // Ensure TCP/IP is used
    });

    console.log("MySQL connected");
    return connection;
  } catch (error) {
    console.error("MySQL connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
