const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// Represents one team's participation in a specific game
const GameTeam = sequelize.define('GameTeam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // null = AI controlled
  },
  purseRemaining: {
    type: DataTypes.INTEGER, // in Lakhs
    defaultValue: 9000,     // 90 Crore = 9000 Lakhs
  },
  squadSize: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isAI: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  overseasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = GameTeam;
