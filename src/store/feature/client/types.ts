import type { GetClientConfigResp } from '@/native/interfaces/terminal';

export const LoginType = {
  LOCAL: 'local',
  DOMAIN: 'domain',
  OTHER: 'other',
  /** iam */
  USER_DEFINED: 'user-defined',
  NIS: 'nis',
} as const;

export type LoginType = (typeof LoginType)[keyof typeof LoginType];

export type ClientState =
  | (Omit<GetClientConfigResp, 'loginTypes'> & { loginTypes: LoginType[] })
  | null;
