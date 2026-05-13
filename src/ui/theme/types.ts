export type UiThemeMode = 'light' | 'dark' | 'system';

export type ResolvedUiTheme = 'light' | 'dark';

export interface UiThemeContextValue {
  mode: UiThemeMode;
  resolvedTheme: ResolvedUiTheme;
  setMode: (mode: UiThemeMode) => void;
}
