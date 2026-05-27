import { t } from 'i18next';
import { message as uiMessage } from '@/shared/ui/message';
import { logger } from '@/utils/logger';

type ErrorDetail = Record<string, unknown> & {
  remainingSeconds?: string | number;
  remainLoginCount?: string | number;
};

type ErrorPayload = {
  errorCode?: string;
  errorMessage?: string;
  errorDetail?: unknown;
  httpStatus?: string | number;
  data?: unknown;
};

type DynamicTranslate = (key: string, options?: Record<string, unknown>) => string;

const hasErrorDetail = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' || Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

const isErrorDetail = (value: unknown): value is ErrorDetail =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.keys(value).length > 0;

const translateDynamic = t as unknown as DynamicTranslate;

function getLoginErrorTimesExceedErrorMessage(
  errorMessageKey: string,
  { remainingSeconds }: { remainingSeconds?: string | number },
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
      return translateDynamic(errorMessageKey, { sec: seconds });
    }
    return t('error_code.LoginErrorTimesExceed_MIN_SEC', {
      min: minute,
      sec: seconds,
    });
  }
  return '';
}
/**
 * @description 错误方法处理
 * @param {*} res
 */
function handleError(res: ErrorPayload) {
  let message = '';

  const { errorCode = '', errorDetail = {}, httpStatus } = res;
  if (errorCode) {
    const errorMessageKey = `error_code.${errorCode}`;
    // 默认初始翻译
    message = translateDynamic(errorMessageKey, { defaultValue: res.errorMessage || errorCode });

    // 用户未登录
    if (errorCode === 'MustLoggedError') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('isLocal');
    }
    if (hasErrorDetail(errorDetail) && isErrorDetail(errorDetail)) {
      message = translateDynamic(errorMessageKey, {
        ...errorDetail,
        defaultValue: res.errorMessage || errorCode,
      });
      logger.debug('message', message);
    }

    // 登录密码错误次数特殊翻译
    if (errorCode === 'LoginErrorTimesExceed') {
      if (isErrorDetail(errorDetail)) {
        message = getLoginErrorTimesExceedErrorMessage(errorMessageKey, errorDetail);
      }
    }

    // 用户密码不正确错误次数
    if (errorCode === 'UserNamePasswordNotMatch') {
      const remainLoginCount = isErrorDetail(errorDetail) ? errorDetail.remainLoginCount : undefined;
      const errorMessage = remainLoginCount
        ? t('error_code.NamePasswordNotMatchWithCount', {
            remainLoginCount,
          })
        : translateDynamic(errorMessageKey, { defaultValue: res.errorMessage || errorCode });
      message = errorMessage;
    }
  } else if (httpStatus) {
    message = translateDynamic(`error_code.${httpStatus}`, {
      defaultValue: res?.errorMessage || httpStatus,
    });
  }
  // 抛错
  uiMessage.error(message || res?.errorMessage);
}

export default handleError;
