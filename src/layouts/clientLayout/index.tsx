import './index.scss';
import { lazy, Suspense, useMemo, useEffect, useRef } from 'react';
import useSharedState from './useSharedState';
import { bridge } from '@/native';
import { Outlet } from 'react-router';
import { globalEmitter } from '@/utils/mitt';
import { message } from '@/ui/message';
import { useInitState } from './useInitState';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectMsgId, selectMsgModalShow, setMsgModalShow } from '@/store/feature/app/appSlice';
import { selectIsThin } from '@/store/feature/terminal';
import ControlWindow from '@/components/ControlWindow';
import { setConnected } from '@/store/feature/gateway';
import type { UnlistenFn } from '@/native/interfaces/types';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';

const MessageListModal = lazy(() => import('@/components/MessageCenter'));

const ClientLayout = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useInitState();

  const isThin = useAppSelector(selectIsThin);

  const clientOnlineMonitorRef = useRef<UnlistenFn>(null);
  const desktopConnectMonitorRef = useRef<UnlistenFn>(null);

  const { getGateWays, reconnectGateWay, getClientConfig } = useSharedState();

  const msgModalShow = useAppSelector(selectMsgModalShow);
  const msgId = useAppSelector(selectMsgId);

  useEffect(() => {
    globalEmitter.on('api/error', (e) => {
      const id = `error_code.${e.errorCode}`;
      message.error(t(id, { ...(e.data as any) }));
    });

    return () => {
      globalEmitter.off('api/error');
    };
  }, []);

  // 手动获取桌面上线状态
  const getConnectStatue = () => {
    bridge.cmd
      .getClientOnlineStatus()
      .then(({ data }) => {
        logger.debug('getConnectStatue', data);
        dispatch(setConnected(data));
      })
      .catch((error) => {
        logger.debug('getConnectStatue unavailable', error);
      });
  };

  // 注册长监听: 终端上线状态
  const startListenClientOnline = async () => {
    try {
      clientOnlineMonitorRef.current = await bridge.onEvent('client-online', (payload) => {
        const { is_online } = payload;
        // 网关连接状态
        dispatch(setConnected(is_online));
      });
    } catch (error) {
      logger.debug('client-online listener unavailable', error);
    }
  };

  const startListenDesktopConnect = async () => {
    try {
      desktopConnectMonitorRef.current = await bridge.onEvent('desktop-connect', (payload) => {
        logger.debug('desktopConnectMonitor', payload);
      });
    } catch (error) {
      logger.debug('desktop-connect listener unavailable', error);
    }
  };

  useEffect(() => {
    getConnectStatue(); // 首次手动触发获取connect 状态
    startListenClientOnline();
    startListenDesktopConnect();
    return () => {
      clientOnlineMonitorRef.current?.();
      desktopConnectMonitorRef.current?.();
    };
  }, []);

  useEffect(() => {
    // 获取网关列表
    getGateWays();
  }, []);

  useEffect(() => {
    getClientConfig();
  }, [reconnectGateWay]);

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

      {msgModalShow && (
        <Suspense fallback={null}>
          <MessageListModal
            visible={msgModalShow}
            setVisible={(val: boolean) => {
              dispatch(setMsgModalShow({ msgModalShow: val, msgId: '' }));
            }}
            msgId={msgId}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ClientLayout;
