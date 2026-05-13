import { invoke as tauriInvoke, type InvokeArgs, type InvokeOptions } from '@tauri-apps/api/core';
import { message } from 'antd';

export type InvokeOpt = Partial<
  InvokeOptions & {
    hideErrMessage: boolean; // 是否隐藏错误消息提示, 默认显示
  }
>;

/**
 * 打印Invoke请求日志
 */
const logInvokeRequest = (prefix: string, content: unknown) => {
  if (import.meta.env.MODE !== 'development') return; // 仅在开发环境打印日志
  console.debug(
    `%c[INVOKE][${prefix}]%c`,
    'color: #189143; font-weight: bold; background: #f0f8ff; padding: 2px 4px; border-radius: 3px;',
    'color: #666;',
    content,
  );
};

export const invoke = async <T>(
  cmd: string,
  args?: InvokeArgs | undefined,
  options?: InvokeOpt | undefined,
) => {
  const { hideErrMessage, ...invokeOptions } = options || ({} as InvokeOpt);
  try {
    logInvokeRequest(cmd, args);
    const response = await tauriInvoke<T>(cmd, args, invokeOptions as Required<InvokeOptions>);
    logInvokeRequest(`${cmd} response`, response);
    return response;
  } catch (error) {
    console.error('Error invoking Tauri command:', error);
    if (typeof error === 'string' && !hideErrMessage) message.error(error);
    throw error;
  }
};
