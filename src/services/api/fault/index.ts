import { request } from '@/utils/request';
import type { FaultListRequest, FaultListResponse, RevokeFaultRequest } from './types';
import type { ApiResponse } from '@/utils/request/types';

export enum FaultApi {
  LIST_FAULT = '/listFault',
  REVOKE_FAULT = '/revokeFault',
}

export const listFault = (data: FaultListRequest) => {
  return request<FaultListResponse, FaultListRequest>(FaultApi.LIST_FAULT, {
    method: 'POST',
    body: data,
    trackLoading: true,
  });
};

// 撤回工单
export const revokeFault = (data: RevokeFaultRequest) => {
  return request<ApiResponse, RevokeFaultRequest>(`/revokeFault`, {
    method: 'POST',
    body: data,
  });
};
