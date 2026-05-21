import type { LoginUserInfo } from '@/native/interfaces/api';

export interface AppRenderState {
  msgDot: boolean;
  msgModalShow: boolean;
  msgId: string;
  currentUser: LoginUserInfo | null;
}
