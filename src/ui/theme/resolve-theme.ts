import { ThemeType } from '@/native/interfaces/config';
import { getCurrentIsDark } from '@/theme/themeUtils';
import type { ResolvedUiTheme, UiThemeMode } from './types';

export function resolveTheme(mode: UiThemeMode, systemDark: boolean): ResolvedUiTheme {
  return getCurrentIsDark(mode as ThemeType, systemDark) ? 'dark' : 'light';
}
