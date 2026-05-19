import { convertFileSrc } from '@tauri-apps/api/core';

export function convertNativeFileSrc(path: string) {
  if ((window as any).__TAURI_INTERNALS__) {
    return convertFileSrc(path);
  }

  return path;
}
