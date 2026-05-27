import { request } from '@/utils/request';

export enum SessionApi {
  GET_TERMINAL_LOGIN_CONFIG = '/getTerminalLoginConfig',
}

export const getTerminalLoginConfig = () =>
  request(SessionApi.GET_TERMINAL_LOGIN_CONFIG, { method: 'POST' });
