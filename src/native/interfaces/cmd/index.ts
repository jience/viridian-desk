import type { LoginUserInfo } from '../api';
import type { NativeResponse } from '../types';
import type { DiagnoseEvent, GetLogInfoRes, NetProbeItemRender, SetLogReq } from './types';
export * from './types';

export interface ConnectDesktopReq {
  desktopId: string;
  desktopIp: string;
  macAddress: string;
}

export interface ICmdModule {
  /**
   * 获取本地网络信息
   */
  getLocalNetInfo(): Promise<NativeResponse<NetProbeItemRender[]>>;
  /**
   * 获取客户端在线状态
   */
  getClientOnlineStatus(): Promise<NativeResponse<boolean>>;
  /**
   * 诊断网关网络
   * @param onEvent 事件回调
   */
  diagnoseGatewayNetwork(onEvent?: (event: DiagnoseEvent) => void): Promise<NativeResponse>;
  /**
   * 关闭本地设备（关机）
   */
  shutdownLocalDevice(): Promise<NativeResponse>;
  /**
   * 获取日志信息
   */
  getLogInfo(): Promise<NativeResponse<GetLogInfoRes>>;
  /**
   * 清理日志文件
   */
  cleanLogFile(): Promise<NativeResponse>;
  /**
   * 打开日志目录
   */
  openLogDirectory(): Promise<NativeResponse>;
  /**
   * 打开系统网络设置
   */
  openNetworkSettings(): Promise<NativeResponse>;
  /**
   * 打开帮助文档
   */
  openDocs(): Promise<NativeResponse>;
  /**
   * 连接桌面
   */
  connectDesktop(data: ConnectDesktopReq): Promise<NativeResponse>;
  /**
   * 设置日志配置
   */
  setLog(data: SetLogReq): Promise<NativeResponse>;
  /**
   * 设置登录的用户信息
   */
  login(userInfo: LoginUserInfo, authToken?: string): Promise<NativeResponse>;
  /**
   * 退出登录
   */
  logout(): Promise<NativeResponse>;
}
