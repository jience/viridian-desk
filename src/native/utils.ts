import type { NativeResponse } from './interfaces/types';

/**
 * 构造成功响应
 * @param data 返回的数据
 */
export function success<T = void>(data?: T): NativeResponse<T> {
  return { data: (data ?? null) as any };
}

/**
 * 构造失败响应
 * @param code 错误码
 * @param msg 错误信息
 */
export function failure<T = void>(code: string, msg: string, data?: T): NativeResponse<T> {
  return { code, msg, data: data ?? (null as any) };
}
