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

/**
 * ApiResponse err的类型守卫
 */
export const isApiErrResponse = <T = EmptyObject>(res: unknown): res is ApiErrResponse<T> => {
  if (typeof res !== 'object' || res === null) return false;
  const value = res as Partial<ApiErrResponse<T>>;
  return (
    typeof value.errorCode === 'string' &&
    typeof value.errorMessage === 'string' &&
    typeof value.requestId === 'string'
  );
};

export const LoginUserType = {
  LOCAL: 'Local',
} as const;
export type LoginUserType = (typeof LoginUserType)[keyof typeof LoginUserType];

export const LoginAuthType = {
  LOCAL: 'LocalAuth',
} as const;
export type LoginAuthType = (typeof LoginAuthType)[keyof typeof LoginAuthType];

export type UserPolicy = {
  session?: unknown;
  accessLimit: {
    terminal: string[];
  };
  visitorLimit?: unknown;
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
export interface LoginUserReq {
  authType: LoginAuthType;
  loginName: string;
  password: string;
}
export type LoginUserResp = ApiResponse<LoginUserInfo>;

export interface LogoutUserReq {
  loginName: string;
  forceLogout?: boolean;
}
