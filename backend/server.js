require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { sequelize, Team, Player } = require('./models');
const auctionService = require('./services/auctionService');
const registerAuctionSocket = require('./socket/auctionSocket');

const teamsData = require('./data/teams');
const playersData = require('./data/players.json');

const app = express();
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

auctionService.setIO(io);
registerAuctionSocket(io);

// ── Express Middleware ────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/game'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/auction', require('./routes/auction'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Serve React Frontend (Production) ─────────────────────────────
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// ── DB Sync + Seed ────────────────────────────────────────────────
async function seedDatabase() {
  // Seed teams
  const existingTeams = await Team.count();
  if (existingTeams === 0) {
    console.log('[Seed] Seeding 10 IPL teams...');
    await Team.bulkCreate(teamsData);
    console.log('[Seed] Teams seeded.');
  }

  // Seed players
  const existingPlayers = await Player.count();
  if (existingPlayers === 0) {
    console.log('[Seed] Seeding players...');
    await Player.bulkCreate(playersData);
    console.log(`[Seed] ${playersData.length} players seeded.`);
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('[DB] SQLite connection established.');

    await sequelize.sync();
    console.log('[DB] Models synced.');

    await seedDatabase();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`\n🏏 IPL Auction Server running on http://localhost:${PORT}`);
      console.log(`   Socket.IO ready`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();
