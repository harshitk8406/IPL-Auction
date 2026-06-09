const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ipl_auction';
  await mongoose.connect(uri);
  console.log('[DB] MongoDB connected and ready.');
}

module.exports = { connectDB, mongoose };
