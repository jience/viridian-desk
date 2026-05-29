import { RouterProvider } from 'react-router';
import router from './router';
import { Suspense, useEffect } from 'react';
import { UiThemeProvider } from '@/shared/ui/theme/theme-provider';
import { logger } from '@/utils/logger';
import { ErrorBoundary } from '@/shared/ui/shell/error-boundary';
import { RouteFallback } from '@/shared/ui/shell/route-fallback';
import { setupViewportScale } from '@/utils/setupViewportScale';
import { useAppDispatch } from '@/store';
import { setConnected, setNetwork } from '@/store/feature/gateway';
import { DeveloperModeOverlay } from '@/features/shell/components/developer-mode-overlay';
import { bridge } from '@/native';
import type { UnlistenFn } from '@/native/interfaces/types';

const IS_THIN_CLIENT = import.meta.env.TAURI_IS_THIN_CLIENT === 'true';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    logger.debug('Client is thin: ?', IS_THIN_CLIENT);
    const disposeViewportScale = setupViewportScale();
    let disposed = false;
    let clientOnlineUnlisten: UnlistenFn | null = null;

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

    const setupClientOnlineListener = async () => {
      try {
        const unlisten = await bridge.onEvent('client-online', (payload) => {
          const { is_online } = payload;
          dispatch(setConnected(is_online));
        });

        if (disposed) {
          unlisten();
        } else {
          clientOnlineUnlisten = unlisten;
        }
      } catch (error) {
        logger.debug('client-online listener unavailable', error);
      }
    };

    void setupClientOnlineListener();

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      disposed = true;
      clientOnlineUnlisten?.();
      disposeViewportScale();
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [dispatch]);

  return (
    <UiThemeProvider>
      <DeveloperModeOverlay />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </UiThemeProvider>
  );
}

export default App;
