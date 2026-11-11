import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { socketHandlers } from './socketServer';

export const worker = setupWorker(...handlers, ...socketHandlers);

export async function initMocks() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
    quiet: true,
  });
}
