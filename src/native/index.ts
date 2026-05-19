import type { INativeBridge } from './interfaces';
import { createBridgeProxy, globalInterceptors } from './interceptor';
import { logger } from '@/utils/logger';

const isTauri = !!(window as any).__TAURI_INTERNALS__;
const isElectron = !!(window.navigator.userAgent.includes('Electron') || window.ipcRenderer);

let bridgePromise: Promise<INativeBridge> | null = null;

const loadBridge = async (): Promise<INativeBridge> => {
  if (isTauri) {
    logger.debug('[Bridge] Environment: Tauri');
    const { TauriAdapter } = await import('./adapters/tauri');
    return createBridgeProxy(new TauriAdapter());
  }

  if (isElectron) {
    logger.debug('[Bridge] Environment: Electron');
    const { ElectronAdapter } = await import('./adapters/electron');
    return createBridgeProxy(new ElectronAdapter());
  }

  logger.debug('[Bridge] Environment: Web');
  const { WebAdapter } = await import('./adapters/web');
  return createBridgeProxy(new WebAdapter());
};

const getBridge = () => {
  bridgePromise ??= loadBridge();
  return bridgePromise;
};

const resolvePath = (target: any, path: PropertyKey[]) =>
  path.reduce((value, key) => value?.[key], target);

const createLazyBridgeProxy = (path: PropertyKey[] = []): any =>
  new Proxy(() => {}, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      return createLazyBridgeProxy([...path, prop]);
    },
    apply(_target, _thisArg, args) {
      return getBridge().then((loadedBridge) => {
        const value = resolvePath(loadedBridge, path);
        return typeof value === 'function' ? value(...args) : value;
      });
    },
  });

const bridge = createLazyBridgeProxy() as INativeBridge;

export { bridge, globalInterceptors };
