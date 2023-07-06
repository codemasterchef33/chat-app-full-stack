const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Group = sequelize.define("group", {
  id: {
    type: Sequelize.INTEGER,
    unique: true,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});

module.exports = Group;
