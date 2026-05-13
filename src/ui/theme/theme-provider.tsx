import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ThemeType } from '@/native/interfaces/config';
import { useAppDispatch, useAppSelector } from '@/store';
import { configTheme, selectTheme } from '@/store/feature/config';
import { UiThemeContext } from './context';
import { resolveTheme } from './resolve-theme';
import type { UiThemeContextValue, UiThemeMode } from './types';

export function UiThemeProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const mode = theme as UiThemeMode;
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
        dispatch(configTheme(nextMode as ThemeType));
      },
    };
  }, [dispatch, mode, resolvedTheme]);

  return <UiThemeContext.Provider value={value}>{children}</UiThemeContext.Provider>;
}
