import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { readStoredUiTheme, writeStoredUiTheme } from './storage';
import type { ResolvedUiTheme, UiThemeContextValue, UiThemeMode } from './types';

export const UiThemeContext = createContext<UiThemeContextValue | null>(null);

function resolveTheme(mode: UiThemeMode, systemDark: boolean): ResolvedUiTheme {
  if (mode === 'system') return systemDark ? 'dark' : 'light';
  return mode;
}

export function UiThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<UiThemeMode>(() => readStoredUiTheme());
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  const resolvedTheme = useMemo(() => resolveTheme(mode, systemDark), [mode, systemDark]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.uiTheme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<UiThemeContextValue>(() => {
    return {
      mode,
      resolvedTheme,
      setMode: (nextMode) => {
        writeStoredUiTheme(nextMode);
        setModeState(nextMode);
      },
    };
  }, [mode, resolvedTheme]);

  return <UiThemeContext.Provider value={value}>{children}</UiThemeContext.Provider>;
}
