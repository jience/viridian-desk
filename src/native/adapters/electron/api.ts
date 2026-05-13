import type {
  ApiPageRequest,
  ApiResponse,
  CheckTerminalUserReq,
  CheckTerminalUserResp,
  GetDynamicPwdQrCodeReq,
  GetDynamicPwdQrCodeResp,
  GetQrCodeUrlReq,
  GetQrCodeUrlResp,
  GetSmsCaptchaReq,
  GetTerminalAuthCodeReq,
  IApiModule,
  ListAdReq,
  ListAdResp,
  ListCorpResp,
  ListNisServerResp,
  LoginUserReq,
  LoginUserResp,
  LogoutUserReq,
  TerminalPhoneLoginReq,
  TerminalPhoneLoginResp,
} from '@/native/interfaces/api';
import type { NativeResponse } from '@/native/interfaces/types';

export const api_module: IApiModule = {
  listAd: function (_req: ListAdReq): Promise<NativeResponse<ListAdResp>> {
    throw new Error('Function not implemented.');
  },
  listCorp: function (_req: ApiPageRequest): Promise<NativeResponse<ListCorpResp>> {
    throw new Error('Function not implemented.');
  },
  getTerminalAuthCode: function (
    _req: GetTerminalAuthCodeReq,
  ): Promise<NativeResponse<ApiResponse>> {
    throw new Error('Function not implemented.');
  },
  nis: {
    listNisServer: function (_req: ApiPageRequest): Promise<NativeResponse<ListNisServerResp>> {
      throw new Error('Function not implemented.');
    },
  },
  getQrCodeUrl: function (_req: GetQrCodeUrlReq): Promise<NativeResponse<GetQrCodeUrlResp>> {
    throw new Error('Function not implemented.');
  },
  getSmsCaptcha: function (_req: GetSmsCaptchaReq): Promise<NativeResponse<ApiResponse>> {
    throw new Error('Function not implemented.');
  },
  getDynamicPwdQrCode: function (
    _req: GetDynamicPwdQrCodeReq,
  ): Promise<NativeResponse<GetDynamicPwdQrCodeResp>> {
    throw new Error('Function not implemented.');
  },
  checkTerminalUser: function (
    _req: CheckTerminalUserReq,
  ): Promise<NativeResponse<CheckTerminalUserResp>> {
    throw new Error('Function not implemented.');
  },
  terminalPhoneLogin: function (
    _req: TerminalPhoneLoginReq,
  ): Promise<NativeResponse<TerminalPhoneLoginResp>> {
    throw new Error('Function not implemented.');
  },
  loginUser: function (_req: LoginUserReq): Promise<NativeResponse<LoginUserResp>> {
    throw new Error('Function not implemented.');
  },
  logoutUser: function (_req: LogoutUserReq): Promise<NativeResponse<ApiResponse>> {
    throw new Error('Function not implemented.');
  },
};
