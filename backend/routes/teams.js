const express = require('express');
const authenticate = require('../middleware/auth');
const { Team, GameTeam, User, Squad, Player } = require('../models');

const router = express.Router();

// GET /api/teams — List all 10 IPL teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.findAll({ order: [['id', 'ASC']] });
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
    const existing = await GameTeam.findOne({ where: { gameId, teamId } });
    if (!existing) return res.status(404).json({ error: 'GameTeam slot not found' });

    if (!existing.isAI && existing.userId !== null && existing.userId !== req.user.id) {
      return res.status(409).json({ error: 'Team already selected by another player' });
    }

    // If user already has a different team in this game, revert it to AI
    const userTeam = await GameTeam.findOne({ where: { gameId, userId: req.user.id } });
    if (userTeam && userTeam.teamId !== parseInt(teamId)) {
      await userTeam.update({ userId: null, isAI: true });
    }

    await existing.update({ userId: req.user.id, isAI: false });

    const updated = await GameTeam.findByPk(existing.id, {
      include: [
        { model: Team, as: 'Team' },
        { model: User, as: 'User', attributes: ['id', 'username'] },
      ],
    });

    res.json({ gameTeam: updated });
  } catch (err) {
    console.error('Select team error:', err);
    res.status(500).json({ error: 'Failed to select team' });
  }
});

// GET /api/teams/:gameTeamId/squad — Get squad for a team in a game
router.get('/:gameTeamId/squad', authenticate, async (req, res) => {
  try {
    const squads = await Squad.findAll({
      where: { gameTeamId: req.params.gameTeamId },
      include: [{ model: Player, as: 'Player' }],
      order: [['soldPrice', 'DESC']],
    });

    res.json({ squad: squads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load squad' });
  }
});

module.exports = router;
