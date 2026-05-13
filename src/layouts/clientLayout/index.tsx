import './index.scss';
import { useMemo, useState, useEffect, useRef } from 'react';
import useSharedState from './useSharedState';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import NoviceGuidance from '../../components/NoviceGuidance';
import { Outlet } from 'react-router';
import MessageListModal from '@/components/Footer/components/MessageList';
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

  // 是否展示新手引导
  const [isNoviceGuidance, setIsNoviceGuidance] = useState(localStorage.getItem('noviceGuidance'));

  const { getGateWays, reconnectGateWay, getClientConfig } = useSharedState();

  const msgModalShow = useAppSelector(selectMsgModalShow);
  const msgId = useAppSelector(selectMsgId);

  // 字体大小重绘
  const resize = () => {
    const docEl = document.documentElement;
    const dpr = window.devicePixelRatio || 1;
    // adjust body font size
    function setBodyFontSize() {
      if (document.body) {
        document.body.style.fontSize = 12 * dpr + 'px';
      } else {
        document.addEventListener('DOMContentLoaded', setBodyFontSize);
      }
    }
    setBodyFontSize();

    // set 1rem = viewWidth / 10
    function setRemUnit() {
      const rem = docEl.clientWidth / 12;

      // todo
      if (window.innerWidth <= 1000) {
        docEl.style.fontSize = 100 + 'px';
      } else {
        docEl.style.fontSize = rem + 'px';
      }
    }

    setRemUnit();

    // reset rem unit on page resize
    window.addEventListener('resize', setRemUnit);
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        setRemUnit();
      }
    });

    // detect 0.5px supports
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
  };

  useEffect(() => {
    resize();
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

  const bgStyle = useMemo(() => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${convertFileSrc(backgroundImage)}) no-repeat`,
      };
    }
  }, [backgroundImage]);

  const dragAttr = useMemo(() => {
    return !isThin ? { 'data-tauri-drag-region': 'true' } : { 'none-drag-region': 'true' };
  }, [isThin]);

  return (
    <div id="appLayout" className="app-layout" style={bgStyle}>
      <div {...dragAttr} className="drag-bar"></div>
      <div className="control-bar">
        <ControlWindow></ControlWindow>
      </div>
      {!isNoviceGuidance && <NoviceGuidance setIsNoviceGuidance={setIsNoviceGuidance} />}
      {isNoviceGuidance && <Outlet />}

      {msgModalShow && (
        <MessageListModal
          visible={msgModalShow}
          setVisible={(val: boolean) => {
            dispatch(setMsgModalShow({ msgModalShow: val, msgId: '' }));
          }}
          msgId={msgId}
        ></MessageListModal>
      )}
    </div>
  );
};

export default ClientLayout;
