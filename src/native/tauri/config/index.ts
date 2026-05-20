import type {
  AddGatewayServerReq,
  GetAppConfResp,
  GetGatewayServerResp,
  IConfigModule,
  LogLevel,
  ThemeType,
  UpdateGatewayServerReq,
} from '@/native/interfaces/config';
import { wrapInvoke } from '../utils';

const GatewayInvoke = {
  GET_GATEWAY_SERVER: 'get_gateway_server',
  ADD_GATEWAY_SERVER: 'add_gateway_server',
  SWITCH_GATEWAY_SERVER: 'switch_gateway_server',
  UPDATE_GATEWAY_SERVER: 'update_gateway_server',
  DELETE_GATEWAY_SERVER: 'delete_gateway_server',
  GET_APP_CONF: 'get_app_conf',
  SET_DEVELOPER_MODE: 'set_developer_mode',
  SET_LOG_FILTER: 'set_log_filter',
  SET_THEME: 'set_theme',
  SET_LANGUAGE: 'set_language',
  SET_AUTOSTART: 'set_autostart',
  SET_FULLSCREEN: 'set_fullscreen',
  SET_AUTO_UPDATE: 'set_autoupdate',
} as const;

export type GatewayInvoke = (typeof GatewayInvoke)[keyof typeof GatewayInvoke];

export const config_module: IConfigModule = {
  getGatewayServer: () => {
    return wrapInvoke<GetGatewayServerResp>(GatewayInvoke.GET_GATEWAY_SERVER);
  },
  addGatewayServer: (gatewayInfo: AddGatewayServerReq) => {
    return wrapInvoke<void>(GatewayInvoke.ADD_GATEWAY_SERVER, { args: gatewayInfo });
  },
  switchGatewayServer: (gwid?: string) => {
    return wrapInvoke<void>(GatewayInvoke.SWITCH_GATEWAY_SERVER, { args: { gwid } });
  },
  updateGatewayServer: (gatewayInfo: UpdateGatewayServerReq) => {
    return wrapInvoke<void>(GatewayInvoke.UPDATE_GATEWAY_SERVER, { args: gatewayInfo });
  },
  deleteGatewayServer: (gwid?: string) => {
    return wrapInvoke<void>(GatewayInvoke.DELETE_GATEWAY_SERVER, { args: { gwid } });
  },
  getAppConf: () => {
    return wrapInvoke<GetAppConfResp>(GatewayInvoke.GET_APP_CONF);
  },
  setDeveloperMode: (developerMode: boolean) => {
    return wrapInvoke<void>(GatewayInvoke.SET_DEVELOPER_MODE, { args: { developerMode } });
  },
  setLogFilter: (level: LogLevel) => {
    return wrapInvoke<void>(GatewayInvoke.SET_LOG_FILTER, { args: { level } });
  },
  setTheme: (theme: ThemeType) => {
    return wrapInvoke<void>(GatewayInvoke.SET_THEME, { args: { theme } });
  },
  setLanguage: (language: string) => {
    return wrapInvoke<void>(GatewayInvoke.SET_LANGUAGE, { args: { language } });
  },
  setAutoStart: (autoStart: boolean) => {
    return wrapInvoke<void>(GatewayInvoke.SET_AUTOSTART, { args: { autoStart } });
  },
  setFullScreen: (fullScreen: boolean) => {
    return wrapInvoke<void>(GatewayInvoke.SET_FULLSCREEN, { args: { fullScreen } });
  },
  setAutoUpdate: (autoUpdate: boolean) => {
    return wrapInvoke<void>(GatewayInvoke.SET_AUTO_UPDATE, { args: { autoUpdate } });
  },
};
