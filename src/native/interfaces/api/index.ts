import type { NativeResponse } from '../types';
import type {
  ApiPageRequest,
  ApiResponse,
  CheckTerminalUserReq,
  CheckTerminalUserResp,
  GetDynamicPwdQrCodeReq,
  GetDynamicPwdQrCodeResp,
  GetQrCodeUrlReq,
  GetQrCodeUrlResp,
  GetSmsCaptchaReq,
  GetTerminalAuthCodeReq,
  ListAdReq,
  ListAdResp,
  ListCorpResp,
  ListNisServerResp,
  LoginUserReq,
  LoginUserResp,
  LogoutUserReq,
  TerminalPhoneLoginReq,
  TerminalPhoneLoginResp,
} from './types';
export * from './types';

/**
 * 网络请求模块接口
 */
export interface IApiModule {
  /** 使用域名获取对应域下的单位信息 */
  listAd: (req: ListAdReq) => Promise<NativeResponse<ListAdResp>>;
  /** 获取企业列表 */
  listCorp: (req: ApiPageRequest) => Promise<NativeResponse<ListCorpResp>>;
  /** 获取短信验证码 */
  getTerminalAuthCode: (req: GetTerminalAuthCodeReq) => Promise<NativeResponse<ApiResponse>>;
  /** 获取二维码链接 */
  getQrCodeUrl: (req: GetQrCodeUrlReq) => Promise<NativeResponse<GetQrCodeUrlResp>>;
  /** 获取短信验证码 */
  getSmsCaptcha: (req: GetSmsCaptchaReq) => Promise<NativeResponse<ApiResponse>>;
  /** 获取动态口令二维码 */
  getDynamicPwdQrCode: (
    req: GetDynamicPwdQrCodeReq,
  ) => Promise<NativeResponse<GetDynamicPwdQrCodeResp>>;
  /** 检查用户信息 */
  checkTerminalUser: (req: CheckTerminalUserReq) => Promise<NativeResponse<CheckTerminalUserResp>>;
  /** 手机号登录 */
  terminalPhoneLogin: (
    req: TerminalPhoneLoginReq,
  ) => Promise<NativeResponse<TerminalPhoneLoginResp>>;
  /** 用户登录通用接口 */
  loginUser: (req: LoginUserReq) => Promise<NativeResponse<LoginUserResp>>;
  /** 用户登出接口 */
  logoutUser: (req: LogoutUserReq) => Promise<NativeResponse<ApiResponse>>;
  nis: {
    /** 获取NIS服务器列表 */
    listNisServer: (req: ApiPageRequest) => Promise<NativeResponse<ListNisServerResp>>;
  };
}
