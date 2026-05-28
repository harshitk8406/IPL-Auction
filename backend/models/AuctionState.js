const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AuctionState = sequelize.define('AuctionState', {
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  status: {
    // idle -> nominating -> bidding -> sold/unsold -> nominating -> ... -> complete
    type: DataTypes.ENUM('idle', 'nominating', 'bidding', 'sold', 'unsold', 'complete'),
    defaultValue: 'idle',
  },
  currentPlayerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  currentBid: {
    type: DataTypes.INTEGER, // in Lakhs
    defaultValue: 0,
  },
  highestBidderGameTeamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  timerEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  round: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // JSON arrays — stored as TEXT, auto-serialised via getter/setter
  logJson: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('logJson');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('logJson', JSON.stringify(val ?? [])); },
  },
  playerPoolJson: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('playerPoolJson');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('playerPoolJson', JSON.stringify(val ?? [])); },
  },
  soldPlayersJson: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('soldPlayersJson');
      try { return val ? JSON.parse(val) : []; } catch { return []; }
    },
    set(val) { this.setDataValue('soldPlayersJson', JSON.stringify(val ?? [])); },
  },
}, { tableName: 'auction_states', timestamps: true });

module.exports = AuctionState;
