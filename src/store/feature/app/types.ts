import type { LoginUserInfo } from '@/native/interfaces/api';
import type { LoginAuthType } from '@/native/interfaces/login_auth';

export interface AppRenderState {
  msgDot: boolean;
  msgModalShow: boolean;
  msgId: string;
  smsResetPasswordSwitch: 'Disabled' | 'Enabled';
  currentLoginType: LoginAuthType;
  currentUser: LoginUserInfo | null;
}
