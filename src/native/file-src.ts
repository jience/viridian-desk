import { getTauriInternals } from './tauri-globals';

export function convertNativeFileSrc(path: string) {
  const tauriInternals = getTauriInternals();
  if (tauriInternals?.convertFileSrc) {
    return tauriInternals.convertFileSrc(path);
  }

  return path;
}
