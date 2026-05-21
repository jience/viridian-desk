export type PerformanceTier = 'standard' | 'low';

const PERFORMANCE_TIER_KEY = 'viridian.performanceTier';

const readStoredPerformanceTier = (): PerformanceTier | undefined => {
  try {
    const value = window.localStorage.getItem(PERFORMANCE_TIER_KEY);
    return value === 'low' || value === 'standard' ? value : undefined;
  } catch {
    return undefined;
  }
};

export const resolvePerformanceTier = (): PerformanceTier => {
  const storedTier = readStoredPerformanceTier();
  if (storedTier) return storedTier;

  const arch = String(import.meta.env.TAURI_ARCH || '').toLowerCase();
  const family = String(import.meta.env.TAURI_FAMILY || '').toLowerCase();
  const cores = window.navigator.hardwareConcurrency || 0;
  const memory = Number((window.navigator as Navigator & { deviceMemory?: number }).deviceMemory);
  const isArmLinux = family === 'unix' && /^(aarch64|arm|armv)/.test(arch);
  const isLowCore = cores > 0 && cores <= 4;
  const isLowMemory = Number.isFinite(memory) && memory > 0 && memory <= 4;

  if (isArmLinux || isLowCore || isLowMemory) {
    return 'low';
  }

  return 'standard';
};

export const applyInitialPerformanceTier = () => {
  const tier = resolvePerformanceTier();
  document.documentElement.dataset.performanceTier = tier;
  return tier;
};
