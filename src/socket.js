import Pusher from 'pusher-js';

const PUSHER_KEY = '3f4db36d0b672bbceca9';
const PUSHER_CLUSTER = 'ap3';

let currentState = {
  votes: {},
  session: {
    status: 'voting',
    countdownEndAt: null
  }
};

const listeners = {};

// Initialize Pusher Realtime Client
const pusher = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  forceTLS: true
});

const channel = pusher.subscribe('voting-channel');

channel.bind('state_changed', (data) => {
  if (data) {
    currentState = data;
    emitLocal('state_changed', currentState);
  }
});

channel.bind('vote_error', (data) => {
  emitLocal('vote_error', data);
});

// Fetch initial state immediately on module load
fetchStateFromApi();

function emitLocal(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(data));
  }
}

async function fetchStateFromApi() {
  try {
    const res = await fetch(`/api/state?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    if (res.ok) {
      const data = await res.json();
      currentState = data;
      emitLocal('state_changed', currentState);
    }
  } catch (err) {
    emitLocal('state_changed', currentState);
  }
}

// Event bus wrapper compatible with Socket.io API
export const socket = {
  on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    // Instantly trigger current state on registration
    if (event === 'state_changed' && currentState) {
      callback(currentState);
    }
  },
  off(event, callback) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  },
  emit(event, data) {
    handleRestAction(event, data);
  }
};

// REST Fallback & Trigger Handler
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
      currentState = result;
      emitLocal('state_changed', result);
    }
  } catch (err) {
    emitLocal('vote_error', { message: '서버 통신에 실패했습니다.' });
  }
}

// Action Helpers
export function submitVote(userKey, votedTeam) {
  handleRestAction('vote_submit', { userKey, votedTeam });
}

export function resetVotes() {
  handleRestAction('admin_reset');
}

export function forceCountdown() {
  handleRestAction('admin_force_countdown');
}

export function forceEnd() {
  handleRestAction('admin_force_end');
}

// Backup sync interval every 2 seconds
setInterval(fetchStateFromApi, 2000);
