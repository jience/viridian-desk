import type { LoginUserInfo } from '@/native/interfaces/api';
import type {
  ConnectDesktopReq,
  DiagnoseEvent,
  GetLogInfoRes,
  ICmdModule,
  NetProbeItemRender,
  SetLogReq,
} from '@/native/interfaces/cmd';
import type { NativeResponse } from '@/native/interfaces/types';
import { success } from '@/native/utils';

export const cmd_module: ICmdModule = {
  getLocalNetInfo: function (): Promise<NativeResponse<NetProbeItemRender[]>> {
    throw new Error('Function not implemented.');
  },
  getClientOnlineStatus: async function (): Promise<NativeResponse<boolean>> {
    return success(false);
  },
  diagnoseGatewayNetwork: function (
    _onEvent?: (event: DiagnoseEvent) => void,
  ): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
  shutdownLocalDevice: function (): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
  getLogInfo: function (): Promise<NativeResponse<GetLogInfoRes>> {
    throw new Error('Function not implemented.');
  },
  cleanLogFile: function (): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
  openLogDirectory: function (): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
  openNetworkSettings: async function (): Promise<NativeResponse> {
    return success();
  },
  openDocs: async function (): Promise<NativeResponse> {
    return success();
  },
  connectDesktop: async function (_data: ConnectDesktopReq): Promise<NativeResponse> {
    return success();
  },
  setLog: function (_data: SetLogReq): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
  login: function (_userInfo: LoginUserInfo, _authToken?: string): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
  logout: function (): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
};
