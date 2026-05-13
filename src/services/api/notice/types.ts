import type { ApiPageRequest, ApiPageResponse, ApiResponse } from '@/utils/request/types';

export type NoticeListRequest = ApiPageRequest & {
  subject?: string;
};

export interface NoticePublisher {
  id: string;
  loginName: string;
  name: string;
  telephone: string;
  type: string;
  domainServerId: string;
  dn: string;
  isDelete: boolean;
}

export enum NoticeStatus {
  PUBLISHED = 'Published',
}

export interface NoticeItem {
  createTime: string;
  updateTime: string;
  publisher: NoticePublisher;
  id: string;
  subject: string;
  content: string;
  status: NoticeStatus;
  publishedTime: string;
  expired_at: string;
}

export type NoticeListResponse = ApiResponse<ApiPageResponse<NoticeItem>>;
