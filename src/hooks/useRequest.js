import { handleStoreUnauthorized } from '@/store/runtime-access';
import handleError from '@/utils/requestErrorHandler';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_THROTTLE_INTERVAL = 500;

const isFunction = (value) => typeof value === 'function';

const isEmptyValue = (value) => {
  if (value == null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Error) return false;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const useLatest = (value) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

const getSuccessPayload = (res) => {
  if (Array.isArray(res?.data)) {
    const { requestId: _requestId, timestamp: _timestamp, ...rest } = res;
    return rest;
  }
  return res?.data ?? res;
};

const getFormattedResult = (res, options) => {
  const { formatResult } = options;
  if (Array.isArray(res?.data)) {
    const { requestId: _requestId, timestamp: _timestamp, ...rest } = res.data;
    return {
      ...res,
      data: isFunction(formatResult) ? formatResult(res.data) : rest,
    };
  }
  return {
    ...res,
    data: isFunction(formatResult) ? formatResult(res?.data ?? res) : (res?.data?.data ?? res?.data),
  };
};

const handleRequestError = (err, options) => {
  if (isEmptyValue(err)) return;

  const { httpStatus } = err;
  if (httpStatus === 401 && location.pathname !== '/login') {
    // 接口无权访问强制退出
    void handleStoreUnauthorized();
    window.location.href = '/login';
  }

  if (options?.onError) {
    options.onError(err);
    return;
  }

  handleError(err);
};

/**
 * 封装useRequest, 设置全局属性配置
 * @param { string | object | ((...args:any) => string | object) }
 * @param {object} options useRequest options,所有的 Options 均是可选的
 */
export default (service, options = {}) => {
  const serviceRef = useLatest(service);
  const optionsRef = useLatest(options);
  const mountedRef = useRef(true);
  const lastParamsRef = useRef([]);
  const throttleTimerRef = useRef(null);
  const throttledRef = useRef(false);
  const lastPromiseRef = useRef(Promise.resolve());

  const [data, setData] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...params) => {
    const currentOptions = optionsRef.current || {};
    setLoading(true);
    setError(undefined);

    try {
      const response = await serviceRef.current(...params);
      if (!mountedRef.current) return response;

      setData(getFormattedResult(response, currentOptions));

      if (response !== undefined) {
        currentOptions.onSuccess?.(getSuccessPayload(response), params);
      }

      return response;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        handleRequestError(err, currentOptions);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const run = useCallback(
    (...params) => {
      lastParamsRef.current = params;

      const currentOptions = optionsRef.current || {};
      const throttleInterval = currentOptions.throttleInterval ?? DEFAULT_THROTTLE_INTERVAL;
      if (throttleInterval > 0 && throttledRef.current) {
        return lastPromiseRef.current;
      }

      throttledRef.current = throttleInterval > 0;
      if (throttleTimerRef.current) {
        window.clearTimeout(throttleTimerRef.current);
      }
      if (throttleInterval > 0) {
        throttleTimerRef.current = window.setTimeout(() => {
          throttledRef.current = false;
          throttleTimerRef.current = null;
        }, throttleInterval);
      }

      const nextPromise = execute(...params);
      lastPromiseRef.current = nextPromise;
      return nextPromise;
    },
    [execute],
  );

  const refresh = useCallback(() => run(...lastParamsRef.current), [run]);

  useEffect(() => {
    if (optionsRef.current?.manual === true) return;
    const defaultParams = optionsRef.current?.defaultParams || [];
    void run(...defaultParams);
  }, [run]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (throttleTimerRef.current) {
        window.clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    error,
    loading,
    run,
    refresh,
  };
};
