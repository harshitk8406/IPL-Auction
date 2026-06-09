const express = require('express');
const authenticate = require('../middleware/auth');
const { Team, GameTeam, User, Squad, Player } = require('../models');

const router = express.Router();

// Serialize a populated GameTeam document with string IDs
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

// GET /api/teams — List all 10 IPL teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ _id: 1 });
    // Normalize _id → id for frontend
    const serialized = teams.map((t) => ({
      id: String(t._id),
      name: t.name,
      shortName: t.shortName,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      city: t.city,
      logoInitials: t.logoInitials,
    }));
    res.json({ teams: serialized });
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
      .populate('userId', 'username');

    res.json({ gameTeam: serializeGameTeam(updated) });
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

    const serialized = squads.map((s) => ({
      id: String(s._id),
      gameId: String(s.gameId),
      gameTeamId: String(s.gameTeamId),
      playerId: String(s.playerId?._id || s.playerId),
      soldPrice: s.soldPrice,
      Player: s.playerId ? {
        id: String(s.playerId._id),
        name: s.playerId.name,
        role: s.playerId.role,
        nationality: s.playerId.nationality,
        basePrice: s.playerId.basePrice,
        battingStyle: s.playerId.battingStyle,
        bowlingStyle: s.playerId.bowlingStyle,
      } : null,
    }));

    res.json({ squad: serialized });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load squad' });
  }
});

module.exports = router;
