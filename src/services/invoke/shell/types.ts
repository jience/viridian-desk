export interface UsbDeviceItem {
  VID: string;
  PID: string;
  DEVICE_NAME: string;
  DEVICE_TYPE: string;
}

export type ListUsbDevicesResp = UsbDeviceItem[];
