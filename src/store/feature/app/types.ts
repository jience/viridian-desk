import type { LoginUserInfo } from '@/native/interfaces/api';
import type { LoginAuthType, LoginHistoryData } from '@/native/interfaces/login_history';

export interface AppRenderState {
  msgDot: boolean;
  msgModalShow: boolean;
  msgId: string;
  smsResetPasswordSwitch: 'Disabled' | 'Enabled';
  loginHistory: LoginHistoryData;
  currentLoginType: LoginAuthType;
  currentUser: LoginUserInfo | null;
}
