// Sequelize models — associations defined here so socket.js 'include' syntax works
const sequelize = require('../database');

const User        = require('./User');
const Team        = require('./Team');
const Player      = require('./Player');
const Game        = require('./Game');
const GameTeam    = require('./GameTeam');
const Squad       = require('./Squad');
const AuctionState = require('./AuctionState');

// ── Associations ─────────────────────────────────────────────────────────────

// Game belongs to its host user
Game.belongsTo(User, { foreignKey: 'hostUserId', as: 'Host' });

// GameTeam associations — 'as' aliases must match the socket/route include calls
GameTeam.belongsTo(Game,   { foreignKey: 'gameId' });
GameTeam.belongsTo(Team,   { foreignKey: 'teamId', as: 'Team' });
GameTeam.belongsTo(User,   { foreignKey: 'userId', as: 'User' });

// Squad associations
Squad.belongsTo(Game,     { foreignKey: 'gameId' });
Squad.belongsTo(GameTeam, { foreignKey: 'gameTeamId' });
Squad.belongsTo(Player,   { foreignKey: 'playerId', as: 'Player' });

// AuctionState
AuctionState.belongsTo(Game, { foreignKey: 'gameId' });

module.exports = { sequelize, User, Team, Player, Game, GameTeam, Squad, AuctionState };
