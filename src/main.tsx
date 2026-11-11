import { createRoot } from 'react-dom/client';
import './index.css';
import { initMocks } from './mocks/browser';

// socket.io-client captures the global WebSocket on import, so App loads only after MSW patches it.
initMocks()
  .then(() => import('./App'))
  .then(({ default: App }) => createRoot(document.getElementById('root')!).render(<App />));
