import { globalInterceptors } from '@/native';
import handleError from './requestErrorHandler';

export const setupServices = () => {
  globalInterceptors.use({
    // 普通请求日志
    onRequest: (ctx) => {
      console.log(`[Services Call] ${ctx.method}`, ctx.args);
    },

    // 普通响应日志
    onResponse: (res, ctx) => {
      console.log(`[Services Return] ${ctx.method}`, res);
      return res;
    },

    onError(error, ctx) {
      console.error(`[Services Error] ${ctx.method}`, error);
      if (error.code) {
        handleError(error);
      }
      return error;
    },

    // 事件监听日志
    onEventTrigger: (eventName, payload) => {
      console.log(`[Services Event] 收到事件: ${eventName}`, payload);
    },
  });
};
