const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// A player acquired by a team in a specific game
const Squad = sequelize.define('Squad', {
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gameTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  soldPrice: {
    type: DataTypes.INTEGER, // in Lakhs
    allowNull: false,
  },
}, { tableName: 'squads', timestamps: true });

module.exports = Squad;
