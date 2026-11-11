import { io } from 'socket.io-client';
import { WebSocket as EngineWebSocket } from 'engine.io-client';

// Reads globalThis.WebSocket at connect time so the MSW interceptor is always honoured.
class RuntimeWebSocket extends EngineWebSocket {
  createSocket(uri: string, protocols: string | string[] | undefined) {
    return new globalThis.WebSocket(uri, protocols);
  }
}

export const socket = io(window.location.origin, {
  transports: [RuntimeWebSocket as never],
  autoConnect: false,
  reconnectionDelay: 500,
});

const seenVersions = new Map<string, number>();

// Returns false for duplicated or older events so state never regresses.
export function isFreshEvent(key: string, version: number): boolean {
  if (version <= (seenVersions.get(key) ?? 0)) return false;
  seenVersions.set(key, version);
  return true;
}

export function clearSeenEvents() {
  seenVersions.clear();
}
