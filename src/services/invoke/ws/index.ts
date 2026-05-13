import { invoke } from '@/utils/invoke';

export enum GatewayInvoke {
  RECONNECT_WS = 'reconnect_ws',
}

/**
 * 重新连接ws
 */
export const reconnectWs = () => {
  return invoke(GatewayInvoke.RECONNECT_WS);
};
