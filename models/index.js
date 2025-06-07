const { Sequelize } = require("sequelize");
const { connectDB } = require("../config/db");

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "medirate",
  define: {
    timestamps: true,
    underscored: true, // Use snake_case for column names
  },
});

const db = {
  sequelize,
  Sequelize,
  User: require("./user")(sequelize, Sequelize),
  Hospital: require("./hospital")(sequelize, Sequelize),
  Doctor: require("./doctor")(sequelize, Sequelize),
  Review: require("./review")(sequelize, Sequelize),
  Appointment: require("./appointment")(sequelize, Sequelize),
};

// Define associations
db.User.hasMany(db.Review, {
  foreignKey: "userId",
  as: "reviews",
});
db.Review.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

// Hospital-Admin association
db.User.hasMany(db.Hospital, {
  foreignKey: "adminId",
  as: "managedHospitals",
});
db.Hospital.belongsTo(db.User, {
  foreignKey: "adminId",
  as: "admin",
});

db.Hospital.hasMany(db.Doctor, {
  foreignKey: "hospitalId",
  as: "doctors",
});
db.Doctor.belongsTo(db.Hospital, {
  foreignKey: "hospitalId",
  as: "hospital",
});

db.Hospital.hasMany(db.Review, {
  foreignKey: "hospitalId",
  as: "reviews",
});
db.Review.belongsTo(db.Hospital, {
  foreignKey: "hospitalId",
  as: "hospital",
});

db.Doctor.hasMany(db.Review, {
  foreignKey: "doctorId",
  as: "reviews",
});
db.Review.belongsTo(db.Doctor, {
  foreignKey: "doctorId",
  as: "doctor",
});

// Appointment associations
db.User.hasMany(db.Appointment, {
  foreignKey: "userId",
  as: "appointments",
});
db.Appointment.belongsTo(db.User, {
  foreignKey: "userId",
  as: "patient",
});

db.Doctor.hasMany(db.Appointment, {
  foreignKey: "doctorId",
  as: "appointments",
});
db.Appointment.belongsTo(db.Doctor, {
  foreignKey: "doctorId",
  as: "doctor",
});

db.Hospital.hasMany(db.Appointment, {
  foreignKey: "hospitalId",
  as: "appointments",
});
db.Appointment.belongsTo(db.Hospital, {
  foreignKey: "hospitalId",
  as: "hospital",
});

module.exports = db;
