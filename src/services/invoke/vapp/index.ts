import { invoke } from '@/utils/invoke';
import type { ConnectVappReq } from './types';

export enum VappInvoke {
  CONNECT_VAPP = 'connect_vapp',
}

/**
 * 连接vapp
 */
export const connectVapp = (data: ConnectVappReq) => {
  return invoke(VappInvoke.CONNECT_VAPP, data);
};
