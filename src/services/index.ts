import { globalInterceptors } from '@/native';
import { logger } from '@/utils/logger';
import handleError from './requestErrorHandler';

export const setupServices = () => {
  globalInterceptors.use({
    // 普通请求日志
    onRequest: (ctx) => {
      logger.debug(`[Services Call] ${ctx.method}`, ctx.args);
    },

    // 普通响应日志
    onResponse: (res, ctx) => {
      logger.debug(`[Services Return] ${ctx.method}`, res);
      return res;
    },

    onError(error, ctx) {
      logger.error(`[Services Error] ${ctx.method}`, error);
      if (error.code) {
        handleError(error);
      }
      return error;
    },

    // 事件监听日志
    onEventTrigger: (eventName, payload) => {
      logger.debug(`[Services Event] 收到事件: ${eventName}`, payload);
    },
  });
};
