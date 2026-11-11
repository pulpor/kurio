import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';

type Conn = ReturnType<typeof toSocketIo>;

// MSW strips the "/socket.io/" prefix before matching, so the link targets the bare origin.
const link = ws.link(window.location.origin.replace(/^http/, 'ws'));
const clients = new Map<Conn, string | null>();

export const socketHandlers = [
  link.addEventListener('connection', (connection) => {
    // Other sockets (e.g. Vite HMR in dev) go through untouched.
    if (!connection.client.url.pathname.startsWith('/socket.io')) {
      connection.server.connect();
      return;
    }
    const io = toSocketIo(connection);
    clients.set(io, null);
    // Subscriptions are scoped per user so private events never reach another session.
    io.client.on('subscribe', (_event, userId) => clients.set(io, userId ?? null));
    connection.client.addEventListener('close', () => clients.delete(io));
  }),
];

export function broadcast(event: string, data: unknown, userId?: string) {
  clients.forEach((subscribedUser, io) => {
    if (userId && subscribedUser !== userId) return;
    io.client.emit(event, data);
  });
}
