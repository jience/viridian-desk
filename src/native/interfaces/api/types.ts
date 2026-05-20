import type { LoginAuthType } from '../login_auth';

export type EmptyObject = Record<string, never>;

export interface ApiResponse<T = EmptyObject> {
  requestId: string;
  data: T;
}

export interface ApiErrResponse<T = EmptyObject> {
  requestId: string;
  data: T;
  errorCode: string;
  errorMessage: string;
}

export interface ApiPageResponse<T = EmptyObject> {
  totalCount: number;
  pageSize?: number;
  pageNumber?: number;
  results?: T[];
}

export interface ApiPageRequest {
  pageSize: number;
  pageNumber: number;
}

/**
 * ApiResponse err的类型守卫
 */
export const isApiErrResponse = <T = EmptyObject>(res: any): res is ApiErrResponse<T> => {
  return (
    typeof (res as ApiErrResponse<T>).errorCode === 'string' &&
    typeof (res as ApiErrResponse<T>).errorMessage === 'string' &&
    typeof (res as ApiErrResponse<T>).requestId === 'string'
  );
};

export type ListAdReq = {
  name: string;
};
export interface ADItem {
  createTime: string;
  updateTime: string;
  baseDN: string;
  filterRule: string;
  isEncrypt: boolean;
  isSyncDepartment: boolean;
  mailMappingRule: string;
  serverIp: string;
  serverPort: number;
  telephoneMappingRule: string;
  userPassword: string;
  userName: string;
  loginAttribute: string;
  netBiosPrefix: string;
  manageMode: string;
  id: string;
  name: string;
  description: string;
  type: string;
  state: string;
  ou: string;
}
export type ListAdResp = ApiPageResponse<ADItem>;

export interface NisServer {
  id: string;
  ip: string;
  domain: string;
  port: number;
}
export type ListNisServerResp = ApiPageResponse<NisServer>;

export interface CorpItem {
  id: string;
  name: string;
  type: 'wechat';
}
export type ListCorpResp = ApiPageResponse<CorpItem>;

export type GetTerminalAuthCodeReq = {
  phone: string;
  authType: LoginAuthType;
};

export type GetQrCodeUrlReq = {
  id: string;
};
export interface QrCodeUrlInfo {
  corpId: string;
  appId: string;
  redirectUrl: string;
  state: string;
}
export type GetQrCodeUrlResp = ApiResponse<QrCodeUrlInfo>;

export type GetSmsCaptchaReq = {
  loginName: string;
  password: string | '';
  authType: string;
  phone?: string;
  domainServerName?: string;
  ou?: string;
  corpId?: string;
  nisId?: string;
  isForgetPassword?: boolean;
};

export type GetDynamicPwdQrCodeReq = {
  loginName: string;
  authType: string;
  password: string;
  ou?: string;
  domainServerName?: string;
};
export interface DynamicPwdQrCodeInfo {
  qrCodeContent: string;
}
export type GetDynamicPwdQrCodeResp = ApiResponse<DynamicPwdQrCodeInfo>;

export type CheckTerminalUserReq = {
  loginName: string;
  authType: string;
};
export interface CheckTerminalUserInfo {
  id: string;
  phone?: string;
}
export type CheckTerminalUserResp = ApiResponse<CheckTerminalUserInfo>;

export interface TerminalPhoneLoginReq {
  authType: LoginAuthType;
  phone: string;
  smsCaptcha: string;
}

export const LoginUserType = {
  LOCAL: 'Local',
  CORP: 'Corp',
  DOMAIN: 'Domain',
} as const;
export type LoginUserType = (typeof LoginUserType)[keyof typeof LoginUserType];
export type UserPolicy = {
  session?: any;
  accessLimit: {
    terminal: string[];
  };
  visitorLimit?: any;
};
export interface LoginUserInfo {
  userId?: string;
  departmentId?: string;
  userName?: string;
  loginName?: string;
  telephone?: string;
  passwordIsUpdated?: boolean;
  email?: string;
  type?: LoginUserType;
  permissions?: string[];
  deviceId?: string;
  deviceName?: string;
  deviceDepartmentId?: string;
  deviceIp?: string;
  deviceMac?: string;
  userPolicy?: UserPolicy;
  passwordIsExpireSoon?: boolean;
  passwordIsExpire?: boolean;
  loginFromDifferentLocation?: boolean;
  lastLoginIp?: string;
  lastLoginTime?: string;
}
export type TerminalPhoneLoginResp = ApiResponse<LoginUserInfo>;

export interface LoginUserReq {
  authType: LoginAuthType;
  loginName: string;
  password: string;
  domainServerName?: string;
  ou?: string;
  corpId?: string;
  smsCaptcha?: string;
  nisId?: string;
  phone?: string;
  dynamicPwd?: string;
}
export type LoginUserResp = ApiResponse<LoginUserInfo>;

export interface LogoutUserReq {
  loginName: string;
  forceLogout?: boolean;
}
