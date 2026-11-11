import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function initMocks(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check if Service Workers are supported in current browser/iframe context
  if (!('serviceWorker' in navigator)) {
    console.warn('[MSW] Service Worker is not supported in this environment, using direct API fallback.');
    (window as any).__MSW_ACTIVE__ = false;
    return false;
  }

  try {
    await (worker.start as any)({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      quiet: false,
    });
    console.log('[MSW] Mock Service Worker ready.');
    (window as any).__MSW_ACTIVE__ = true;
    return true;
  } catch (error) {
    console.warn('[MSW] Service Worker registration failed (likely iframe restriction). Falling back to direct in-memory API handlers:', error);
    (window as any).__MSW_ACTIVE__ = false;
    return false;
  }
}
