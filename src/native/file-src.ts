export function convertNativeFileSrc(path: string) {
  const tauriInternals = (window as any).__TAURI_INTERNALS__;
  if (tauriInternals?.convertFileSrc) {
    return tauriInternals.convertFileSrc(path);
  }

  return path;
}
