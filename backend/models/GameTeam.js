const mongoose = require('mongoose');

// Represents one IPL franchise's participation slot in a specific game
const gameTeamSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = AI controlled
    isAI: { type: Boolean, default: true },
    purseRemaining: { type: Number, default: 12000 }, // in Lakhs (120 Crore)
    squadSize: { type: Number, default: 0 },
    overseasCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameTeam', gameTeamSchema);
