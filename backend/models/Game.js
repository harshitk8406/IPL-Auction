const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Game = sequelize.define('Game', {
  lobbyCode: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('waiting', 'auction', 'complete'),
    defaultValue: 'waiting',
  },
  hostUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  // Stored as JSON string in SQLite; getter/setter handle serialisation
  playerPool: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('playerPool');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) {
      this.setDataValue('playerPool', JSON.stringify(val ?? []));
    },
  },
}, { tableName: 'games', timestamps: true });

module.exports = Game;
