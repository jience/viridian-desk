import type { LoginAuthType } from '@/native/interfaces/login_history';

export interface LoginWayRenderData {
  name: string;
  key: LoginAuthType;
  iconType: string;
}
