import { io } from 'socket.io-client';

// Determine socket server URL (same host port 3001 or current host in dev proxy)
const socketUrl = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : 'http://localhost:4000';

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export function submitVote(userKey, votedTeam) {
  socket.emit('vote_submit', { userKey, votedTeam });
}

export function resetVotes() {
  socket.emit('admin_reset');
}

export function forceCountdown() {
  socket.emit('admin_force_countdown');
}

export function forceEnd() {
  socket.emit('admin_force_end');
}
