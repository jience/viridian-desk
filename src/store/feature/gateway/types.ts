import type { GatewayItem } from '@/native/interfaces/config';

export interface GatewayState {
  /**
   * 自动接入网关信息
   */
  autoGateway: GatewayItem | null;
  /**
   * 网关连接状态
   */
  connected: boolean;
  /**
   * 网络连接状态(依赖浏览器navigator.onLine)
   */
  network: boolean;
  /**
   * 公网开关
   */
  publicNet: boolean;
  /**
   * 网关列表
   */
  gatewayList: GatewayItem[];
}
