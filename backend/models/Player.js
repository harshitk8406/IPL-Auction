const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Player = sequelize.define('Player', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'),
    allowNull: false,
  },
  nationality: {
    type: DataTypes.ENUM('Indian', 'Overseas'),
    allowNull: false,
  },
  basePrice: {
    type: DataTypes.INTEGER, // in Lakhs
    allowNull: false,
    defaultValue: 20,
  },
  battingStyle: {
    type: DataTypes.STRING,
  },
  bowlingStyle: {
    type: DataTypes.STRING,
  },
}, { tableName: 'players', timestamps: true });

module.exports = Player;
