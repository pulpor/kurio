import { NFTUpdatedEvent, OrderUpdatedEvent } from '../types';

type EventHandler = (...args: any[]) => void;

class MockSocketClient {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  public connected: boolean = true;
  private processedVersions: Map<string, number> = new Map(); // entityKey -> version

  constructor() {
    // Listen to window custom events so MSW or developer panel can dispatch mock network events
    if (typeof window !== 'undefined') {
      window.addEventListener('aetheria:socket_event', (e: any) => {
        if (!this.connected) return;
        const { event, data } = e.detail;
        this.dispatch(event, data);
      });
    }
  }

  public on(event: string, handler: EventHandler): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return this;
  }

  public off(event: string, handler?: EventHandler): this {
    if (!handler) {
      this.listeners.delete(event);
    } else {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    }
    return this;
  }

  public emit(event: string, ...args: any[]): this {
    // In mock client, if client emits an action, dispatch or acknowledge
    return this;
  }

  public connect(): void {
    if (!this.connected) {
      this.connected = true;
      this.dispatch('connect', {});
      this.dispatch('reconnect', {});
    }
  }

  public disconnect(): void {
    if (this.connected) {
      this.connected = false;
      this.dispatch('disconnect', 'io client disconnect');
    }
  }

  public dispatch(event: string, data: any): void {
    if (!this.connected) return;

    // Version deduplication check for ordered real-time events
    if (event === 'nft.updated') {
      const payload = data as NFTUpdatedEvent;
      const key = `nft:${payload.nftId}`;
      const lastVersion = this.processedVersions.get(key) || 0;
      if (payload.version <= lastVersion) {
        console.warn(`[Socket.IO] Dropped duplicate or stale nft.updated: version ${payload.version} <= ${lastVersion}`);
        return;
      }
      this.processedVersions.set(key, payload.version);
    } else if (event === 'order.updated') {
      const payload = data as OrderUpdatedEvent;
      const key = `order:${payload.orderId}`;
      const lastVersion = this.processedVersions.get(key) || 0;
      if (payload.version <= lastVersion) {
        console.warn(`[Socket.IO] Dropped duplicate or stale order.updated: version ${payload.version} <= ${lastVersion}`);
        return;
      }
      this.processedVersions.set(key, payload.version);
    }

    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`Error in Socket.IO handler for ${event}:`, err);
        }
      });
    }
  }

  public clearProcessedVersions(): void {
    this.processedVersions.clear();
  }
}

// Singleton socket client
export const socket = new MockSocketClient();

/**
 * Dispatch an event as if received from the remote Socket.IO server
 */
export function emitMockSocketEvent(event: 'nft.updated' | 'order.updated' | string, data: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aetheria:socket_event', {
        detail: { event, data },
      })
    );
  }
}
