const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AuctionState = sequelize.define('AuctionState', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gameId: {
    type: DataTypes.UUID,
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
  },
  currentBid: {
    type: DataTypes.INTEGER, // in Lakhs
    defaultValue: 0,
  },
  highestBidderGameTeamId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  timerEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  round: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  logJson: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      try { return JSON.parse(this.getDataValue('logJson')); } catch { return []; }
    },
    set(val) {
      this.setDataValue('logJson', JSON.stringify(val));
    },
  },
  playerPoolJson: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      try { return JSON.parse(this.getDataValue('playerPoolJson')); } catch { return []; }
    },
    set(val) {
      this.setDataValue('playerPoolJson', JSON.stringify(val));
    },
  },
  soldPlayersJson: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      try { return JSON.parse(this.getDataValue('soldPlayersJson')); } catch { return []; }
    },
    set(val) {
      this.setDataValue('soldPlayersJson', JSON.stringify(val));
    },
  },
});

module.exports = AuctionState;
