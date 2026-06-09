const express = require('express');
const authenticate = require('../middleware/auth');
const { AuctionState, GameTeam, Player, Team, User } = require('../models');
const auctionService = require('../services/auctionService');

const router = express.Router();

// GET /api/auction/:gameId — Get current auction state
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const state = await AuctionState.findOne({ gameId: req.params.gameId });
    if (!state) return res.status(404).json({ error: 'Auction not found' });

    const gameTeams = await GameTeam.find({ gameId: req.params.gameId })
      .populate('teamId')
      .populate('userId', 'id username');

    let currentPlayer = null;
    if (state.currentPlayerId) {
      currentPlayer = await Player.findById(state.currentPlayerId);
    }

    res.json({
      auction: {
        id: state._id,
        gameId: state.gameId,
        status: state.status,
        currentPlayer,
        currentBid: state.currentBid,
        highestBidderGameTeamId: state.highestBidderGameTeamId,
        timerEnd: state.timerEnd,
        round: state.round,
        log: state.logJson,
        remainingPlayers: state.playerPoolJson.length,
      },
      gameTeams,
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
