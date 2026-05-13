import type {
  AddGatewayServerReq,
  GetAppConfResp,
  GetGatewayServerResp,
  IConfigModule,
  LogLevel,
  ThemeType,
  UpdateGatewayServerReq,
} from '@/native/interfaces/config';
import type { NativeResponse } from '@/native/interfaces/types';

export const config_module: IConfigModule = {
  getGatewayServer: function (): Promise<NativeResponse<GetGatewayServerResp>> {
    throw new Error('Function not implemented.');
  },
  addGatewayServer: function (_gatewayInfo: AddGatewayServerReq): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  switchGatewayServer: function (_gwid?: string): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  updateGatewayServer: function (
    _gatewayInfo: UpdateGatewayServerReq,
  ): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  deleteGatewayServer: function (_gwid?: string): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  getAppConf: function (): Promise<NativeResponse<GetAppConfResp>> {
    throw new Error('Function not implemented.');
  },
  setDeveloperMode: function (_developerMode: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setLogFilter: function (_level: LogLevel): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setTheme: function (_theme: ThemeType): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setLanguage: function (_language: string): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setAutoStart: function (_autoStart: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setFullScreen: function (_fullScreen: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setAutoUpdate: function (_autoUpdate: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
};
