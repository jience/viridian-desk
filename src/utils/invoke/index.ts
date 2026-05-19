import type { InvokeArgs, InvokeOptions } from '@tauri-apps/api/core';
import { message } from '@/ui';
import { logger } from '@/utils/logger';

export type InvokeOpt = Partial<
  InvokeOptions & {
    hideErrMessage: boolean; // 是否隐藏错误消息提示, 默认显示
  }
>;

/**
 * 打印Invoke请求日志
 */
const logInvokeRequest = (prefix: string, content: unknown) => {
  logger.debug(`[INVOKE][${prefix}]`, content);
};

export const invoke = async <T>(
  cmd: string,
  args?: InvokeArgs | undefined,
  options?: InvokeOpt | undefined,
) => {
  const { hideErrMessage, ...invokeOptions } = options || ({} as InvokeOpt);
  try {
    logInvokeRequest(cmd, args);
    const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
    const response = await tauriInvoke<T>(cmd, args, invokeOptions as Required<InvokeOptions>);
    logInvokeRequest(`${cmd} response`, response);
    return response;
  } catch (error) {
    logger.error('Error invoking Tauri command:', error);
    if (typeof error === 'string' && !hideErrMessage) message.error(error);
    throw error;
  }
};
