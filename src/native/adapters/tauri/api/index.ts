import {
  isApiErrResponse,
  type ApiPageRequest,
  type CheckTerminalUserReq,
  type CheckTerminalUserResp,
  type GetDynamicPwdQrCodeReq,
  type GetDynamicPwdQrCodeResp,
  type GetQrCodeUrlReq,
  type GetQrCodeUrlResp,
  type GetSmsCaptchaReq,
  type GetTerminalAuthCodeReq,
  type IApiModule,
  type ListAdReq,
  type ListAdResp,
  type ListCorpResp,
  type ListNisServerResp,
  type LoginUserReq,
  type LoginUserResp,
  type LogoutUserReq,
  type TerminalPhoneLoginReq,
  type TerminalPhoneLoginResp,
} from '@/native/interfaces/api';
import { failure, success } from '@/native/utils';
import type { ApiResponse } from '@/utils/request/types';
import { encryptionPassword, pkcs7Password } from '@/utils/utils';
import { request } from './request';

export const ApiInvoke = {
  LIST_AD: '/listAD',
  LIST_CORP: '/listCorp',
  GET_QR_CODE_URL: '/getQrCodeUrl',
  GET_TERMINAL_AUTH_CODE: '/getTerminalAuthCode',
  GET_SMS_CAPTCHA: '/getSmsCaptcha',
  GET_DYNAMIC_PWD_QR_CODE: '/getDynamicPwdQrCode',
  CHECK_TERMINAL_USER: '/checkTerminalUser',
  TERMINAL_PHONE_LOGIN: '/terminalPhoneLogin',
  LOGOUT_USER: '/logoutUser',
  LOGIN_USER: '/loginUser',
  NIS_LIST_NIS_SERVER: '/nis/listNisServer',
} as const;

export type ApiInvoke = (typeof ApiInvoke)[keyof typeof ApiInvoke];

export async function handleRequest<Resp, Req>(
  api: ApiInvoke,
  req: Req,
  options?: {
    preProcess?: (req: Req) => Req;
  },
) {
  try {
    const body = options?.preProcess ? options.preProcess(req) : req;
    const res = await request<Resp, Req>(api, { body });
    return success(res);
  } catch (error) {
    if (isApiErrResponse<any>(error)) {
      throw failure(error.errorCode, error.errorMessage, error.data);
    }
    throw failure('UnknownError', (error as Error).message);
  }
}

export const api_module: IApiModule = {
  listAd: (req) => handleRequest<ListAdResp, ListAdReq>(ApiInvoke.LIST_AD, req),
  listCorp: (req) => handleRequest<ListCorpResp, ApiPageRequest>(ApiInvoke.LIST_CORP, req),
  getTerminalAuthCode: (req) =>
    handleRequest<ApiResponse, GetTerminalAuthCodeReq>(ApiInvoke.GET_TERMINAL_AUTH_CODE, req),
  getQrCodeUrl: (req) =>
    handleRequest<GetQrCodeUrlResp, GetQrCodeUrlReq>(ApiInvoke.GET_QR_CODE_URL, req),
  getSmsCaptcha: (req) =>
    handleRequest<ApiResponse, GetSmsCaptchaReq>(ApiInvoke.GET_SMS_CAPTCHA, req, {
      preProcess: (r) => ({
        ...r,
        password: pkcs7Password(r.password),
      }),
    }),
  getDynamicPwdQrCode: (req) =>
    handleRequest<GetDynamicPwdQrCodeResp, GetDynamicPwdQrCodeReq>(
      ApiInvoke.GET_DYNAMIC_PWD_QR_CODE,
      req,
      {
        preProcess: (r) => ({
          ...r,
          password: pkcs7Password(r.password),
        }),
      },
    ),
  checkTerminalUser: (req) =>
    handleRequest<CheckTerminalUserResp, CheckTerminalUserReq>(ApiInvoke.CHECK_TERMINAL_USER, req),
  terminalPhoneLogin: (req) =>
    handleRequest<TerminalPhoneLoginResp, TerminalPhoneLoginReq>(
      ApiInvoke.TERMINAL_PHONE_LOGIN,
      req,
    ),
  loginUser: (req) =>
    handleRequest<LoginUserResp, LoginUserReq>(ApiInvoke.LOGIN_USER, req, {
      preProcess: (r) => {
        if (r.password) {
          return {
            ...r,
            password: encryptionPassword(r.password),
          };
        }
        return r;
      },
    }),
  logoutUser: (req) => handleRequest<ApiResponse, LogoutUserReq>(ApiInvoke.LOGOUT_USER, req),
  nis: {
    listNisServer: (req) =>
      handleRequest<ListNisServerResp, ApiPageRequest>(ApiInvoke.NIS_LIST_NIS_SERVER, req),
  },
};
