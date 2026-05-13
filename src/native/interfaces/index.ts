import type { IApiModule } from './api';
import type { IAppUpdatesModule } from './app_updates';
import type { ICmdModule } from './cmd';
import type { IConfigModule } from './config';
import type { ILoginHistoryModule } from './login_history';
import type { ITerminalModule } from './terminal';
import type { AppEventMap, NativeResponse, UnlistenFn } from './types';

export interface INativeBridge {
  /**
   * 运行平台
   */
  platform: 'tauri' | 'electron' | 'web';

  /**
   * 最小化窗口
   */
  minimizeWindow(): Promise<NativeResponse>;

  /**
   * 应用更新模块
   */
  app_updates: IAppUpdatesModule;

  /**
   * 终端信息模块
   */
  terminal: ITerminalModule;

  /**
   * 配置信息模块
   */
  config: IConfigModule;

  /**
   * 本地命令模块
   *
   * 提供本地设备的命令操作接口
   */
  cmd: ICmdModule;

  /**
   * 网络请求模块接口
   */
  api: IApiModule;

  /**
   * 登录历史模块
   */
  login_history: ILoginHistoryModule;

  /**
   * 监听事件
   */
  onEvent<K extends keyof AppEventMap>(
    event: K,
    callback: (payload: AppEventMap[K]) => void,
  ): Promise<UnlistenFn>;
}
