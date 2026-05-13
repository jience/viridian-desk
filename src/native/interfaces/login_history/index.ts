import type { NativeResponse } from '../types';
import type {
  AddHistoryEntryParams,
  LoginAuthType,
  LoginHistoryData,
  LoginHistoryMetaData,
} from './types';
export * from './types';

export const MAX_HISTORY_ENTRIES = 5;
export const HISTORY_FILE_NAME = 'login_history.json';

/**
 * 登录历史模块接口
 */
export interface ILoginHistoryModule {
  /**
   * 获取登录历史
   * @param loginType 登录类型（可选）
   */
  getLoginHistory(loginType?: LoginAuthType): Promise<NativeResponse<LoginHistoryData>>;
  /**
   * 保存登录历史
   * @param history 登录历史数组
   */
  saveLoginHistory(history: LoginHistoryData): Promise<NativeResponse>;
  /**
   * 添加登录条目
   * @param username 用户名
   * @param loginType 登录类型
   */
  addLoginEntry(
    loginInfo: AddHistoryEntryParams,
    loginType: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>>;
  /**
   * 删除登录条目
   * @param username 用户名
   * @param loginType 登录类型
   */
  deleteLoginEntry(
    username: string,
    loginType: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>>;
  /**
   * 清空登录历史
   */
  clearLoginHistory(loginType?: LoginAuthType): Promise<NativeResponse<LoginHistoryData>>;
  /**
   * 设置登录Meta数据
   */
  setLoginHistoryMeta(
    meta: Partial<LoginHistoryMetaData>,
  ): Promise<NativeResponse<LoginHistoryData>>;
}
