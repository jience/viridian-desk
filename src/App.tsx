import { ConfigProvider, App as ClientApp } from '@/ui';
import { RouterProvider } from 'react-router';
import router from './router';
import { useEffect } from 'react';
import { UiThemeProvider } from '@/ui/theme/theme-provider';
import { logger } from '@/utils/logger';
import { ErrorBoundary } from '@/ui/shell/error-boundary';

const IS_THIN_CLIENT = import.meta.env.TAURI_IS_THIN_CLIENT === 'true';

function App() {
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
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </ClientApp>
      </ConfigProvider>
    </UiThemeProvider>
  );
}

export default App;
