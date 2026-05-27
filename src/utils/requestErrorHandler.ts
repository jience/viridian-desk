import { t } from 'i18next';
import { message as uiMessage } from '@/shared/ui/message';
import { logger } from '@/utils/logger';

const hasErrorDetail = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' || Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

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
      return (t as any)(errorMessageKey, { sec: seconds });
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
function handleError(res: any) {
  let message = '';

  const { errorCode = '', errorDetail = {}, httpStatus } = res;
  if (errorCode) {
    const errorMessageKey = `error_code.${errorCode}`;
    // 默认初始翻译
    message = (t as any)(errorMessageKey, { defaultValue: res.errorMessage || errorCode });

    // 用户未登录
    if (errorCode === 'MustLoggedError') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('isLocal');
    }
    if (hasErrorDetail(errorDetail)) {
      message = (t as any)(errorMessageKey, {
        ...errorDetail,
        defaultValue: res.errorMessage || errorCode,
      });
      logger.debug('message', message);
    }

    // 登录密码错误次数特殊翻译
    if (errorCode === 'LoginErrorTimesExceed') {
      if (res?.errorDetail) {
        message = getLoginErrorTimesExceedErrorMessage(errorMessageKey, res?.errorDetail);
      }
    }

    // 用户密码不正确错误次数
    if (errorCode === 'UserNamePasswordNotMatch') {
      const errorMessage = res?.data?.remainLoginCount
        ? t('error_code.NamePasswordNotMatchWithCount', {
            remainLoginCount: res?.errorDetail?.remainLoginCount,
          })
        : (t as any)(errorMessageKey, { defaultValue: res.errorMessage || errorCode });
      message = errorMessage;
    }
  } else if (httpStatus) {
    message = t(`error_code.${httpStatus}`, { defaultValue: res?.errorMessage || httpStatus });
  }
  // 抛错
  uiMessage.error(message || res?.errorMessage);
}

export default handleError;
