import type { NativeResponse } from '@/native/interfaces/types';
import { message as uiMessage } from '@/shared/ui/message';
import { logger } from '@/utils/logger';
import { t, type Resources } from 'i18next';

type ErrorDataRecord = Record<string, unknown> & {
  remainingSeconds?: string | number;
  remainLoginCount?: string | number;
};

const hasErrorData = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

const isErrorDataRecord = (value: unknown): value is ErrorDataRecord =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.keys(value).length > 0;

function getLoginErrorTimesExceedErrorMessage(
  { remainingSeconds }: { remainingSeconds?: string | number },
  errorMessage: string,
) {
  // 处理remainingSeconds
  const intRemainingSeconds = parseInt(String(remainingSeconds));
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
function handleError(res: NativeResponse<unknown>) {
  let message = '';

  const { data } = res;
  const errorCode = `error_code.${res.code}` as keyof Resources['translation'];
  if (res.code) {
    // 默认初始翻译
    message = t(errorCode);

    // 用户未登录
    if (res.code === 'MustLoggedError') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('isLocal');
    }
    if (hasErrorData(data) && isErrorDataRecord(data)) {
      message = t(errorCode, data);
      logger.debug('message', message);
    }

    // 登录密码错误次数特殊翻译
    if (res.code === 'LoginErrorTimesExceed') {
      if (isErrorDataRecord(data)) {
        message = getLoginErrorTimesExceedErrorMessage(data, res.msg || '');
      }
    }

    // 用户密码不正确错误次数
    if (res.code === 'UserNamePasswordNotMatch') {
      const remainLoginCount = isErrorDataRecord(data) ? data.remainLoginCount : undefined;
      const errorMessage = remainLoginCount
        ? t('error_code.NamePasswordNotMatchWithCount', {
            remainLoginCount,
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
