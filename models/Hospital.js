module.exports = (sequelize, DataTypes) => {
  const Hospital = sequelize.define(
    "Hospital",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        validate: {
          min: -180,
          max: 180,
        },
      },
      averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "hospitals",
      timestamps: true,
      underscored: true,
    }
  );

  Hospital.associate = (models) => {
    Hospital.belongsTo(models.User, {
      foreignKey: "adminId",
      as: "admin",
    });
  };

  return Hospital;
};
