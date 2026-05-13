import type { NativeResponse } from './interfaces/types';

export interface InterceptorContext {
  module?: string;
  method: string;
  args: any[];
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
    response: NativeResponse<any>,
    ctx: InterceptorContext,
  ) => Promise<NativeResponse<any>> | NativeResponse<any>;

  /**
   * 错误拦截
   * 可以统一处理异常，如弹窗提示
   */
  onError?: (error: any, ctx: InterceptorContext) => Promise<any> | any;

  /**
   * 事件触发拦截
   * 当通过 onEvent 监听到消息时触发
   */
  onEventTrigger?: (eventName: string, payload: any) => void;
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

/**
 * 创建代理 Bridge
 * 使用 Proxy 模式递归拦截所有方法调用
 */
export function createBridgeProxy<T extends object>(target: T, moduleName?: string): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      const key = String(prop);
      // 1. 如果是函数，进行拦截
      if (typeof value === 'function') {
        return async (...args: any[]) => {
          const ctx: InterceptorContext = {
            module: moduleName,
            method: key,
            args,
          };

          const interceptors = globalInterceptors.getInterceptors();

          // onEvent 的签名固定为: onEvent(eventName, callback)
          if (key === 'onEvent' && args.length >= 2 && typeof args[1] === 'function') {
            const eventName = args[0];
            const originalCallback = args[1];

            // 劫持回调函数
            args[1] = (payload: any) => {
              // 1. 触发拦截器的 onEventTrigger
              interceptors.forEach((interceptor) => {
                if (interceptor.onEventTrigger) {
                  try {
                    interceptor.onEventTrigger(eventName, payload);
                  } catch (e) {
                    console.error('[Interceptor] onEventTrigger error:', e);
                  }
                }
              });

              // 2. 执行原始回调
              originalCallback(payload);
            };
          }

          try {
            // --- onRequest 阶段 ---
            for (const interceptor of interceptors) {
              if (interceptor.onRequest) {
                await interceptor.onRequest(ctx);
              }
            }

            // --- 执行原方法 ---
            // 绑定 this 防止上下文丢失
            let result = await value.apply(obj, args);

            // --- onResponse 阶段 ---
            for (const interceptor of interceptors) {
              if (interceptor.onResponse) {
                result = await interceptor.onResponse(result, ctx);
              }
            }

            return result;
          } catch (error) {
            // --- onError 阶段 ---
            let handledError = error;
            for (const interceptor of interceptors) {
              if (interceptor.onError) {
                // 允许拦截器处理错误并返回新的结果，或者继续抛出
                try {
                  const newResult = await interceptor.onError(handledError, ctx);
                  if (newResult !== undefined) {
                    throw newResult; // 错误被处理，返回兜底数据
                  }
                } catch (e) {
                  handledError = e; // 拦截器内部报错，更新错误对象
                }
              }
            }
            throw handledError; // 如果没被完全吞掉，继续抛出
          }
        };
      }

      // 2. 如果是对象（且不是 null），递归代理（用于处理 bridge.appUpdates.xxx 这种嵌套结构）
      if (typeof value === 'object' && value !== null) {
        // 传递模块名，方便日志追踪
        return createBridgeProxy(value, key);
      }

      // 3. 其他属性直接返回
      return value;
    },
  });
}
