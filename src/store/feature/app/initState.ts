import { LoginAuthType } from '@/native/interfaces/login_history';
import { type AppRenderState } from './types';

export const initState: AppRenderState = {
  msgDot: false,
  msgModalShow: false,
  msgId: '',
  smsResetPasswordSwitch: 'Disabled',
  loginHistory: {
    isRememberMe: false,
    isAutoLogin: false,
    history: [],
  },
  currentLoginType: LoginAuthType.LOCAL,
  currentUser: null,
};
