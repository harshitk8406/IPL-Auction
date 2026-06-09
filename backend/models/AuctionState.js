const mongoose = require('mongoose');

const auctionStateSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      unique: true,
    },
    status: {
      // idle -> nominating -> bidding -> sold/unsold -> nominating -> ... -> complete
      type: String,
      enum: ['idle', 'nominating', 'bidding', 'sold', 'unsold', 'complete'],
      default: 'idle',
    },
    currentPlayerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    currentBid: { type: Number, default: 0 }, // in Lakhs
    highestBidderGameTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameTeam',
      default: null,
    },
    timerEnd: { type: Date, default: null },
    round: { type: Number, default: 0 },
    // Native arrays — no more JSON TEXT getter/setter hacks
    logJson: { type: [mongoose.Schema.Types.Mixed], default: [] },
    playerPoolJson: { type: [mongoose.Schema.Types.Mixed], default: [] },
    soldPlayersJson: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuctionState', auctionStateSchema);
