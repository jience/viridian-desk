import type { ApiResponse } from '@/native/interfaces/api';
import { getStoreState, handleStoreUnauthorized } from '@/store/runtime-access';
import { isFormDataBody, normalizeRequestBody, shouldEncodeJsonBody } from '@/utils/request/body';
import type { ClientOptions } from '@tauri-apps/plugin-http';

type FetchOpt = RequestInit & ClientOptions;
export interface RequestOptions<B = unknown> extends Omit<FetchOpt, 'body'> {
  body?: B;
}

/**
 * 请求前的处理
 */
const beforeRequest = async (config?: RequestOptions): Promise<FetchOpt> => {
  const { body, headers, ...resConfig } = config || {};
  const state = getStoreState();

  const newHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  };
  const h = newHeaders as Record<string, string>;
  const deviceId = state?.terminal?.id;
  if (deviceId) h['X-Device-Id'] = deviceId;
  const { userId } = state?.app.currentUser || {};
  if (userId) h['VisitorId'] = userId;

  // 如果body是FormData类型
  if (isFormDataBody(body)) {
    h['Content-Type'] = 'multipart/form-data';
  }
  // 如果body是对象
  if (shouldEncodeJsonBody(body)) {
    h['Content-Type'] = 'application/json';
  }

  const resOpt: FetchOpt = {
    connectTimeout: +import.meta.env.VITE_API_TIMEOUT, // 60秒
    danger: {
      acceptInvalidCerts: true,
      acceptInvalidHostnames: true,
    },
    headers: newHeaders,
    method: 'POST',
    body: normalizeRequestBody(body),
    ...resConfig,
  };

  return resOpt;
};

const formateApi = async (api: string) => {
  const autoGateway = getStoreState()?.gateway.autoGateway;
  if (autoGateway) {
    return `https://${autoGateway.address}:${autoGateway.port}${import.meta.env.VITE_API_PREFIX}${api}`;
  }
  return `${import.meta.env.VITE_BASE_DEFAULT_URL}${import.meta.env.VITE_API_PREFIX}${api}`;
};

const fetchHttp = async (url: string, opts: FetchOpt) => {
  const { fetch } = await import('@tauri-apps/plugin-http');
  return fetch(url, opts);
};

export const request = async <RESP = ApiResponse, REQ = unknown>(
  api: string,
  opt?: RequestOptions<REQ>,
) => {
  const opts: FetchOpt = await beforeRequest(opt);

  const fullApi = await formateApi(api);

  const fetchRes = await fetchHttp(fullApi, opts);
  const resp = await fetchRes.json();
  if (fetchRes.status == 200) {
    return resp as RESP;
  } else {
    if (fetchRes.status === 401 && location.pathname !== '/login') {
      await handleStoreUnauthorized();
      window.location.href = '/login';
    }
    throw resp;
  }
};
