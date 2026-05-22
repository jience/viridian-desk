import type { ApiPageRequest, ApiPageResponse, ApiResponse } from '@/utils/request/types';

export enum FaultType {
  /** 桌面 */
  DESKTOP = 'desktop',
  /** 终端 */
  TERMINAL = 'terminal',
  /** 其他 */
  OTHER = 'other',
}

export enum FaultStatus {
  /** 待处理 */
  UNRESOLVED = 'unresolved',
  /** 已处理 */
  SOLVED = 'solved',
  /** 已驳回 */
  REJECT = 'reject',
  /** 已撤回 */
  REVOKE = 'revoke',
}

export interface FaultItem {
  id: string;
  userId: string;
  userUsername: string;
  userRealName: string;
  terminalId: string;
  terminalName: string;
  desktopId: string | null;
  faultType: FaultType;
  status: FaultStatus;
  description: string;
  approveUserId: string | null;
  approveUsername: string | null;
  approveRealName: string | null;
  reply: string | null;
  finishTime: string | null;
  terminal?: FaultTerminal;
  user?: FaultUser;
  approveUser: null;
  desktop: FaultDesktop | null;
  createTime: string;
  updateTime: string;
}

export interface FaultUser {
  id: string;
  name: string;
  loginName: string;
}

export interface FaultTerminal {
  id: string;
  name: string;
}
export interface FaultDesktop {
  id: string;
  name: string;
}

export type FaultListResponse = ApiResponse<ApiPageResponse<FaultItem>>;
export type FaultListRequest = {
  sortKey?: keyof FaultItem;
  sortOrder?: 'Asc' | 'Desc';
  /** 当前用户 */
  userId?: string;
  /** 状态 */
  status?: FaultStatus | '';
  /** 故障类型 */
  faultType?: FaultType | '';
} & ApiPageRequest;

export type RevokeFaultRequest = {
  ids: string[];
};
