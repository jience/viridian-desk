import './index.scss';
import { useMemo, useEffect, useRef, type CSSProperties } from 'react';
import useSharedState from './useSharedState';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { Outlet } from 'react-router';
import MessageListModal from '@/components/MessageCenter';
import { globalEmitter } from '@/utils/mitt';
import { message } from 'antd';
import { useInitState } from './useInitState';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectBackgroundImage } from '@/store/feature/client';
import { selectMsgId, selectMsgModalShow, setMsgModalShow } from '@/store/feature/app/appSlice';
import { selectIsThin } from '@/store/feature/terminal';
import ControlWindow from '@/components/ControlWindow';
import { setConnected } from '@/store/feature/gateway';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useTranslation } from 'react-i18next';

const ClientLayout = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useInitState();

  const backgroundImage = useAppSelector(selectBackgroundImage);
  const isThin = useAppSelector(selectIsThin);

  const clientOnlineMonitorRef = useRef<UnlistenFn>(null);
  const desktopConnectMonitorRef = useRef<UnlistenFn>(null);

  const { getGateWays, reconnectGateWay, getClientConfig } = useSharedState();

  const msgModalShow = useAppSelector(selectMsgModalShow);
  const msgId = useAppSelector(selectMsgId);

  const resize = () => {
    const docEl = document.documentElement;
    const dpr = window.devicePixelRatio || 1;

    function setBodyFontSize() {
      if (document.body) {
        document.body.style.fontSize = 12 * dpr + 'px';
      } else {
        document.addEventListener('DOMContentLoaded', setBodyFontSize);
      }
    }
    setBodyFontSize();

    function setRemUnit() {
      const rem = docEl.clientWidth / 12;

      if (window.innerWidth <= 1000) {
        docEl.style.fontSize = 100 + 'px';
      } else {
        docEl.style.fontSize = rem + 'px';
      }
    }

    setRemUnit();

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setRemUnit();
      }
    };

    window.addEventListener('resize', setRemUnit);
    window.addEventListener('pageshow', handlePageShow);

    if (dpr >= 2) {
      const fakeBody = document.createElement('body');
      const testElement = document.createElement('div');
      testElement.style.border = '.5px solid transparent';
      fakeBody.appendChild(testElement);
      docEl.appendChild(fakeBody);
      if (testElement.offsetHeight === 1) {
        docEl.classList.add('hairlines');
      }
      docEl.removeChild(fakeBody);
    }

    return () => {
      window.removeEventListener('resize', setRemUnit);
      window.removeEventListener('pageshow', handlePageShow);
    };
  };

  useEffect(() => {
    return resize();
  }, []);

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
    invoke('get_client_online_status').then((res) => {
      console.log('getConnectStatue', res);
      dispatch(setConnected(res as boolean));
    });
  };

  // 注册长监听: 终端上线状态
  const startListenClientOnline = async () => {
    clientOnlineMonitorRef.current = await listen<any>('client-online', (e: any) => {
      const { is_online } = e.payload;
      // 网关连接状态
      dispatch(setConnected(is_online));
    });
  };

  const startListenDesktopConnect = async () => {
    desktopConnectMonitorRef.current = await listen<any>('desktop-connect', (e: any) => {
      console.log('desktopConnectMonitor', e);
    });
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

  const bgStyle = useMemo<CSSProperties | undefined>(() => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${convertFileSrc(backgroundImage)})`,
      };
    }
  }, [backgroundImage]);

  const dragAttr = useMemo(() => {
    return !isThin ? { 'data-tauri-drag-region': 'true' } : { 'none-drag-region': 'true' };
  }, [isThin]);

  return (
    <div id="appLayout" className="client-layout-shell" style={bgStyle}>
      <div {...dragAttr} className="client-layout-shell__drag-region" />
      <div className="client-layout-shell__controls">
        <ControlWindow />
      </div>
      <Outlet />

      {msgModalShow && (
        <MessageListModal
          visible={msgModalShow}
          setVisible={(val: boolean) => {
            dispatch(setMsgModalShow({ msgModalShow: val, msgId: '' }));
          }}
          msgId={msgId}
        />
      )}
    </div>
  );
};

export default ClientLayout;
