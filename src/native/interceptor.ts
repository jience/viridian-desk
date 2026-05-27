import type { NativeResponse } from './interfaces/types';
import { logger } from '@/utils/logger';

type NativeMethod = (...args: unknown[]) => unknown;

export interface InterceptorContext {
  module?: string;
  method: string;
  args: unknown[];
}

export interface IInterceptor {
  /**
   * 请求前拦截
   * 可以修改参数，或者抛出错误阻止请求
   */
  onRequest?: (ctx: InterceptorContext) => Promise<void> | void;

  /**
   * 响应后拦截
   * 可以修改返回数据
   */
  onResponse?: (
    response: NativeResponse<unknown>,
    ctx: InterceptorContext,
  ) => Promise<NativeResponse<unknown>> | NativeResponse<unknown>;

  /**
   * 错误拦截
   * 可以统一处理异常，如弹窗提示
   */
  onError?: (error: unknown, ctx: InterceptorContext) => Promise<unknown> | unknown;

  /**
   * 事件触发拦截
   * 当通过 onEvent 监听到消息时触发
   */
  onEventTrigger?: (eventName: string, payload: unknown) => void;
}

/**
 * 拦截器管理器
 */
class InterceptorManager {
  private interceptors: IInterceptor[] = [];

  use(interceptor: IInterceptor) {
    this.interceptors.push(interceptor);
  }

  getInterceptors() {
    return this.interceptors;
  }
}

export const globalInterceptors = new InterceptorManager();

const wrapEventCallback = (eventName: string, callback: (payload: unknown) => void) => {
  return (payload: unknown) => {
    for (const interceptor of globalInterceptors.getInterceptors()) {
      if (!interceptor.onEventTrigger) continue;
      try {
        interceptor.onEventTrigger(eventName, payload);
      } catch (error) {
        logger.error('[Interceptor] onEventTrigger error:', error);
      }
    }

    callback(payload);
  };
};

export async function runNativeMethod<T>(
  ctx: InterceptorContext,
  action: () => Promise<T> | T,
): Promise<T> {
  const interceptors = globalInterceptors.getInterceptors();

  try {
    for (const interceptor of interceptors) {
      await interceptor.onRequest?.(ctx);
    }

    let result = (await action()) as Awaited<T>;

    for (const interceptor of interceptors) {
      if (interceptor.onResponse) {
        result = (await interceptor.onResponse(
          result as NativeResponse<unknown>,
          ctx,
        )) as Awaited<T>;
      }
    }

    return result;
  } catch (error) {
    let handledError = error;
    for (const interceptor of interceptors) {
      if (!interceptor.onError) continue;
      try {
        const nextError = await interceptor.onError(handledError, ctx);
        if (nextError !== undefined) {
          throw nextError;
        }
      } catch (e) {
        handledError = e;
      }
    }
    throw handledError;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function withNativeInterceptors<T extends Record<string, unknown>>(
  target: T,
  moduleName?: string,
): T {
  const wrapped = {} as Record<string, unknown>;

  for (const [key, value] of Object.entries(target)) {
    if (typeof value === 'function') {
      wrapped[key] = (...args: unknown[]) => {
        const nextArgs = [...args];
        if (
          key === 'onEvent' &&
          typeof nextArgs[0] === 'string' &&
          typeof nextArgs[1] === 'function'
        ) {
          nextArgs[1] = wrapEventCallback(nextArgs[0], nextArgs[1] as (payload: unknown) => void);
        }

        const method = value as NativeMethod;

        return runNativeMethod(
          {
            module: moduleName,
            method: key,
            args,
          },
          () => method(...nextArgs),
        );
      };
      continue;
    }

    wrapped[key] = isRecord(value) ? withNativeInterceptors(value, key) : value;
  }

  return wrapped as T;
}
