import { invoke } from '@/utils/invoke';
import type { ListUsbDevicesResp } from './types';

export enum ShellInvoke {
  KILL_ALL_HDP_VIEWERS = 'kill_all_hdp_viewers',
  // 获取USB外设列表
  LIST_USB_DEVICES = 'list_usb_devices',
}

export const killAllHdpViewers = async () => {
  return await invoke(ShellInvoke.KILL_ALL_HDP_VIEWERS);
};

export const listUsbDevices = async () => {
  if (!(window as any).__TAURI_INTERNALS__) {
    return [];
  }
  return await invoke<ListUsbDevicesResp>(ShellInvoke.LIST_USB_DEVICES);
};
