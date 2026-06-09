const express = require('express');
const authenticate = require('../middleware/auth');
const { AuctionState, GameTeam, Player, Team, User } = require('../models');
const auctionService = require('../services/auctionService');

const router = express.Router();

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

// GET /api/auction/:gameId — Get current auction state
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const state = await AuctionState.findOne({ gameId: req.params.gameId });
    if (!state) return res.status(404).json({ error: 'Auction not found' });

    const gameTeams = await GameTeam.find({ gameId: req.params.gameId })
      .populate('teamId')
      .populate('userId', 'username');

    let currentPlayer = null;
    if (state.currentPlayerId) {
      const p = await Player.findById(state.currentPlayerId);
      if (p) {
        currentPlayer = {
          id: String(p._id),
          name: p.name,
          role: p.role,
          nationality: p.nationality,
          basePrice: p.basePrice,
          battingStyle: p.battingStyle,
          bowlingStyle: p.bowlingStyle,
        };
      }
    }

    res.json({
      auction: {
        id: String(state._id),
        gameId: String(state.gameId),
        status: state.status,
        currentPlayer,
        currentBid: state.currentBid,
        highestBidderGameTeamId: state.highestBidderGameTeamId
          ? String(state.highestBidderGameTeamId)
          : null,
        timerEnd: state.timerEnd,
        round: state.round,
        log: state.logJson,
        remainingPlayers: state.playerPoolJson.length,
      },
      gameTeams: gameTeams.map(serializeGameTeam),
    });
  } catch (err) {
    console.error('Auction state error:', err);
    res.status(500).json({ error: 'Failed to load auction state' });
  }
});

// POST /api/auction/:gameId/bid — Place a bid
router.post('/:gameId/bid', authenticate, async (req, res) => {
  try {
    const { gameTeamId, amount } = req.body;
    if (!gameTeamId || !amount) return res.status(400).json({ error: 'gameTeamId and amount required' });

    const result = await auctionService.placeBid(req.params.gameId, gameTeamId, parseInt(amount), false);
    if (!result.success) return res.status(400).json({ error: result.error });

    res.json({ success: true, currentBid: result.currentBid });
  } catch (err) {
    console.error('Bid error:', err);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

module.exports = router;
