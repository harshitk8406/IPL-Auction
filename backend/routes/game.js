const express = require('express');
const authenticate = require('../middleware/auth');
const { Game, GameTeam, Team, User, AuctionState, Player } = require('../models');

const router = express.Router();

function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Serialize a game document to a plain object with string IDs
function serializeGame(game) {
  return {
    id: String(game._id),
    lobbyCode: game.lobbyCode,
    status: game.status,
    hostUserId: String(game.hostUserId),
    maxPlayers: game.maxPlayers,
  };
}

// Serialize a populated GameTeam document
function serializeGameTeam(gt) {
  const team = gt.teamId;
  const user = gt.userId;
  return {
    id: String(gt._id),
    gameId: String(gt.gameId),
    teamId: team ? String(team._id) : String(gt.teamId),
    userId: user ? String(user._id) : (gt.userId ? String(gt.userId) : null),
    isAI: gt.isAI,
    purseRemaining: gt.purseRemaining,
    squadSize: gt.squadSize,
    overseasCount: gt.overseasCount,
    Team: team ? {
      id: String(team._id),
      name: team.name,
      shortName: team.shortName,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      city: team.city,
      logoInitials: team.logoInitials,
    } : null,
    User: user ? { id: String(user._id), username: user.username } : null,
  };
}

// POST /api/game/create — Host creates a new lobby
router.post('/create', authenticate, async (req, res) => {
  try {
    let lobbyCode;
    // Ensure unique code
    do {
      lobbyCode = generateLobbyCode();
    } while (await Game.findOne({ lobbyCode }));

    const game = await Game.create({
      lobbyCode,
      hostUserId: req.user._id,
      status: 'waiting',
    });

    // Pre-create 10 GameTeam slots (all AI initially)
    const teams = await Team.find().sort({ _id: 1 });
    await GameTeam.insertMany(
      teams.map((t) => ({
        gameId: game._id,
        teamId: t._id,
        userId: null,
        isAI: true,
        purseRemaining: 12000,
        squadSize: 0,
        overseasCount: 0,
      }))
    );

    // Create empty auction state
    await AuctionState.create({ gameId: game._id });

    res.status(201).json({ game: serializeGame(game) });
  } catch (err) {
    console.error('Create game error:', err);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// POST /api/game/join — Join by lobby code
router.post('/join', authenticate, async (req, res) => {
  try {
    const { lobbyCode } = req.body;
    if (!lobbyCode) return res.status(400).json({ error: 'Lobby code required' });

    const game = await Game.findOne({ lobbyCode: lobbyCode.toUpperCase() });
    if (!game) return res.status(404).json({ error: 'Lobby not found' });
    if (game.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });

    res.json({ game: serializeGame(game) });
  } catch (err) {
    console.error('Join game error:', err);
    res.status(500).json({ error: 'Failed to join game' });
  }
});

// GET /api/game/:gameId/state — Full game state
router.get('/:gameId/state', authenticate, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const gameTeams = await GameTeam.find({ gameId: game._id })
      .populate('teamId')
      .populate('userId', 'username');

    res.json({
      game: serializeGame(game),
      gameTeams: gameTeams.map(serializeGameTeam),
    });
  } catch (err) {
    console.error('Game state error:', err);
    res.status(500).json({ error: 'Failed to load game state' });
  }
});

// GET /api/game/:gameId — Basic game info
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json({ game: serializeGame(game) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load game' });
  }
});

// POST /api/game/:gameId/start — Host starts the auction
router.post('/:gameId/start', authenticate, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (String(game.hostUserId) !== String(req.user._id))
      return res.status(403).json({ error: 'Only host can start' });
    if (game.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });

    // Shuffle all player IDs for the pool
    const players = await Player.find({}, '_id');
    const shuffled = players.map((p) => p._id).sort(() => Math.random() - 0.5);

    game.status = 'auction';
    game.playerPool = shuffled;
    await game.save();

    // Update auction state with shuffled pool
    const auctionState = await AuctionState.findOne({ gameId: game._id });
    if (auctionState) {
      auctionState.playerPoolJson = shuffled;
      auctionState.status = 'nominating';
      await auctionState.save();
    }

    res.json({ success: true, game: serializeGame(game) });
  } catch (err) {
    console.error('Start game error:', err);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

module.exports = router;
