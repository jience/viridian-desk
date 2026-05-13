import type {
  GetClientAboutResp,
  GetClientConfigResp,
  GetTerminalInfoResp,
  ITerminalModule,
} from '@/native/interfaces/terminal';
import { wrapInvoke } from '../utils';

export const TerminalInvoke = {
  GET_CLIENT_ABOUT: 'get_client_about',
  GET_CLIENT_CONFIG: 'get_client_config',
  GET_TERMINAL_INFO: 'get_terminal_info',
} as const;

export type TerminalInvoke = (typeof TerminalInvoke)[keyof typeof TerminalInvoke];

export const terminal_module: ITerminalModule = {
  getClientAbout: () => {
    return wrapInvoke<GetClientAboutResp>(TerminalInvoke.GET_CLIENT_ABOUT);
  },
  getClientConfig: () => {
    return wrapInvoke<GetClientConfigResp>(TerminalInvoke.GET_CLIENT_CONFIG);
  },
  getTerminalInfo: () => {
    return wrapInvoke<GetTerminalInfoResp>(TerminalInvoke.GET_TERMINAL_INFO);
  },
};
