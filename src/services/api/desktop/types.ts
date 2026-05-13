import type { ApiPageRequest, ApiPageResponse, ApiResponse } from '@/utils/request/types';

export type ListResourceUserReq = ApiPageRequest & { isPublishApp?: boolean };

export interface DeskTopItem {
  id: string;
  name: string;
  os: string;
}

export type ListResourceUserRes = ApiResponse<ApiPageResponse<DeskTopItem>>;
