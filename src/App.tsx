import { ConfigProvider, App as ClientApp } from 'antd';
import { IntlProvider } from 'react-intl';
import { RouterProvider } from 'react-router';
import router from './router';
import { useEffect, useMemo } from 'react';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';
import { useAppSelector } from './store';
import { selectLanguage } from './store/feature/config';
import { useTheme } from '@/theme/useTheme';
import { UiThemeProvider } from '@/ui/theme/theme-provider';
import { LanguageType } from './native/interfaces/config';

const IS_THIN_CLIENT = import.meta.env.TAURI_IS_THIN_CLIENT === 'true';

function App() {
  const language = useAppSelector(selectLanguage);
  const { antdTheme } = useTheme();

  const lang = useMemo(() => {
    if (language === LanguageType.ZH_CN) {
      return zhCN;
    } else if (language === LanguageType.ZH_TW) {
      return zhTW;
    } else if (language === LanguageType.EN_US) {
      return enUS;
    } else {
      return zhCN;
    }
  }, [language]);

  useEffect(() => {
    console.log('Client is thin: ?', IS_THIN_CLIENT);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || e.key === 'F12') {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <UiThemeProvider>
      <ConfigProvider
        locale={lang}
        theme={{ ...antdTheme, zeroRuntime: true, hashed: false, cssVar: { key: 'client-css-var' } }}
        button={{ autoInsertSpace: false }}
        modal={{ centered: true }}
        form={{ colon: false }}
      >
        <ClientApp component={false}>
          <IntlProvider
            locale={language}
            messages={window.LanguageData[language] ?? window.LanguageData[LanguageType.ZH_CN]}
          >
            <RouterProvider router={router} />
          </IntlProvider>
        </ClientApp>
      </ConfigProvider>
    </UiThemeProvider>
  );
}

export default App;
