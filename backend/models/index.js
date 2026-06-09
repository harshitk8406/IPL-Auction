// Mongoose models — no association setup needed (use .populate() at query time)
const User         = require('./User');
const Team         = require('./Team');
const Player       = require('./Player');
const Game         = require('./Game');
const GameTeam     = require('./GameTeam');
const Squad        = require('./Squad');
const AuctionState = require('./AuctionState');

module.exports = { User, Team, Player, Game, GameTeam, Squad, AuctionState };
