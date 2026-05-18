import { ConfigProvider, App as ClientApp } from '@/ui';
import { IntlProvider } from 'react-intl';
import { RouterProvider } from 'react-router';
import router from './router';
import { useEffect } from 'react';
import { useAppSelector } from './store';
import { selectLanguage } from './store/feature/config';
import { UiThemeProvider } from '@/ui/theme/theme-provider';
import { LanguageType } from './native/interfaces/config';

const IS_THIN_CLIENT = import.meta.env.TAURI_IS_THIN_CLIENT === 'true';

function App() {
  const language = useAppSelector(selectLanguage);

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
      <ConfigProvider>
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
