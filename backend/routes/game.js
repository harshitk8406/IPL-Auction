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

// POST /api/game/create — Host creates a new lobby
router.post('/create', authenticate, async (req, res) => {
  try {
    let lobbyCode;
    // Ensure unique code
    do {
      lobbyCode = generateLobbyCode();
    } while (await Game.findOne({ where: { lobbyCode } }));

    const game = await Game.create({
      lobbyCode,
      hostUserId: req.user.id,
      status: 'waiting',
    });

    // Pre-create 10 GameTeam slots (all AI initially)
    const teams = await Team.findAll({ order: [['id', 'ASC']] });
    await GameTeam.bulkCreate(
      teams.map((t) => ({
        gameId: game.id,
        teamId: t.id,
        userId: null,
        isAI: true,
        purseRemaining: 12000,
        squadSize: 0,
        overseasCount: 0,
      }))
    );

    // Create empty auction state
    await AuctionState.create({ gameId: game.id });

    res.status(201).json({
      game: {
        id: game.id,
        lobbyCode: game.lobbyCode,
        status: game.status,
        hostUserId: game.hostUserId,
      },
    });
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

    const game = await Game.findOne({ where: { lobbyCode: lobbyCode.toUpperCase() } });
    if (!game) return res.status(404).json({ error: 'Lobby not found' });
    if (game.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });

    res.json({
      game: {
        id: game.id,
        lobbyCode: game.lobbyCode,
        status: game.status,
        hostUserId: game.hostUserId,
      },
    });
  } catch (err) {
    console.error('Join game error:', err);
    res.status(500).json({ error: 'Failed to join game' });
  }
});

// GET /api/game/:gameId/state — Full game state
router.get('/:gameId/state', authenticate, async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const gameTeams = await GameTeam.findAll({
      where: { gameId: game.id },
      include: [
        { model: Team, as: 'Team' },
        { model: User, as: 'User', attributes: ['id', 'username'] },
      ],
      order: [['teamId', 'ASC']],
    });

    res.json({ game, gameTeams });
  } catch (err) {
    console.error('Game state error:', err);
    res.status(500).json({ error: 'Failed to load game state' });
  }
});

// GET /api/game/:gameId — Basic game info
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json({ game });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load game' });
  }
});

// POST /api/game/:gameId/start — Host starts the auction
router.post('/:gameId/start', authenticate, async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.hostUserId !== req.user.id)
      return res.status(403).json({ error: 'Only host can start' });
    if (game.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });

    // Shuffle all player IDs for the pool
    const players = await Player.findAll({ attributes: ['id'] });
    const shuffled = players.map((p) => p.id).sort(() => Math.random() - 0.5);

    game.status = 'auction';
    game.playerPool = shuffled; // setter auto-serialises to JSON string
    await game.save();

    // Update auction state with shuffled pool
    const auctionState = await AuctionState.findOne({ where: { gameId: game.id } });
    if (auctionState) {
      auctionState.playerPoolJson = shuffled; // setter auto-serialises
      auctionState.status = 'nominating';
      await auctionState.save();
    }

    res.json({ success: true, game });
  } catch (err) {
    console.error('Start game error:', err);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

module.exports = router;
