const express = require('express');
const authenticate = require('../middleware/auth');
const { Team, GameTeam, User, Squad, Player } = require('../models');

const router = express.Router();

// GET /api/teams — List all 10 IPL teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ _id: 1 });
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load teams' });
  }
});

// POST /api/teams/select — Human selects a team in a lobby
router.post('/select', authenticate, async (req, res) => {
  try {
    const { gameId, teamId } = req.body;
    if (!gameId || !teamId) return res.status(400).json({ error: 'gameId and teamId required' });

    // Check if team slot exists in this game
    const existing = await GameTeam.findOne({ gameId, teamId });
    if (!existing) return res.status(404).json({ error: 'GameTeam slot not found' });

    if (!existing.isAI && existing.userId !== null && String(existing.userId) !== String(req.user._id)) {
      return res.status(409).json({ error: 'Team already selected by another player' });
    }

    // If user already has a different team in this game, revert it to AI
    const userTeam = await GameTeam.findOne({ gameId, userId: req.user._id });
    if (userTeam && String(userTeam.teamId) !== String(teamId)) {
      await GameTeam.findByIdAndUpdate(userTeam._id, { userId: null, isAI: true });
    }

    await GameTeam.findByIdAndUpdate(existing._id, { userId: req.user._id, isAI: false });

    const updated = await GameTeam.findById(existing._id)
      .populate('teamId')
      .populate('userId', 'id username');

    res.json({ gameTeam: updated });
  } catch (err) {
    console.error('Select team error:', err);
    res.status(500).json({ error: 'Failed to select team' });
  }
});

// GET /api/teams/:gameTeamId/squad — Get squad for a team in a game
router.get('/:gameTeamId/squad', authenticate, async (req, res) => {
  try {
    const squads = await Squad.find({ gameTeamId: req.params.gameTeamId })
      .populate('playerId')
      .sort({ soldPrice: -1 });

    res.json({ squad: squads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load squad' });
  }
});

module.exports = router;
