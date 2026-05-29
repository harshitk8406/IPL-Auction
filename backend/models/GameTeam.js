const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// Represents one IPL franchise's participation slot in a specific game
const GameTeam = sequelize.define('GameTeam', {
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null, // null = AI controlled
  },
  isAI: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  purseRemaining: {
    type: DataTypes.INTEGER, // in Lakhs
    defaultValue: 12000,    // 120 Crore = 12000 Lakhs
  },
  squadSize: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  overseasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, { tableName: 'game_teams', timestamps: true });

module.exports = GameTeam;
