import '@/styles/index.scss';
import '@/utils/i18n';

import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { appStore } from './store';
import zhCN from '@/locales/zh-CN';
import zhTW from '@/locales/zh-TW';
import en from '@/locales/en-US';
import { setupServices } from './services';

function setupEnvLog() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const isHardwareAccelerated = !!gl;
  console.log('硬件加速是否启用:', isHardwareAccelerated);
}

function setupOldLang() {
  const LanguageData: any = {
    'en-US': { ...en },
    'zh-CN': { ...zhCN },
    'zh-TW': { ...zhTW },
  };

  window.LanguageData = LanguageData;
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
  setupOldLang();

  setupServices();

  setupView();
}

main();
