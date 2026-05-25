const sequelize = require('../database');
const User = require('./User');
const Team = require('./Team');
const Player = require('./Player');
const Game = require('./Game');
const GameTeam = require('./GameTeam');
const Squad = require('./Squad');
const AuctionState = require('./AuctionState');

// ---------- Associations ----------

// A Game has many GameTeams (one per IPL team slot)
Game.hasMany(GameTeam, { foreignKey: 'gameId', as: 'gameTeams', onDelete: 'CASCADE' });
GameTeam.belongsTo(Game, { foreignKey: 'gameId' });

// GameTeam belongs to a Team (franchise)
GameTeam.belongsTo(Team, { foreignKey: 'teamId', as: 'Team' });
Team.hasMany(GameTeam, { foreignKey: 'teamId' });

// GameTeam optionally belongs to a User (null = AI)
GameTeam.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(GameTeam, { foreignKey: 'userId' });

// Squad entries belong to a GameTeam and a Player
Squad.belongsTo(GameTeam, { foreignKey: 'gameTeamId', as: 'GameTeam' });
Squad.belongsTo(Player, { foreignKey: 'playerId', as: 'Player' });
GameTeam.hasMany(Squad, { foreignKey: 'gameTeamId', as: 'Squads' });
Player.hasMany(Squad, { foreignKey: 'playerId' });

// One AuctionState per Game
Game.hasOne(AuctionState, { foreignKey: 'gameId', as: 'AuctionState', onDelete: 'CASCADE' });
AuctionState.belongsTo(Game, { foreignKey: 'gameId' });

module.exports = { sequelize, User, Team, Player, Game, GameTeam, Squad, AuctionState };
