import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as storage from '@/lib/storage';
import './index.css';

storage.init();

// Flush any debounced write before the tab goes away, so closing the app
// immediately after ticking something does not lose it.
window.addEventListener('pagehide', () => storage.flush());

// Coming back to the tab pulls the server copy, so progress ticked on the
// phone shows on the PC (and the other way round) without a reload.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') storage.pullIfIdle();
});
window.addEventListener('focus', () => storage.pullIfIdle());

const root = document.getElementById('root');
if (!root) throw new Error('#root missing from index.html');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
