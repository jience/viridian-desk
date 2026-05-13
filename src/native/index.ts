import { TauriAdapter } from './adapters/tauri';
import { ElectronAdapter } from './adapters/electron';
import type { INativeBridge } from './interfaces';
import { WebAdapter } from './adapters/web';
import { createBridgeProxy, globalInterceptors } from './interceptor';

let rawBridge: INativeBridge;

const isTauri = !!(window as any).__TAURI_INTERNALS__;
const isElectron = !!(window.navigator.userAgent.includes('Electron') || window.ipcRenderer);

if (isTauri) {
  console.log('[Bridge] Environment: Tauri');
  rawBridge = new TauriAdapter();
} else if (isElectron) {
  console.log('[Bridge] Environment: Electron');
  rawBridge = new ElectronAdapter();
} else {
  console.log('[Bridge] Environment: Web');
  rawBridge = new WebAdapter();
}

const bridge = createBridgeProxy(rawBridge);

export { bridge, globalInterceptors };
