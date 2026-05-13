import type { ThemeConfig } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/store';
import { selectTheme } from '@/store/feature/config/configSlice';
import { lightAntdTheme, darkAntdTheme } from '@/theme/antdThemes';
import { applyThemeClass, getCurrentIsDark } from '@/theme/themeUtils';

export const useTheme = () => {
  const theme = useAppSelector(selectTheme);
  const [systemDarkMode, setSystemDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  // 计算当前是否为暗色主题
  const isDark = useMemo(() => getCurrentIsDark(theme, systemDarkMode), [theme, systemDarkMode]);

  // 根据当前主题返回对应的 Antd 主题配置
  const antdTheme: ThemeConfig = useMemo(() => {
    return isDark ? darkAntdTheme : lightAntdTheme;
  }, [isDark]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // 应用主题变化到 DOM
  useEffect(() => {
    applyThemeClass(theme, systemDarkMode);
  }, [theme, systemDarkMode]);

  return {
    antdTheme,
    isDark,
    theme,
  };
};
