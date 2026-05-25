const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortName: {
    type: DataTypes.STRING(5),
    allowNull: false,
    unique: true,
  },
  primaryColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#000000',
  },
  secondaryColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#ffffff',
  },
  city: {
    type: DataTypes.STRING,
  },
  logoInitials: {
    type: DataTypes.STRING(3),
  },
});

module.exports = Team;
