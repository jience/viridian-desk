import type { ApiPageRequest, ApiPageResponse, ApiResponse } from '@/utils/request/types';

export type HistoryMessageListRequest = ApiPageRequest & {
  msgContentLike?: string;
};

export enum HistoryMessageLevel {
  /**
   * 一般消息
   */
  NORMAL = 'normal',
  /**
   * 重要消息
   */
  EMERGENCY = 'emergency',
}

export enum HistoryMessageStatus {
  SUCCESS = 'SUCCESS',
}

export enum HistoryMessageType {
  /**
   * 终端消息
   */
  TERMINAL = 'terminal',
}

export interface HistoryMessageItem {
  id: string;
  userName: string;
  objId: string;
  objType: HistoryMessageType;
  msgContent: string;
  status: HistoryMessageStatus;
  level: HistoryMessageLevel;
  createTime: string;
}

export type HistoryMessageListResponse = ApiResponse<ApiPageResponse<HistoryMessageItem>>;
