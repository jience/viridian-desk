import type { NativeResponse } from '@/native/interfaces/types';
import { message as uiMessage } from '@/shared/ui/message';
import { logger } from '@/utils/logger';
import { t, type Resources } from 'i18next';

const hasErrorData = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

function getLoginErrorTimesExceedErrorMessage(
  { remainingSeconds }: { remainingSeconds: string },
  errorMessage: string,
) {
  // 处理remainingSeconds
  const intRemainingSeconds = parseInt(remainingSeconds);
  if (!isNaN(intRemainingSeconds)) {
    const minute = Math.floor(intRemainingSeconds / 60);
    const seconds = intRemainingSeconds % 60;

    if (minute && seconds) {
      return t('error_code.LoginErrorTimesExceed_MIN_SEC', {
        min: minute,
        sec: seconds,
      });
    }
    if (seconds && !minute) {
      return t('error_code.LoginErrorTimesExceed', { sec: seconds });
    }
    return t('error_code.LoginErrorTimesExceed_MIN_SEC', {
      min: minute,
      sec: seconds,
    });
  }
  return errorMessage;
}
/**
 * @description 错误方法处理
 * @param {*} res
 */
function handleError(res: NativeResponse<any>) {
  let message = '';

  const { data } = res;
  const errorCode = `error_code.${res.code}` as keyof Resources['translation'];
  if (errorCode) {
    // 默认初始翻译
    message = t(errorCode);

    // 用户未登录
    if (res.code === 'MustLoggedError') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('isLocal');
    }
    if (hasErrorData(data)) {
      message = t(errorCode, { ...(data as any) });
      logger.debug('message', message);
    }

    // 登录密码错误次数特殊翻译
    if (res.code === 'LoginErrorTimesExceed') {
      if (res?.data) {
        message = getLoginErrorTimesExceedErrorMessage(res.data as any, res.msg || '');
      }
    }

    // 用户密码不正确错误次数
    if (res.code === 'UserNamePasswordNotMatch') {
      const errorMessage = res?.data?.remainLoginCount
        ? t('error_code.NamePasswordNotMatchWithCount', {
            remainLoginCount: res?.data?.remainLoginCount,
          })
        : t(errorCode);
      message = errorMessage;
    }
  }
  //  else if (httpStatus) message = t(httpStatus);
  // 抛错
  uiMessage.error(message || res?.msg);
}

export default handleError;
