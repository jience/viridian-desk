import { appStore } from '@/store';
import { fetch, type ClientOptions } from '@tauri-apps/plugin-http';
import { isEmpty } from 'lodash-es';
import { globalEmitter } from '../mitt';
import { isApiErrResponse, type ApiResponse } from './types';
import { logger } from '@/utils/logger';
import { getWebPreviewResponse } from './web-preview';

type FetchOpt = RequestInit & ClientOptions;
export interface RequestOptions<B = any> extends Omit<FetchOpt, 'body'> {
  body?: B;
}

/**
 * @author ALEX
 * @date 2021-12-24 13:52:03
 * @version V..
 * @description 用于处理拦截器抛出的异常信息
 */
const interceptorErr = async (resp: any) => {
  if (isApiErrResponse(resp)) {
    globalEmitter.emit('api/error', resp);
  }
  return resp;
};

/**
 * @author ALEX
 * @functionName _beforeRequest
 * @param { ClientOptions } config
 * @param { Object } requestParams
 * @date 2024-04-08 11:41:21
 * @version V..
 * @description 前置拦截器，处理headers参数，处理请求体参数query，body
 */
const beforeRequest = (config?: RequestOptions): FetchOpt => {
  const { headers, ...resConfig } = config || {};

  const newHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  };
  const h = newHeaders as Record<string, string>;
  const deviceId = appStore.getState().terminal?.id;
  if (deviceId) h['X-Device-Id'] = deviceId;
  const userId = appStore.getState().app.currentUser?.userId;
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
    ...resConfig,
  };

  return resOpt;
};

/**
 * 打印HTTP请求日志
 * @param method HTTP方法
 * @param api 接口路径
 * @param data 请求或响应数据
 * @param status HTTP状态码（可选）
 */
const logHttpRequest = (prefix: string, content: unknown) => {
  logger.debug(`[HTTP][${prefix}]`, content);
};

const formateApi = (api: string) => {
  const autoGateway = appStore.getState().gateway.autoGateway;
  if (autoGateway) {
    return `https://${autoGateway.address}:${autoGateway.port}${import.meta.env.VITE_API_PREFIX}${api}`;
  }
  return `${import.meta.env.VITE_BASE_DEFAULT_URL}${import.meta.env.VITE_API_PREFIX}${api}`;
};

export const request = async <RESP = ApiResponse, REQ = any>(
  api: string,
  opt?: RequestOptions<REQ>,
) => {
  globalEmitter.emit('api/startLoading', api);
  const opts: FetchOpt = beforeRequest(opt);

  const fullApi = formateApi(api);

  logHttpRequest(`${opts.method || 'GET'} ${api}`, opts);

  try {
    const webPreviewResponse = getWebPreviewResponse<RESP>(api);
    if (webPreviewResponse) {
      logHttpRequest(`${opts.method || 'GET'} web-preview ${api}`, webPreviewResponse);
      return webPreviewResponse;
    }

    const fetchRes = await fetch(fullApi, opts);
    const resp = await fetchRes.json();
    logHttpRequest(`${opts.method || 'GET'} ${fetchRes.status} ${api}`, resp);
    if (fetchRes.status == 200) {
      return resp as RESP;
    } else {
      throw await interceptorErr(resp);
    }
  } catch (e) {
    logHttpRequest(`${opts.method || 'GET'} ${api}`, e);
    throw await interceptorErr(e);
  } finally {
    globalEmitter.emit('api/stopLoading', api);
  }
};
