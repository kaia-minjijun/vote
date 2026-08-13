import { io } from 'socket.io-client';

const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

const isLocalEnv = typeof window !== 'undefined' && !isVercel && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.')
);

const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
const socketUrl = envSocketUrl || (isLocalEnv ? `${window.location.protocol}//${window.location.hostname}:4000` : null);

let isSocketConnected = false;
let pollingInterval = null;
const listeners = {};

export const rawSocket = socketUrl ? io(socketUrl, {
  autoConnect: true,
  reconnectionAttempts: 2,
  reconnectionDelay: 1000,
  timeout: 2000
}) : null;

if (rawSocket) {
  rawSocket.on('connect', () => {
    console.log('✅ Connected via Socket.io:', socketUrl);
    isSocketConnected = true;
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  });

  rawSocket.on('connect_error', () => {
    isSocketConnected = false;
    startPolling();
  });

  rawSocket.on('disconnect', () => {
    isSocketConnected = false;
    startPolling();
  });
} else {
  // Always poll when on Vercel domain
  startPolling();
}

function emitLocal(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(data));
  }
}

async function fetchStateFromApi() {
  try {
    const res = await fetch('/api/state');
    if (res.ok) {
      const data = await res.json();
      emitLocal('state_changed', data);
    }
  } catch (err) {
    // API polling error fallback
  }
}

function startPolling() {
  if (pollingInterval) return;
  fetchStateFromApi();
  pollingInterval = setInterval(fetchStateFromApi, 1000);
}

// Event bus wrapper for socket
export const socket = {
  on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    if (rawSocket && rawSocket.on) {
      rawSocket.on(event, callback);
    }
  },
  off(event, callback) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
    if (rawSocket && rawSocket.off) {
      rawSocket.off(event, callback);
    }
  },
  emit(event, data) {
    if (isSocketConnected && rawSocket) {
      rawSocket.emit(event, data);
    } else {
      handleRestAction(event, data);
    }
  }
};

// REST Fallback Action Handler
async function handleRestAction(event, data) {
  const action = event;
  const payload = data;

  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });

    const result = await res.json();

    if (!res.ok) {
      emitLocal('vote_error', { message: result.message || '요청 처리 실패' });
    } else {
      emitLocal('state_changed', result);
    }
  } catch (err) {
    emitLocal('vote_error', { message: '서버 통신에 실패했습니다.' });
  }
}

// Action Helpers
export function submitVote(userKey, votedTeam) {
  if (isSocketConnected && rawSocket) {
    rawSocket.emit('vote_submit', { userKey, votedTeam });
  } else {
    handleRestAction('vote_submit', { userKey, votedTeam });
  }
}

export function resetVotes() {
  if (isSocketConnected && rawSocket) {
    rawSocket.emit('admin_reset');
  } else {
    handleRestAction('admin_reset');
  }
}

export function forceCountdown() {
  if (isSocketConnected && rawSocket) {
    rawSocket.emit('admin_force_countdown');
  } else {
    handleRestAction('admin_force_countdown');
  }
}

export function forceEnd() {
  if (isSocketConnected && rawSocket) {
    rawSocket.emit('admin_force_end');
  } else {
    handleRestAction('admin_force_end');
  }
}

// Start polling fallback if not connected within 1 second
setTimeout(() => {
  if (!isSocketConnected) {
    startPolling();
  }
}, 1000);
