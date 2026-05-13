import type { NativeResponse } from '../types';
import type { FetchUpdateResp, OnEventType } from './types';
export * from './types';

/**
 * 应用更新模块接口
 */
export interface IAppUpdatesModule {
  /**
   * 检查更新
   */
  fetchUpdate: () => Promise<NativeResponse<FetchUpdateResp | null>>;
  /**
   * 安装更新
   */
  installUpdate: (onEvent?: OnEventType) => Promise<NativeResponse>;
}
