import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

import Pusher from 'pusher';

const pusher = new Pusher({
  appId: '1789012',
  key: '3f4db36d0b672bbceca9',
  secret: '67efb51e0ff0498b87d6',
  cluster: 'ap3',
  useTLS: true
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Data file directory
const DATA_DIR = path.join(__dirname, 'data');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state
let db = {
  votes: {},
  session: {
    status: 'voting', // 'voting' | 'counting' | 'ended'
    countdownEndAt: null
  }
};

// Load existing state from disk if available
if (fs.existsSync(VOTES_FILE)) {
  try {
    const raw = fs.readFileSync(VOTES_FILE, 'utf-8');
    db = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load votes.json, using initial state:', err);
  }
}

function saveDB() {
  try {
    fs.writeFileSync(VOTES_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to write votes.json:', err);
  }
}

// Find local IP address on LAN
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
let countdownTimer = null;

function broadcastState() {
  io.emit('state_changed', { ...db, localIP });
  pusher.trigger('voting-channel', 'state_changed', { ...db, localIP }).catch(() => {});
}

function triggerCountdown() {
  if (db.session.status === 'counting') return;
  
  db.session.status = 'counting';
  db.session.countdownEndAt = Date.now() + 10000;
  saveDB();
  broadcastState();

  if (countdownTimer) clearTimeout(countdownTimer);
  countdownTimer = setTimeout(() => {
    db.session.status = 'ended';
    db.session.countdownEndAt = null;
    saveDB();
    broadcastState();
  }, 10000);
}

// API endpoint for server info
app.get('/api/info', (req, res) => {
  res.json({
    localIP,
    port: 3000,
    serverPort: 3001,
    voteUrl: `http://${localIP}:3000/vote`
  });
});

// API endpoint for state GET
app.get('/api/state', (req, res) => {
  res.json({ ...db, localIP });
});

// API endpoint for state POST
app.post('/api/state', (req, res) => {
  const { action, payload } = req.body || {};
  if (action === 'vote_submit') {
    const { userKey, votedTeam } = payload || {};
    if (db.session.status !== 'voting') {
      return res.status(400).json({ message: '투표가 마감되어 조를 변경할 수 없습니다.' });
    }
    if (!userKey || !votedTeam) {
      return res.status(400).json({ message: '잘못된 투표 요청입니다.' });
    }
    const assignedTeam = parseInt(userKey.split('_')[0], 10);
    if (assignedTeam === parseInt(votedTeam, 10)) {
      return res.status(400).json({ message: '자신이 속한 조에는 투표할 수 없습니다.' });
    }
    db.votes[userKey] = {
      votedTeam: parseInt(votedTeam, 10),
      updatedAt: Date.now()
    };
    if (Object.keys(db.votes).length >= 44 && db.session.status === 'voting') {
      triggerCountdown();
    }
    saveDB();
    io.emit('state_changed', { ...db, localIP });
    return res.json({ success: true, ...db });
  }

  if (action === 'admin_reset') {
    if (countdownTimer) clearTimeout(countdownTimer);
    db.votes = {};
    db.session.status = 'voting';
    db.session.countdownEndAt = null;
    saveDB();
    io.emit('state_changed', { ...db, localIP });
    return res.json({ success: true, ...db });
  }

  if (action === 'admin_force_countdown') {
    triggerCountdown();
    return res.json({ success: true, ...db });
  }

  if (action === 'admin_force_end') {
    if (countdownTimer) clearTimeout(countdownTimer);
    db.session.status = 'ended';
    db.session.countdownEndAt = null;
    saveDB();
    io.emit('state_changed', { ...db, localIP });
    return res.json({ success: true, ...db });
  }

  res.status(400).json({ message: 'Unknown action' });
});

io.on('connection', (socket) => {
  // Send current state on connection
  socket.emit('state_changed', { ...db, localIP });

  // Handle vote submit
  socket.on('vote_submit', ({ userKey, votedTeam }) => {
    // Lock voting if counting or ended
    if (db.session.status !== 'voting') {
      socket.emit('vote_error', { message: '투표가 마감되어 조를 변경할 수 없습니다.' });
      return;
    }

    if (!userKey || !votedTeam) {
      socket.emit('vote_error', { message: '잘못된 투표 요청입니다.' });
      return;
    }

    // Check own team vote restriction
    const assignedTeam = parseInt(userKey.split('_')[0], 10);
    if (assignedTeam === parseInt(votedTeam, 10)) {
      socket.emit('vote_error', { message: '자신이 속한 조에는 투표할 수 없습니다.' });
      return;
    }

    // Save vote
    db.votes[userKey] = {
      votedTeam: parseInt(votedTeam, 10),
      updatedAt: Date.now()
    };

    saveDB();
    io.emit('state_changed', { ...db, localIP });

    // Check if 44 votes reached
    if (Object.keys(db.votes).length >= 44 && db.session.status === 'voting') {
      triggerCountdown();
    }
  });

  // Admin reset
  socket.on('admin_reset', () => {
    if (countdownTimer) clearTimeout(countdownTimer);
    db.votes = {};
    db.session.status = 'voting';
    db.session.countdownEndAt = null;
    saveDB();
    io.emit('state_changed', { ...db, localIP });
  });

  // Admin trigger countdown
  socket.on('admin_force_countdown', () => {
    triggerCountdown();
  });

  // Admin force end
  socket.on('admin_force_end', () => {
    if (countdownTimer) clearTimeout(countdownTimer);
    db.session.status = 'ended';
    db.session.countdownEndAt = null;
    saveDB();
    io.emit('state_changed', { ...db, localIP });
  });
});

const PORT = 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 로컬 투표 서버가 성공적으로 실행되었습니다!`);
  console.log(`📡 서버 API/WebSocket: http://localhost:${PORT}`);
  console.log(`📱 모바일 접속 URL: http://${localIP}:3000/vote`);
  console.log(`=======================================================`);
});
