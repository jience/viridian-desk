import type { LoginUserInfo } from '@/native/interfaces/api';

export interface AppRenderState {
  currentUser: LoginUserInfo | null;
}
