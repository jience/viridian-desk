import { v4 as uuid } from 'uuid';

export interface InvokeIpcOptions {
  timeout?: number; // 超时时间，单位毫秒，默认 10000ms
}

export function invokeIpc<TReq, TRes>(
  eventName: string,
  req: TReq,
  opt: InvokeIpcOptions = {},
): Promise<TRes> {
  const { timeout = 10000 } = opt;
  return new Promise((resolve, reject) => {
    if (!window.ipcRenderer) {
      return reject(new Error('ipcRenderer not found'));
    }

    // 1. 生成唯一请求 ID
    const requestId = uuid();
    const cbEvent = eventName + '.cb';

    // 2. 定义处理函数
    const handler = (_: any, response: any) => {
      // 3. 关键点：检查返回的 ID 是否匹配
      // 假设主进程返回的数据结构是 { requestId: string, data: TRes, error?: string }
      if (response && response.requestId === requestId) {
        // 移除监听器 (注意：这里其实有个潜在问题，下面会解释)
        window.ipcRenderer?.removeListener(cbEvent, handler);

        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      }
      // 如果 ID 不匹配，说明这是别人的响应，忽略它，继续监听
    };

    // 4. 设置超时
    setTimeout(() => {
      window.ipcRenderer?.removeListener(cbEvent, handler);
      reject(new Error(`Request ${eventName} timed out (ID: ${requestId})`));
    }, timeout);

    // 5. 监听响应
    window.ipcRenderer.on(cbEvent, handler);

    // 6. 发送请求，带上 ID
    // 注意：这里需要和主进程约定好数据格式
    window.ipcRenderer.send(eventName, {
      requestId,
      data: req,
    });
  });
}

export function onIpcEvent<T>(eventName: string, handler: (data: T) => void): () => void {
  if (!window.ipcRenderer) return () => {};

  const listener = (_: any, resp: T) => {
    handler(resp);
  };

  window.ipcRenderer.on(eventName, listener);

  return () => {
    window.ipcRenderer?.removeListener(eventName, listener);
  };
}
