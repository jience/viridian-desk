import type { NativeResponse } from '../types';
import type { GetClientAboutResp, GetClientConfigResp, GetTerminalInfoResp } from './types';
export * from './types';

/**
 * 终端信息模块接口
 */
export interface ITerminalModule {
  /**
   * 获取about页面信息
   */
  getClientAbout: () => Promise<NativeResponse<GetClientAboutResp>>;

  /**
   * 获取终端配置
   *
   * 管控下发配置，终端需要根据这些配置做一些动态变化
   *
   * 存储在全局状态client中，开启应用后初始化，每次网关上线更新一次
   */
  getClientConfig: () => Promise<NativeResponse<GetClientConfigResp>>;

  /**
   * 终端型号以及系统相关信息
   *
   * 存储在全局状态terminal中，开启应用后初始化一次
   */
  getTerminalInfo: () => Promise<NativeResponse<GetTerminalInfoResp>>;
}
