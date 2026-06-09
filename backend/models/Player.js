const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'],
    },
    nationality: {
      type: String,
      required: true,
      enum: ['Indian', 'Overseas'],
    },
    basePrice: { type: Number, required: true, default: 20 }, // in Lakhs
    battingStyle: { type: String },
    bowlingStyle: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
