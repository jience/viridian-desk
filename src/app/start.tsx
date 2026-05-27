import ReactDOM from 'react-dom/client';

import { setupServices } from '@/services';
import { logger } from '@/utils/logger';

import App from './App';
import { AppProviders } from './providers/app-providers';

function setupEnvLog() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const isHardwareAccelerated = !!gl;
  logger.debug('硬件加速是否启用:', isHardwareAccelerated);
}

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <AppProviders>
      <App />
    </AppProviders>,
  );
}

function scheduleHardwareAccelerationLog() {
  const schedule =
    window.requestIdleCallback ??
    ((callback: IdleRequestCallback) => window.setTimeout(() => callback({} as IdleDeadline), 0));

  schedule(() => {
    setupEnvLog();
  });
}

export function startApp() {
  setupServices();

  renderApp();

  scheduleHardwareAccelerationLog();
}
