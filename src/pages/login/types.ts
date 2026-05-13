import type { LoginAuthType } from '@/native/interfaces/login_history';

export interface AccountPwd {
  loginName: string;
  password: string;
}

export interface LoginFormType extends AccountPwd {
  domainServerName?: string;
  ou?: string;
  corpId?: string;
  smsCaptcha?: string;
  nisId?: string;
  phone?: string;
}

export type LoginReq = LoginFormType & {
  authType: LoginAuthType;
  dynamicPwd?: string;
};
