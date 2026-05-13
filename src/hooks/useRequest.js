import { appStore } from '@/store';
import { logoutCurrentUser } from '@/store/feature/app';
import handleError from '@/utils/requestErrorHandler';
import { useRequest } from 'ahooks';
import { isEmpty, isFunction } from 'lodash-es';
/**
 * 合并处理 Options
 * @param {*} options useRequest options
 */
const combinedOptions = (options) => ({
  throttleInterval: 500, // 默认节流, 500毫秒
  ...options,
  onSuccess: (res, ...resParams) => {
    let outPut;
    if (Array.isArray(res?.data)) {
      const { requestId, timestamp, ...rest } = res;
      outPut = rest;
    } else {
      outPut = res.data ?? res;
    }

    if (res !== undefined) {
      options.onSuccess && options.onSuccess(outPut, ...resParams);
    }
  },
  onError: (err) => {
    if (!isEmpty(err)) {
      const { httpStatus } = err;
      if (httpStatus === 401 && location.pathname !== '/login') {
        // 接口无权访问强制退出
        appStore.dispatch(logoutCurrentUser(false));
        window.location.href = '/login';
      }
      if (!options?.onError) {
        handleError(err);
      } else options?.onError(err);
    }
  },
});

const handleFormatResult = (res, options) => {
  const { formatResult } = options;
  if (Array.isArray(res?.data)) {
    const { requestId, timestamp, ...rest } = res.data;
    return {
      ...res,
      data: isFunction(formatResult) ? formatResult(res.data) : rest,
    };
  } else {
    return {
      ...res,
      data: isFunction(formatResult) ? formatResult(res.data ?? res) : (res.data?.data ?? res.data),
    };
  }
};
/**
 * 封装useRequest, 设置全局属性配置
 * @param { string | object | ((...args:any) => string | object) }
 * @param {object} options useRequest options,所有的 Options 均是可选的
 */
export default (service, options) =>
  handleFormatResult(useRequest(service, combinedOptions(options)), options);
