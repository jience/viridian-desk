import { ConfigProvider, App as ClientApp } from '@/ui';
import { IntlProvider } from 'react-intl';
import { RouterProvider } from 'react-router';
import router from './router';
import { useEffect } from 'react';
import { useAppSelector } from './store';
import { selectLanguage } from './store/feature/config';
import { UiThemeProvider } from '@/ui/theme/theme-provider';
import { LanguageType } from './native/interfaces/config';
import { logger } from '@/utils/logger';
import { ErrorBoundary } from '@/ui/shell/error-boundary';

const IS_THIN_CLIENT = import.meta.env.TAURI_IS_THIN_CLIENT === 'true';

function App() {
  const language = useAppSelector(selectLanguage);

  useEffect(() => {
    logger.debug('Client is thin: ?', IS_THIN_CLIENT);
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
            <ErrorBoundary>
              <RouterProvider router={router} />
            </ErrorBoundary>
          </IntlProvider>
        </ClientApp>
      </ConfigProvider>
    </UiThemeProvider>
  );
}

export default App;
