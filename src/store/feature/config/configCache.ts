import type { GetAppConfResp } from '@/native/interfaces/config';
import type { ConfigState } from './types';

const CONFIG_CACHE_KEY = 'viridian-desk:config';

const getLocalStorage = () => {
  if (typeof window === 'undefined') return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const toConfigState = (config: ConfigState | GetAppConfResp): ConfigState => {
  const { gateway: _gateway, ...configState } = config as GetAppConfResp;
  return configState;
};

export const readCachedConfig = (): Partial<ConfigState> => {
  const storage = getLocalStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(CONFIG_CACHE_KEY);
    if (!raw) return {};

    const cachedConfig = JSON.parse(raw);
    if (!cachedConfig || typeof cachedConfig !== 'object') return {};

    return cachedConfig as Partial<ConfigState>;
  } catch {
    return {};
  }
};

export const writeCachedConfig = (config: ConfigState | GetAppConfResp) => {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(CONFIG_CACHE_KEY, JSON.stringify(toConfigState(config)));
  } catch {
    // Cache writes are only a first-paint optimization; native config remains authoritative.
  }
};

export const patchCachedConfig = (patch: Partial<ConfigState>) => {
  if (!getLocalStorage()) return;

  writeCachedConfig({
    ...readCachedConfig(),
    ...patch,
  } as ConfigState);
};
