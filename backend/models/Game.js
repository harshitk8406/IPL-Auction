const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  lobbyCode: {
    type: DataTypes.STRING(8),
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('waiting', 'auction', 'complete'),
    defaultValue: 'waiting',
  },
  hostUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  playerPoolJson: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('playerPoolJson');
      try { return JSON.parse(val); } catch { return []; }
    },
    set(val) {
      this.setDataValue('playerPoolJson', JSON.stringify(val));
    },
  },
});

module.exports = Game;
