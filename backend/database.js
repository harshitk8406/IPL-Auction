const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './ipl_auction.sqlite3';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(dbPath),
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

module.exports = sequelize;
