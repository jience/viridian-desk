import { request } from '@/utils/request';
import type { ListResourceUserReq, ListResourceUserRes } from './types';

export enum DeskTopApi {
  LIST_RESOURCE_USER = '/listResourceUser',
}

export const listResourceUser = async (data: ListResourceUserReq) => {
  return request<ListResourceUserRes>(DeskTopApi.LIST_RESOURCE_USER, {
    method: 'POST',
    body: data,
  });
};
