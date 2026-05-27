import './index.scss';
import { useMemo, useEffect } from 'react';
import { bridge } from '@/native';
import { Outlet } from 'react-router';
import { globalEmitter } from '@/utils/mitt';
import { message } from '@/shared/ui/message';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal';
import ControlWindow from '@/features/shell/components/control-window';
import { setConnected } from '@/store/feature/gateway';
import type { UnlistenFn } from '@/native/interfaces/types';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';

const ClientLayout = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const isThin = useAppSelector(selectIsThin);

  useEffect(() => {
    globalEmitter.on('api/error', (e) => {
      const id = `error_code.${e.errorCode}`;
      message.error(t(id, { ...(e.data as any) }));
    });

    return () => {
      globalEmitter.off('api/error');
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let clientOnlineUnlisten: UnlistenFn | null = null;
    let desktopConnectUnlisten: UnlistenFn | null = null;

    const setupListeners = async () => {
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

      try {
        const unlisten = await bridge.onEvent('desktop-connect', (payload) => {
          logger.debug('desktopConnectMonitor', payload);
        });
        if (disposed) {
          unlisten();
        } else {
          desktopConnectUnlisten = unlisten;
        }
      } catch (error) {
        logger.debug('desktop-connect listener unavailable', error);
      }
    };

    void setupListeners();

    return () => {
      disposed = true;
      clientOnlineUnlisten?.();
      desktopConnectUnlisten?.();
    };
  }, [dispatch]);

  const dragAttr = useMemo(() => {
    return !isThin ? { 'data-tauri-drag-region': 'true' } : { 'none-drag-region': 'true' };
  }, [isThin]);

  return (
    <div id="appLayout" className="client-layout-shell">
      <div {...dragAttr} className="client-layout-shell__drag-region" />
      <div className="client-layout-shell__controls">
        <ControlWindow />
      </div>
      <Outlet />
    </div>
  );
};

export default ClientLayout;
