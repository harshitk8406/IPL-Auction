const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Team = sequelize.define('Team', {
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
    type: DataTypes.STRING(10),
    defaultValue: '#000000',
  },
  secondaryColor: {
    type: DataTypes.STRING(10),
    defaultValue: '#ffffff',
  },
  city: {
    type: DataTypes.STRING,
  },
  logoInitials: {
    type: DataTypes.STRING(5),
  },
}, { tableName: 'teams', timestamps: true });

module.exports = Team;
