import { RouterProvider } from 'react-router';
import router from './router';
import { Suspense, useEffect } from 'react';
import { UiThemeProvider } from '@/ui/theme/theme-provider';
import { logger } from '@/utils/logger';
import { ErrorBoundary } from '@/ui/shell/error-boundary';
import { RouteFallback } from '@/ui/shell/route-fallback';
import { setupViewportScale } from '@/utils/setupViewportScale';
import { useAppDispatch } from '@/store';
import { setNetwork } from '@/store/feature/gateway';

const IS_THIN_CLIENT = import.meta.env.TAURI_IS_THIN_CLIENT === 'true';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    logger.debug('Client is thin: ?', IS_THIN_CLIENT);
    const disposeViewportScale = setupViewportScale();

    const handleNetworkChange = () => {
      dispatch(setNetwork(navigator.onLine));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || e.key === 'F12') {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    handleNetworkChange();
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      disposeViewportScale();
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [dispatch]);

  return (
    <UiThemeProvider>
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </UiThemeProvider>
  );
}

export default App;
