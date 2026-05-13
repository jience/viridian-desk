import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchGatewayList, selectAutoGateway, selectConnected } from '@/store/feature/gateway';
import { fetchClientInfo } from '@/store/feature/client';
import type { GetGatewayServerResp } from '@/native/interfaces/config';

const useSharedState = () => {
  const dispatch = useAppDispatch();
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState('');
  const navigate = useNavigate();

  const autoGateway = useAppSelector(selectAutoGateway);
  const connected = useAppSelector(selectConnected);

  // 从本地拿已有的网关列表
  const getGateWays = async () => {
    const res = await dispatch(fetchGatewayList());
    // 网关为空，说明需要跳转到网关页面进行设置 同时设置页签定位到网关
    if ((res.payload as GetGatewayServerResp).length === 0) {
      navigate('/configPage/serverSetting');
    }
  };

  const getRedDot = () => {};

  // 获取公告消息，并展示公告走马灯
  const sendNotice = () => {};

  const getIP = () => {
    if (autoGateway) {
      return `${autoGateway.address}`;
    }
  };

  // 是否重新连接了并且连接上了网关
  const reconnectGateWay = useMemo(() => {
    if (!autoGateway) return false;
    if (!navigator.onLine) return false;
    if (!connected) return false;
    return true;
  }, [autoGateway, connected]);

  /**
   * @author zhoujingjing
   * @description 展示全局消息提示
   * @param {*} data
   */
  const showGlobalMsg = (_data: any) => {};

  // tauri模式下调用获取平台配置的相关终端配置
  const getClientConfig = () => {
    dispatch(fetchClientInfo());
  };

  return {
    showGlobalMsg,
    reconnectGateWay,
    getIP,
    globalLoading,
    setGlobalLoading,
    globalLoadingText,
    setGlobalLoadingText,
    getRedDot,
    sendNotice,
    getGateWays,
    getClientConfig,
  };
};

export default useSharedState;
