import type { LoginUserInfo } from '@/native/interfaces/api';
import type {
  DiagnoseEvent,
  GetLogInfoRes,
  ICmdModule,
  NetProbeItemRender,
  SetLogReq,
} from '@/native/interfaces/cmd';
import { Channel } from '@tauri-apps/api/core';
import { wrapInvoke } from '../utils';

export const CmdInvoke = {
  GET_LOCAL_NET_INFO: 'get_local_net_info',
  DIAGNOSE_GATEWAY_NETWORK: 'diagnose_gateway_network',
  SHUTDOWN_LOCAL_DEVICE: 'shutdown_local_device',
  GET_LOG_INFO: 'get_log_info',
  CLEAN_LOG_FILE: 'clean_log_file',
  OPEN_LOG_DIRECTORY: 'open_log_directory',
  SET_LOG: 'set_log',
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;

export type CmdInvoke = (typeof CmdInvoke)[keyof typeof CmdInvoke];

export const cmd_module: ICmdModule = {
  getLocalNetInfo: async () => {
    return wrapInvoke<NetProbeItemRender[]>(CmdInvoke.GET_LOCAL_NET_INFO);
  },

  diagnoseGatewayNetwork: async (onEvent?: (event: DiagnoseEvent) => void) => {
    const channel = new Channel<DiagnoseEvent>();

    if (onEvent) {
      channel.onmessage = onEvent;
    }

    return wrapInvoke<void>(CmdInvoke.DIAGNOSE_GATEWAY_NETWORK, { args: { onEvent: channel } });
  },

  shutdownLocalDevice: async () => {
    return wrapInvoke<void>(CmdInvoke.SHUTDOWN_LOCAL_DEVICE);
  },

  getLogInfo: async () => {
    return wrapInvoke<GetLogInfoRes>(CmdInvoke.GET_LOG_INFO);
  },

  cleanLogFile: async () => {
    return wrapInvoke<void>(CmdInvoke.CLEAN_LOG_FILE);
  },

  openLogDirectory: async () => {
    return wrapInvoke<void>(CmdInvoke.OPEN_LOG_DIRECTORY);
  },

  setLog: async (data: SetLogReq) => {
    return wrapInvoke<void>(CmdInvoke.SET_LOG, { args: data });
  },

  login: async (userInfo: LoginUserInfo, authToken: string = 'Auth111') => {
    return wrapInvoke<void>(CmdInvoke.LOGIN, { args: { userInfo, authToken } });
  },

  logout: async () => {
    return wrapInvoke<void>(CmdInvoke.LOGOUT);
  },
};
