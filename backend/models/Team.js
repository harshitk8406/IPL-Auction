const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true, unique: true, maxlength: 5 },
    primaryColor: { type: String, default: '#000000' },
    secondaryColor: { type: String, default: '#ffffff' },
    city: { type: String },
    logoInitials: { type: String, maxlength: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
