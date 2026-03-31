/**
 * socket.ts — The One True Socket
 * ─────────────────────────────────────────────────────────────────────────────
 * This file exports a SINGLE socket instance for the entire app.
 *
 * KEY RULES:
 *  - `io()` is called exactly once, at module load time.
 *  - `autoConnect: false` means it won't actually open a connection until
 *    `socket.connect()` is explicitly called (we do that in App.tsx after the
 *    auth boot check passes).
 *  - Components NEVER call `socket.connect()` or `socket.disconnect()`.
 *  - Components ONLY call `socket.on(event, handler)` to subscribe and MUST
 *    call `socket.off(event, handler)` in their useEffect cleanup to avoid
 *    stacking duplicate listeners across re-renders / navigations.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { io } from 'socket.io-client';
import { SOCKET_URL } from './contexts/AuthContext';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,        // We connect manually in App.tsx after auth check
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// ── Dev diagnostics (stripped in production builds) ──────────────────────────
if (import.meta.env.DEV) {
  socket.on('connect',         () => console.log('[socket] ✅ connected', socket.id));
  socket.on('disconnect',      (r) => console.log('[socket] ❌ disconnected:', r));
  socket.on('connect_error',   (e) => console.warn('[socket] connect_error:', e.message));
  socket.on('reconnect',       (n) => console.log(`[socket] 🔄 reconnected after ${n} attempts`));
  socket.on('reconnect_error', (e) => console.warn('[socket] reconnect_error:', e.message));
}

export default socket;
