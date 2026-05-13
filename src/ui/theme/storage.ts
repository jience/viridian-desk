import type { UiThemeMode } from './types';

const STORAGE_KEY = 'viridian.ui.theme';

export function readStoredUiTheme(): UiThemeMode {
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
}

export function writeStoredUiTheme(mode: UiThemeMode) {
  window.localStorage.setItem(STORAGE_KEY, mode);
}
