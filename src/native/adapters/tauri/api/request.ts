import type { ApiResponse } from '@/native/interfaces/api';
import { fetch, type ClientOptions } from '@tauri-apps/plugin-http';
import { isEmpty } from 'lodash-es';

type FetchOpt = RequestInit & ClientOptions;
export interface RequestOptions<B = any> extends Omit<FetchOpt, 'body'> {
  body?: B;
}

// 延迟导入 store 以避免循环依赖
// 使用 getter 函数，在运行时才真正访问 store
const getAppStore = async () => {
  const { appStore } = await import('@/store');
  return appStore;
};

/**
 * 请求前的处理
 */
const beforeRequest = async (config?: RequestOptions): Promise<FetchOpt> => {
  const { headers, ...resConfig } = config || {};
  const appStore = await getAppStore();

  const newHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  };
  const h = newHeaders as Record<string, string>;
  const deviceId = appStore.getState().terminal?.id;
  if (deviceId) h['X-Device-Id'] = deviceId;
  const { userId } = appStore.getState().app.currentUser || {};
  if (userId) h['VisitorId'] = userId;

  // 如果body是FormData类型
  if (resConfig?.body instanceof FormData) {
    h['Content-Type'] = 'multipart/form-data';
  }
  // 如果body是对象
  if (typeof resConfig?.body === 'object' && !isEmpty(resConfig.body)) {
    h['Content-Type'] = 'application/json';
    // 如果是对象，且不是FormData类型，则转换为JSON字符串
    resConfig.body = JSON.stringify(resConfig.body);
  }

  const resOpt: FetchOpt = {
    connectTimeout: +import.meta.env.VITE_API_TIMEOUT, // 60秒
    danger: {
      acceptInvalidCerts: true,
      acceptInvalidHostnames: true,
    },
    headers: newHeaders,
    method: 'POST',
    ...resConfig,
  };

  return resOpt;
};

const formateApi = async (api: string) => {
  const autoGateway = (await getAppStore()).getState().gateway.autoGateway;
  if (autoGateway) {
    return `https://${autoGateway.address}:${autoGateway.port}${import.meta.env.VITE_API_PREFIX}${api}`;
  }
  return `${import.meta.env.VITE_BASE_DEFAULT_URL}${import.meta.env.VITE_API_PREFIX}${api}`;
};

export const request = async <RESP = ApiResponse, REQ = any>(
  api: string,
  opt?: RequestOptions<REQ>,
) => {
  const opts: FetchOpt = await beforeRequest(opt);

  const fullApi = await formateApi(api);

  const fetchRes = await fetch(fullApi, opts);
  const resp = await fetchRes.json();
  if (fetchRes.status == 200) {
    return resp as RESP;
  } else {
    if (fetchRes.status === 401 && location.pathname !== '/login') {
      const { logoutCurrentUser } = await import('@/store/feature/app');
      const appStore = await getAppStore();
      await appStore.dispatch(logoutCurrentUser(false));
      window.location.href = '/login';
    }
    throw resp;
  }
};
