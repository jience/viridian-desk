import type { LoginAuthType } from '@/native/interfaces/login_auth';

export interface AccountPwd {
  loginName: string;
  password: string;
}

export type LoginFormType = AccountPwd;

export type LoginReq = LoginFormType & {
  authType: LoginAuthType;
};
