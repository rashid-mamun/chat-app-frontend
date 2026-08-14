import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.jsx';

// Register PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
})
import ErrorBoundary from './components/shared/ErrorBoundary';

// ── Apply saved theme BEFORE first render to avoid flash ──
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
