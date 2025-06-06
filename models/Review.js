module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
      },
    },
    {
      // Disable timestamps if you don't want createdAt and updatedAt
      timestamps: true,
      // Define the foreign keys in the model options
      foreignKeys: [
        {
          name: "review_user_fk",
          fields: ["userId"],
          references: {
            table: "Users",
            field: "id",
          },
        },
        {
          name: "review_hospital_fk",
          fields: ["hospitalId"],
          references: {
            table: "Hospitals",
            field: "id",
          },
        },
        {
          name: "review_doctor_fk",
          fields: ["doctorId"],
          references: {
            table: "Doctors",
            field: "id",
          },
        },
      ],
    }
  );

  // Define the associations
  Review.associate = (models) => {
    Review.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Review.belongsTo(models.Hospital, {
      foreignKey: "hospitalId",
      as: "hospital",
    });
    Review.belongsTo(models.Doctor, {
      foreignKey: "doctorId",
      as: "doctor",
    });
  };

  return Review;
};
