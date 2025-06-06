module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define("Doctor", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Hospitals",
        key: "id",
      },
    },
  });

  return Doctor;
};
