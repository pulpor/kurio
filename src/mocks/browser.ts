import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function initMocks() {
  if (typeof window === 'undefined') return;

  try {
    await (worker.start as any)({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('[MSW] Mock Service Worker ready.');
  } catch (error) {
    console.error('[MSW] Failed to initialize worker:', error);
  }
}
