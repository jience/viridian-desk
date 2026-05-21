import {
  isApiErrResponse,
  type IApiModule,
  type LoginUserReq,
  type LoginUserResp,
  type LogoutUserReq,
} from '@/native/interfaces/api';
import { failure, success } from '@/native/utils';
import type { ApiResponse } from '@/utils/request/types';
import { encryptionPassword } from '@/utils/utils';
import { request } from './request';

export const ApiInvoke = {
  LOGOUT_USER: '/logoutUser',
  LOGIN_USER: '/loginUser',
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
};
