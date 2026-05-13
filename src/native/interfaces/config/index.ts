import type { NativeResponse } from '../types';
import type {
  GetGatewayServerResp,
  AddGatewayServerReq,
  UpdateGatewayServerReq,
  GetAppConfResp,
  LogLevel,
  ThemeType,
} from './types';
export * from './types';

export interface IConfigModule {
  /**
   * 获取服务器列表
   */
  getGatewayServer: () => Promise<NativeResponse<GetGatewayServerResp>>;

  /**
   * 添加服务器
   */
  addGatewayServer: (gatewayInfo: AddGatewayServerReq) => Promise<NativeResponse<void>>;

  /**
   * 启用服务器
   */
  switchGatewayServer: (gwid?: string) => Promise<NativeResponse<void>>;

  /**
   * 更新服务器
   */
  updateGatewayServer: (gatewayInfo: UpdateGatewayServerReq) => Promise<NativeResponse<void>>;

  /**
   * 删除服务器
   */
  deleteGatewayServer: (gwid?: string) => Promise<NativeResponse<void>>;

  /**
   * 获取应用配置
   */
  getAppConf: () => Promise<NativeResponse<GetAppConfResp>>;

  /**
   * 设置开发者模式
   */
  setDeveloperMode: (developerMode: boolean) => Promise<NativeResponse<void>>;

  /**
   * 设置日志过滤
   */
  setLogFilter: (level: LogLevel) => Promise<NativeResponse<void>>;

  /**
   * 设置主题
   */
  setTheme: (theme: ThemeType) => Promise<NativeResponse<void>>;

  /**
   * 设置语言
   */
  setLanguage: (language: string) => Promise<NativeResponse<void>>;

  /**
   * 设置开机自启
   */
  setAutoStart: (autoStart: boolean) => Promise<NativeResponse<void>>;

  /**
   * 设置全屏模式
   */
  setFullScreen: (fullScreen: boolean) => Promise<NativeResponse<void>>;

  /**
   * 设置自动更新
   */
  setAutoUpdate: (autoUpdate: boolean) => Promise<NativeResponse<void>>;
}
