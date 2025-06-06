const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "hospital_admin"),
        defaultValue: "user",
        allowNull: false,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.hasMany(models.Review, {
      foreignKey: "userId",
      as: "reviews",
    });
  };

  return User;
};
