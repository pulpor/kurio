import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initMocks } from './mocks/browser';

async function bootstrap() {
  try {
    await initMocks();
  } catch (err) {
    console.warn('MSW worker init deferred or skipped:', err);
  }
  createRoot(document.getElementById('root')!).render(<App />);
}

bootstrap();
