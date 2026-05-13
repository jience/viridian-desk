import { request } from '@/utils/request';
import type { NoticeListRequest, NoticeListResponse } from './types';

export enum NoticeApi {
  LIST_NOTICE = '/notice/listNotice',
}

export const listNotice = (data: NoticeListRequest) => {
  return request<NoticeListResponse, NoticeListRequest>(NoticeApi.LIST_NOTICE, {
    method: 'POST',
    body: data,
  });
};
