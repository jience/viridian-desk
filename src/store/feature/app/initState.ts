import { LoginAuthType } from '@/native/interfaces/login_auth';
import { type AppRenderState } from './types';

export const initState: AppRenderState = {
  msgDot: false,
  msgModalShow: false,
  msgId: '',
  smsResetPasswordSwitch: 'Disabled',
  currentLoginType: LoginAuthType.LOCAL,
  currentUser: null,
};
