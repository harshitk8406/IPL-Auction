/**
 * Socket.IO auction event handlers
 */
const jwt = require('jsonwebtoken');
const { User, GameTeam, Team } = require('../models');
const auctionService = require('../services/auctionService');
const { Game } = require('../models');

function verifySocketToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = function registerAuctionSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    const payload = verifySocketToken(token);
    if (!payload) return next(new Error('Invalid token'));
    const user = await User.findByPk(payload.id, { attributes: ['id', 'username'] });
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);

    // ── JOIN LOBBY ──────────────────────────────────────────────
    socket.on('join-lobby', async ({ gameId }) => {
      try {
        if (!gameId) return socket.emit('error', { message: 'gameId required' });

        const room = String(gameId);
        socket.join(room);
        socket.gameId = room;

        const game = await Game.findByPk(gameId);
        if (!game) return socket.emit('error', { message: 'Game not found' });

        const gameTeams = await GameTeam.findAll({
          where: { gameId },
          include: [
            { model: Team, as: 'Team' },
            { model: User, as: 'User', attributes: ['id', 'username'] },
          ],
          order: [['teamId', 'ASC']],
        });

        // Send current lobby state to the joining user
        socket.emit('lobby-state', {
          game: { id: game.id, lobbyCode: game.lobbyCode, status: game.status, hostUserId: game.hostUserId },
          gameTeams: gameTeams.map(serializeGameTeam),
        });

        // Announce to room
        io.to(String(gameId)).emit('user-joined', { username: socket.user.username, userId: socket.user.id });

        // If game is already in auction, send current state
        if (game.status === 'auction') {
          let live = auctionService.getLiveState(gameId);
          
          // Failsafe: if server restarted, in-memory state is lost. Re-initialize it.
          if (!live) {
            console.log(`[Socket] Re-initializing lost in-memory state for game ${gameId}`);
            live = await auctionService.initGame(gameId);
            // If it was in the middle of something, just nominate the next player to get things moving
            if (live) {
              setTimeout(() => auctionService.nominateNextPlayer(gameId), 2000);
            }
          }

          if (live) {
            socket.emit('auction-resumed', {
              status: live.status,
              currentPlayer: live.currentPlayer,
              currentBid: live.currentBid,
              highestBidder: live.highestBidder,
              timerEnd: live.timerEnd?.toISOString(),
              round: live.round,
              log: live.log.slice(0, 30),
              teamStates: [...live.teamStates.values()],
            });
          }
        }
      } catch (err) {
        console.error('[Socket] join-lobby error:', err);
        socket.emit('error', { message: 'Failed to join lobby' });
      }
    });

    // ── TEAM SELECTED ────────────────────────────────────────────
    socket.on('team-selected', async ({ gameId, teamId, gameTeamId }) => {
      try {
        const gameTeam = await GameTeam.findByPk(gameTeamId, {
          include: [
            { model: Team, as: 'Team' },
            { model: User, as: 'User', attributes: ['id', 'username'] },
          ],
        });
        if (!gameTeam) return;

        io.to(String(gameId)).emit('team-selected', {
          gameTeam: serializeGameTeam(gameTeam),
          userId: socket.user.id,
          username: socket.user.username,
        });
      } catch (err) {
        console.error('[Socket] team-selected error:', err);
      }
    });

    // ── START AUCTION ────────────────────────────────────────────
    socket.on('start-auction', async ({ gameId }) => {
      console.log(`[Socket] Received start-auction for gameId: ${gameId}`);
      try {
        const game = await Game.findByPk(gameId);
        if (!game) {
          console.log('[Socket] Game not found');
          return socket.emit('error', { message: 'Game not found' });
        }
        if (game.hostUserId !== socket.user.id) {
          console.log('[Socket] Only host can start');
          return socket.emit('error', { message: 'Only host can start' });
        }
        if (game.status !== 'auction') {
          console.log(`[Socket] Game not started via HTTP yet, status: ${game.status}`);
          return socket.emit('error', { message: 'Game not started via HTTP yet' });
        }

        // Initialize in-memory state
        console.log('[Socket] Initializing auction service for game', gameId);
        const live = await auctionService.initGame(gameId);
        if (!live) {
          console.log('[Socket] Failed to init auction');
          return socket.emit('error', { message: 'Failed to init auction' });
        }

        console.log('[Socket] Emit auction-started to room', String(gameId));
        io.to(String(gameId)).emit('auction-started', {
          message: 'Auction has begun!',
          teamStates: [...live.teamStates.values()],
        });

        // Start nominating first player after a short delay
        setTimeout(() => {
          console.log('[Socket] Nominating first player for', gameId);
          auctionService.nominateNextPlayer(gameId);
        }, 2000);
      } catch (err) {
        console.error('[Socket] start-auction error:', err);
        socket.emit('error', { message: 'Failed to start auction' });
      }
    });

    // ── PLACE BID (via socket) ───────────────────────────────────
    socket.on('place-bid', async ({ gameId, gameTeamId, amount }) => {
      try {
        if (!gameId || !gameTeamId || !amount) {
          return socket.emit('error', { message: 'Missing bid parameters' });
        }

        // Verify user owns this gameTeam
        const gameTeam = await GameTeam.findByPk(gameTeamId);
        if (!gameTeam) return socket.emit('error', { message: 'Team not found' });
        if (gameTeam.userId !== socket.user.id) {
          return socket.emit('error', { message: 'Not your team' });
        }

        const result = await auctionService.placeBid(gameId, gameTeamId, parseInt(amount), false);
        if (!result.success) {
          return socket.emit('bid-error', { message: result.error });
        }
      } catch (err) {
        console.error('[Socket] place-bid error:', err);
        socket.emit('error', { message: 'Failed to place bid' });
      }
    });

    // ── DISCONNECT ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.user?.username}`);
      if (socket.gameId) {
        socket.to(String(socket.gameId)).emit('user-left', {
          username: socket.user?.username,
          userId: socket.user?.id,
        });
      }
    });
  });
};

function serializeGameTeam(gt) {
  return {
    id: gt.id,
    teamId: gt.teamId,
    userId: gt.userId,
    isAI: gt.isAI,
    purseRemaining: gt.purseRemaining,
    squadSize: gt.squadSize,
    overseasCount: gt.overseasCount,
    Team: gt.Team ? {
      id: gt.Team.id,
      name: gt.Team.name,
      shortName: gt.Team.shortName,
      primaryColor: gt.Team.primaryColor,
      secondaryColor: gt.Team.secondaryColor,
      city: gt.Team.city,
      logoInitials: gt.Team.logoInitials,
    } : null,
    User: gt.User ? { id: gt.User.id, username: gt.User.username } : null,
  };
}
