type TauriInternals = {
  convertFileSrc?: (path: string, protocol?: string) => string;
};

type TauriWindow = Window & {
  __TAURI_INTERNALS__?: TauriInternals;
};

export const getTauriInternals = () => {
  if (typeof window === 'undefined') return undefined;
  return (window as TauriWindow).__TAURI_INTERNALS__;
};

export const hasTauriInternals = () => Boolean(getTauriInternals());
