import { request } from '@/utils/request';
import type { FaultListRequest, FaultListResponse, RevokeFaultRequest } from './types';
import type { ApiResponse } from '@/utils/request/types';

export enum FaultApi {
  LIST_FAULT = '/listFault',
  REVOKE_FAULT = '/revokeFault',
  CREATE_FAULT = '/createFault',
}

export const listFault = (data: FaultListRequest) => {
  return request<FaultListResponse, FaultListRequest>(FaultApi.LIST_FAULT, {
    method: 'POST',
    body: data,
  });
};

// 撤回工单
export const revokeFault = (data: RevokeFaultRequest) => {
  return request<ApiResponse, RevokeFaultRequest>(FaultApi.REVOKE_FAULT, {
    method: 'POST',
    body: data,
  });
};

export const createFault = (data: Record<string, any>) => {
  return request<ApiResponse, Record<string, any>>(FaultApi.CREATE_FAULT, {
    method: 'POST',
    body: data,
  });
};
