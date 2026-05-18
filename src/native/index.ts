import { TauriAdapter } from './adapters/tauri';
import { ElectronAdapter } from './adapters/electron';
import type { INativeBridge } from './interfaces';
import { WebAdapter } from './adapters/web';
import { createBridgeProxy, globalInterceptors } from './interceptor';
import { logger } from '@/utils/logger';

let rawBridge: INativeBridge;

const isTauri = !!(window as any).__TAURI_INTERNALS__;
const isElectron = !!(window.navigator.userAgent.includes('Electron') || window.ipcRenderer);

if (isTauri) {
  logger.debug('[Bridge] Environment: Tauri');
  rawBridge = new TauriAdapter();
} else if (isElectron) {
  logger.debug('[Bridge] Environment: Electron');
  rawBridge = new ElectronAdapter();
} else {
  logger.debug('[Bridge] Environment: Web');
  rawBridge = new WebAdapter();
}

const bridge = createBridgeProxy(rawBridge);

export { bridge, globalInterceptors };
