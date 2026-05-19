export type NativeResponse<T = void> = {
  code?: string;
  msg?: string;
  data: T extends void ? null : T;
};

/**
 * 清理监听的函数类型
 */
export type UnlistenFn = () => void;

export type NativeDialogFilter = {
  name: string;
  extensions: string[];
};

export type NativeOpenDialogOptions = {
  multiple?: boolean;
  directory?: boolean;
  title?: string;
  filters?: NativeDialogFilter[];
};

/**
 * 发送的事件及其数据类型
 */
export interface AppEventMap {
  'client-online': { is_online: boolean };
  'desktop-connect': unknown;
  'desktop-list': unknown;
  'desktop-idle-disconnect': unknown;
  'desktop-idle-close': unknown;
  'user-idle-logout': unknown;
  test_hello_world: NativeResponse<{ percent: number; speed: string }>;
}
