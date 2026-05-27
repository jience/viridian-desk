import { request } from '@/utils/request';

type ApplicationApiRequest = Record<string, unknown>;

export enum ApplicationApi {
  LIST_APP_LIB = '/listAppLib',
}

export const listAppLib = (data: ApplicationApiRequest) =>
  request(ApplicationApi.LIST_APP_LIB, { method: 'POST', body: data });
