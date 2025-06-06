module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define(
    "Appointment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "doctors",
          key: "id",
        },
      },
      hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "hospitals",
          key: "id",
        },
      },
      appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("scheduled", "completed", "cancelled", "no_show"),
        defaultValue: "scheduled",
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: false,
        defaultValue: 30,
      },
    },
    {
      tableName: "appointments",
      timestamps: true,
      underscored: true,
    }
  );

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "patient",
    });
    Appointment.belongsTo(models.Doctor, {
      foreignKey: "doctorId",
      as: "doctor",
    });
    Appointment.belongsTo(models.Hospital, {
      foreignKey: "hospitalId",
      as: "hospital",
    });
  };

  return Appointment;
};
