const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// A player acquired by a team in a specific game
const Squad = sequelize.define('Squad', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  gameTeamId: {
    type: DataTypes.UUID,
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
});

module.exports = Squad;
