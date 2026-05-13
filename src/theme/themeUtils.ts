import { ThemeType } from '@/native/interfaces/config';

/**
 * 应用 CSS 主题类
 * @param theme 主题类型
 * @param isDarkMode 系统是否为暗色模式（仅在 system 主题下使用）
 */
export const applyThemeClass = (theme: ThemeType, isDarkMode: boolean = false): void => {
  const { classList } = document.documentElement;
  const hasDarkClass = classList.contains('dark');

  let shouldAddDark = false;

  switch (theme) {
    case ThemeType.DARK:
      shouldAddDark = true;
      break;
    case ThemeType.LIGHT:
      shouldAddDark = false;
      break;
    case ThemeType.SYSTEM:
      shouldAddDark = isDarkMode;
      break;
  }

  if (shouldAddDark && !hasDarkClass) {
    classList.add('dark');
  } else if (!shouldAddDark && hasDarkClass) {
    classList.remove('dark');
  }
};

/**
 * 获取当前是否为暗色主题
 * @param theme 用户设置的主题类型
 * @param systemDarkMode 系统是否为暗色模式
 * @returns 是否为暗色主题
 */
export const getCurrentIsDark = (theme: ThemeType, systemDarkMode: boolean): boolean => {
  switch (theme) {
    case ThemeType.DARK:
      return true;
    case ThemeType.LIGHT:
      return false;
    case ThemeType.SYSTEM:
      return systemDarkMode;
    default:
      return false;
  }
};
