import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import * as storage from '@/lib/storage';
import './index.css';

storage.init();

// Flush any debounced write before the tab goes away, so closing the app
// immediately after ticking something does not lose it.
window.addEventListener('pagehide', () => storage.flush());

const root = document.getElementById('root');
if (!root) throw new Error('#root missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
