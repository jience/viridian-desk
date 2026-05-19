import '@/styles/index.scss';
import '@/utils/i18n';

import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { appStore } from './store';
import { setupServices } from './services';
import { logger } from '@/utils/logger';

function setupEnvLog() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const isHardwareAccelerated = !!gl;
  logger.debug('硬件加速是否启用:', isHardwareAccelerated);
}

function setupView() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={appStore}>
      <App />
    </Provider>,
  );
}

function main() {
  setupEnvLog();

  setupServices();

  setupView();
}

main();
