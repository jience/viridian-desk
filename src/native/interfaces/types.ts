export type NativeResponse<T = void> = {
  code?: string;
  msg?: string;
  data: T extends void ? null : T;
};

/**
 * 清理监听的函数类型
 */
export type UnlistenFn = () => void;

/**
 * 发送的事件及其数据类型
 */
export interface AppEventMap {
  test_hello_world: NativeResponse<{ percent: number; speed: string }>;
}
