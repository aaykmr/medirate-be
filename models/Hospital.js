module.exports = (sequelize, DataTypes) => {
  const Hospital = sequelize.define("Hospital", {
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
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  });

  return Hospital;
};
