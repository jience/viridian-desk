import type { NativeResponse } from './interfaces/types';

/**
 * 构造成功响应
 * @param data 返回的数据
 */
export function success(): NativeResponse;
export function success<T>(data: T): NativeResponse<T>;
export function success<T>(data?: T): NativeResponse | NativeResponse<T> {
  if (data === undefined) return { data: null };
  return { data } as NativeResponse<T>;
}

/**
 * 构造失败响应
 * @param code 错误码
 * @param msg 错误信息
 */
export function failure(code: string, msg: string): NativeResponse;
export function failure<T>(code: string, msg: string, data: T): NativeResponse<T>;
export function failure<T>(code: string, msg: string, data?: T): NativeResponse | NativeResponse<T> {
  if (data === undefined) return { code, msg, data: null };
  return { code, msg, data } as NativeResponse<T>;
}
