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
  User: require("./User")(sequelize, Sequelize),
  Hospital: require("./Hospital")(sequelize, Sequelize),
  Doctor: require("./Doctor")(sequelize, Sequelize),
  Review: require("./Review")(sequelize, Sequelize),
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

module.exports = db;
