import type { NativeResponse } from '../types';
import type { ApiResponse, LoginUserReq, LoginUserResp, LogoutUserReq } from './types';
export * from './types';

/**
 * 网络请求模块接口
 */
export interface IApiModule {
  /** 本地用户登录接口 */
  loginUser: (req: LoginUserReq) => Promise<NativeResponse<LoginUserResp>>;
  /** 用户登出接口 */
  logoutUser: (req: LogoutUserReq) => Promise<NativeResponse<ApiResponse>>;
}
