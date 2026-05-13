import { request } from '@/utils/request';
import type { HistoryMessageListRequest, HistoryMessageListResponse } from './types';
import type { ApiResponse } from '@/utils/request/types';

export enum MsgApi {
  LIST_HISTORY_MESSAGE = '/listHistoryMessage',
  // deleteTerminalMsg
  DELETE_TERMINAL_MSG = '/deleteTerminalMsg',
}

export const listHistoryMessage = (data: HistoryMessageListRequest) => {
  return request<HistoryMessageListResponse, HistoryMessageListRequest>(
    MsgApi.LIST_HISTORY_MESSAGE,
    {
      method: 'POST',
      body: data,
    },
  );
};

export const deleteTerminalMsg = (data: { ids: string[] }) => {
  return request<ApiResponse, { ids: string[] }>(MsgApi.DELETE_TERMINAL_MSG, {
    method: 'POST',
    body: data,
  });
};
