/**
 * Auction Service — Core auction state management
 * Uses in-memory state (Map) per game for speed,
 * persisting key events to SQLite.
 */

const { AuctionState, GameTeam, Player, Squad, Game, Team, User } = require('../models');
const { getAIDecision, getBidIncrement } = require('./aiService');

const BID_TIMER_SECONDS = 20;
const RESET_TIMER_SECONDS = 12;
const AI_BID_DELAY_MIN = 1800;
const AI_BID_DELAY_MAX = 4500;

class AuctionService {
  constructor() {
    this.io = null;
    // Map<gameId, liveState>
    this.liveGames = new Map();
  }

  setIO(io) {
    this.io = io;
  }

  emit(gameId, event, data) {
    if (this.io) this.io.to(String(gameId)).emit(event, data);
  }

  /**
   * Initialise in-memory state for a game when auction starts.
   */
  async initGame(gameId) {
    const auctionState = await AuctionState.findOne({ where: { gameId } });
    if (!auctionState) return null;

    const gameTeams = await GameTeam.findAll({
      where: { gameId },
      include: [
        { model: Team, as: 'Team' },
        { model: User, as: 'User', attributes: ['id', 'username'] },
      ],
    });

    const teamStates = new Map();
    for (const gt of gameTeams) {
      teamStates.set(gt.id, {
        id: gt.id,
        teamId: gt.teamId,
        teamName: gt.Team.shortName,
        teamColor: gt.Team.primaryColor,
        userId: gt.userId,
        isAI: gt.isAI,
        purseRemaining: gt.purseRemaining,
        squadSize: gt.squadSize,
        overseasCount: gt.overseasCount,
        roleBreakdown: { Batsman: 0, Bowler: 0, 'All-Rounder': 0, Wicketkeeper: 0 },
      });
    }

    const live = {
      gameId,
      status: 'nominating',
      playerPool: [...auctionState.playerPoolJson],
      currentPlayer: null,
      currentBid: 0,
      highestBidder: null, // gameTeamId
      timerRef: null,
      timerEnd: null,
      log: [],
      round: 0,
      teamStates,
      pendingAIBids: new Map(), // gameTeamId -> timeoutRef
    };

    this.liveGames.set(gameId, live);
    return live;
  }

  /**
   * Nominate the next player from the pool.
   */
  async nominateNextPlayer(gameId) {
    console.log(`[AuctionService] nominateNextPlayer called for gameId: ${gameId}`);
    const live = this.liveGames.get(gameId);
    if (!live) {
      console.log(`[AuctionService] live state not found for ${gameId}`);
      return;
    }

    // Clear any pending timers
    this._clearTimer(live);
    this._clearAIPendingBids(live);

    if (live.playerPool.length === 0) {
      return this._completeAuction(gameId);
    }

    // Check if all teams are at max squad — end auction
    const allFull = [...live.teamStates.values()].every(ts => ts.squadSize >= 25);
    if (allFull) return this._completeAuction(gameId);

    const playerId = live.playerPool.shift();
    const player = await Player.findByPk(playerId);
    if (!player) return this.nominateNextPlayer(gameId); // skip missing player

    live.currentPlayer = player;
    live.currentBid = player.basePrice;
    live.highestBidder = null;
    live.status = 'bidding';
    live.round++;

    const timerEnd = new Date(Date.now() + BID_TIMER_SECONDS * 1000);
    live.timerEnd = timerEnd;

    // Persist to DB
    const auctionState = await AuctionState.findOne({ where: { gameId } });
    if (auctionState) {
      await auctionState.update({
        status: 'bidding',
        currentPlayerId: player.id,
        currentBid: player.basePrice,
        highestBidderGameTeamId: null,
        timerEnd,
        round: live.round,
        playerPoolJson: live.playerPool,
      });
    }

    const nominatingTeam = this._getRandomTeamForDisplay(live);

    console.log(`[AuctionService] Emitting player-nominated for ${player.name} to gameId ${gameId}`);
    this.emit(gameId, 'player-nominated', {
      player: player.toJSON(),
      currentBid: player.basePrice,
      timerEnd: timerEnd.toISOString(),
      nominatingTeam,
      round: live.round,
      remainingPlayers: live.playerPool.length + 1,
    });

    // Start countdown timer
    live.timerRef = this._startTimer(gameId, BID_TIMER_SECONDS);

    // Schedule AI bids
    this._scheduleAIBids(gameId);
  }

  _getRandomTeamForDisplay(live) {
    const teams = [...live.teamStates.values()];
    if (teams.length === 0) return null;
    const t = teams[Math.floor(Math.random() * teams.length)];
    return { id: t.id, name: t.teamName, color: t.teamColor };
  }

  /**
   * Place a bid (human or AI).
   */
  async placeBid(gameId, gameTeamId, amount, isAI = false) {
    const live = this.liveGames.get(gameId);
    if (!live) return { success: false, error: 'Auction not active' };
    if (live.status !== 'bidding') return { success: false, error: 'Not in bidding phase' };
    if (!live.currentPlayer) return { success: false, error: 'No player nominated' };

    const teamState = live.teamStates.get(gameTeamId);
    if (!teamState) return { success: false, error: 'Team not in game' };

    // Validation
    if (amount <= live.currentBid) return { success: false, error: 'Bid must exceed current bid' };
    if (amount > teamState.purseRemaining) return { success: false, error: 'Insufficient purse' };

    const minNextBid = live.currentBid + getBidIncrement(live.currentBid);
    if (amount < minNextBid) return { success: false, error: `Minimum bid increment: ${minNextBid}L` };

    // Can't bid on yourself if you're already highest bidder
    if (live.highestBidder === gameTeamId) return { success: false, error: 'You are already the highest bidder' };

    // Apply bid
    live.currentBid = amount;
    live.highestBidder = gameTeamId;

    // Reset timer
    const newTimerEnd = new Date(Date.now() + RESET_TIMER_SECONDS * 1000);
    live.timerEnd = newTimerEnd;
    this._clearTimer(live);
    live.timerRef = this._startTimer(gameId, RESET_TIMER_SECONDS);

    this.emit(gameId, 'bid-placed', {
      gameTeamId,
      teamName: teamState.teamName,
      teamColor: teamState.teamColor,
      amount,
      timerEnd: newTimerEnd.toISOString(),
      isAI,
    });

    // Re-schedule AI bids (other AI teams respond)
    this._scheduleAIBids(gameId, gameTeamId);

    return { success: true, currentBid: amount };
  }

  _scheduleAIBids(gameId, excludeTeamId = null) {
    const live = this.liveGames.get(gameId);
    if (!live) return;

    // Cancel old AI timers
    this._clearAIPendingBids(live);

    const aiTeams = [...live.teamStates.values()].filter(
      (ts) => ts.isAI && ts.id !== excludeTeamId && ts.id !== live.highestBidder
    );

    // Shuffle AI teams for random bidding order
    aiTeams.sort(() => Math.random() - 0.5);

    let delay = AI_BID_DELAY_MIN;
    for (const aiTeam of aiTeams) {
      const decision = getAIDecision(
        aiTeam,
        live.currentPlayer,
        live.currentBid,
        live.teamStates
      );

      if (decision.shouldBid) {
        const t = setTimeout(async () => {
          const currentLive = this.liveGames.get(gameId);
          if (!currentLive || currentLive.status !== 'bidding') return;
          if (currentLive.highestBidder === aiTeam.id) return;
          await this.placeBid(gameId, aiTeam.id, decision.bidAmount, true);
        }, delay + Math.floor(Math.random() * 800));

        live.pendingAIBids.set(aiTeam.id, t);
        delay += AI_BID_DELAY_MIN + Math.floor(Math.random() * (AI_BID_DELAY_MAX - AI_BID_DELAY_MIN));
      }
    }
  }

  _startTimer(gameId, seconds) {
    const live = this.liveGames.get(gameId);
    let remaining = seconds;

    const tickInterval = setInterval(() => {
      const currentLive = this.liveGames.get(gameId);
      if (!currentLive || currentLive.timerRef !== tickInterval) {
        clearInterval(tickInterval);
        return;
      }
      remaining--;
      this.emit(gameId, 'timer-tick', { seconds: remaining });

      if (remaining <= 0) {
        clearInterval(tickInterval);
        this._hammerDown(gameId);
      }
    }, 1000);

    return tickInterval;
  }

  _clearTimer(live) {
    if (live.timerRef) {
      clearInterval(live.timerRef);
      live.timerRef = null;
    }
  }

  _clearAIPendingBids(live) {
    for (const [, t] of live.pendingAIBids) clearTimeout(t);
    live.pendingAIBids.clear();
  }

  /**
   * Timer expired — sell or mark as unsold.
   */
  async _hammerDown(gameId) {
    const live = this.liveGames.get(gameId);
    if (!live || live.status !== 'bidding') return;

    live.status = 'sold';
    this._clearAIPendingBids(live);

    const { currentPlayer, currentBid, highestBidder } = live;

    if (!highestBidder) {
      // No bids — player unsold
      const logEntry = {
        type: 'unsold',
        player: currentPlayer.toJSON ? currentPlayer.toJSON() : currentPlayer,
        timestamp: new Date().toISOString(),
      };
      live.log.unshift(logEntry);

      await this._persistAuctionState(gameId, live, 'unsold');

      this.emit(gameId, 'player-unsold', {
        player: currentPlayer.toJSON ? currentPlayer.toJSON() : currentPlayer,
        log: logEntry,
      });
    } else {
      // Sold!
      const winnerState = live.teamStates.get(highestBidder);
      winnerState.purseRemaining -= currentBid;
      winnerState.squadSize++;

      if (currentPlayer.nationality === 'Overseas') {
        winnerState.overseasCount++;
      }
      if (winnerState.roleBreakdown[currentPlayer.role] !== undefined) {
        winnerState.roleBreakdown[currentPlayer.role]++;
      }

      // Persist to DB
      try {
        await GameTeam.update(
          {
            purseRemaining: winnerState.purseRemaining,
            squadSize: winnerState.squadSize,
            overseasCount: winnerState.overseasCount,
          },
          { where: { id: highestBidder } }
        );

        await Squad.create({
          gameId,
          gameTeamId: highestBidder,
          playerId: currentPlayer.id,
          soldPrice: currentBid,
        });
      } catch (e) {
        console.error('DB persist error on hammer down:', e);
      }

      const logEntry = {
        type: 'sold',
        player: currentPlayer.toJSON ? currentPlayer.toJSON() : currentPlayer,
        soldTo: { id: highestBidder, name: winnerState.teamName, color: winnerState.teamColor },
        soldPrice: currentBid,
        timestamp: new Date().toISOString(),
      };
      live.log.unshift(logEntry);

      await this._persistAuctionState(gameId, live, 'sold');

      this.emit(gameId, 'player-sold', {
        player: currentPlayer.toJSON ? currentPlayer.toJSON() : currentPlayer,
        soldTo: { id: highestBidder, name: winnerState.teamName, color: winnerState.teamColor },
        soldPrice: currentBid,
        teamPurse: winnerState.purseRemaining,
        teamSquadSize: winnerState.squadSize,
        log: logEntry,
      });
    }

    // Short pause, then nominate next
    setTimeout(() => this.nominateNextPlayer(gameId), 3000);
  }

  async _persistAuctionState(gameId, live, status) {
    try {
      const auctionState = await AuctionState.findOne({ where: { gameId } });
      if (auctionState) {
        await auctionState.update({
          status,
          currentPlayerId: live.currentPlayer?.id || null,
          currentBid: live.currentBid,
          highestBidderGameTeamId: live.highestBidder || null,
          logJson: live.log.slice(0, 100),
          playerPoolJson: live.playerPool,
        });
      }
    } catch (e) {
      console.error('Persist error:', e);
    }
  }

  async _completeAuction(gameId) {
    const live = this.liveGames.get(gameId);
    if (!live) return;

    live.status = 'complete';
    this._clearTimer(live);
    this._clearAIPendingBids(live);

    try {
      await Game.update({ status: 'complete' }, { where: { id: gameId } });
      const auctionState = await AuctionState.findOne({ where: { gameId } });
      if (auctionState) await auctionState.update({ status: 'complete' });
    } catch (e) {
      console.error('Complete auction persist error:', e);
    }

    const finalGameTeams = await GameTeam.findAll({
      where: { gameId },
      include: [{ model: Team, as: 'Team' }, { model: User, as: 'User', attributes: ['id', 'username'] }],
    });

    this.emit(gameId, 'auction-complete', {
      gameTeams: finalGameTeams.map((gt) => ({
        id: gt.id,
        teamName: gt.Team.name,
        shortName: gt.Team.shortName,
        primaryColor: gt.Team.primaryColor,
        userId: gt.userId,
        isAI: gt.isAI,
        purseRemaining: gt.purseRemaining,
        squadSize: gt.squadSize,
      })),
    });

    // Clean up in-memory state after a delay
    setTimeout(() => this.liveGames.delete(gameId), 60000);
  }

  getLiveState(gameId) {
    return this.liveGames.get(gameId);
  }
}

module.exports = new AuctionService();
