import { request } from '@/utils/request';

type AccountApiRequest = Record<string, unknown>;

export enum AccountApi {
  CHANGE_PASSWORD = '/changePasswordUser',
  GET_PHONE_CODE = '/getPhoneCode',
  UPDATE_PHONE = '/updateUserPhone',
}

export const changePasswordUser = (data: AccountApiRequest) =>
  request(AccountApi.CHANGE_PASSWORD, { method: 'POST', body: data });

export const getPhoneCode = (data: AccountApiRequest) =>
  request(AccountApi.GET_PHONE_CODE, { method: 'POST', body: data });

export const updateUserPhone = (data: AccountApiRequest) =>
  request(AccountApi.UPDATE_PHONE, { method: 'POST', body: data });
