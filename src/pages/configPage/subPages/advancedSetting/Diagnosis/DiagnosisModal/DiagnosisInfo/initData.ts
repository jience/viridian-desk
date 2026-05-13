import { useIntl } from 'react-intl';
import type { InfoRenderItem } from './types';

export const useInitData = () => {
  const intl = useIntl();
  // 网络诊断信息
  const renderNetworkInfo: InfoRenderItem[] = [
    {
      key: 'diagnoseTime',
      content: intl.formatMessage({ id: 'DiagnoseTime' }), // 诊断时间
    },
    {
      key: 'deviceInfo',
      content: intl.formatMessage({ id: 'DeviceInfo' }), // 设备信息
    },
    {
      key: 'terminalVersion',
      content: intl.formatMessage({ id: 'APPVersion' }), // app版本
    },
    {
      key: 'isConnNet',
      content: intl.formatMessage({ id: 'IsConn' }), // 是否联网
    },
    {
      key: 'internetRestriction',
      content: intl.formatMessage({ id: 'InternetRestriction' }), // 网络权限
    },
    {
      key: 'internetType',
      content: intl.formatMessage({ id: 'InternetType' }), // 网络类型
    },
    {
      key: 'socketStatusInfo',
      content: intl.formatMessage({ id: 'SocketStatus' }), // 长连接状态
    },
    {
      key: 'deviceIP',
      content: intl.formatMessage({ id: 'DeviceIP' }), // 本机IP
    },
    {
      key: 'gatewayAddress',
      content: intl.formatMessage({ id: 'GatewayAddress' }), // 网关地址
    },
    {
      key: 'connTime',
      content: intl.formatMessage({ id: 'ConnTime' }), // 连接网关用时
    },
    // {
    //   key: 'pingTime',
    //   content: intl.formatMessage({ id: 'PingTime' }), // ping网关用时,
    // }
  ];

  return { renderNetworkInfo };
};
