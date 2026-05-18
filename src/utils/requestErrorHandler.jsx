import { formatI18NKey } from '@/utils/utils';
import { logger } from '@/utils/logger';

function getLoginErrorTimesExceedErrorMessage(
  errorMessage,
  { remainingSeconds },
) {
  // 处理remainingSeconds
  const intRemainingSeconds = parseInt(remainingSeconds);
  let remainingTime;
  if (!isNaN(intRemainingSeconds)) {
    const minute = Math.floor(intRemainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    if (minute) {
      remainingTime = `${minute}分`;
    }
    if (seconds) {
      remainingTime = minute ? `${remainingTime}${seconds}秒` : `${seconds}秒`;
    }
    return formatI18NKey(errorMessage, { remainingTime });
  }
}
/**
 * @description 错误方法处理
 * @param {*} res
 */
function handleError(res) {
  let message = '';

  const { errorCode = '', errorDetail = {}, httpStatus } = res;
  if (errorCode) {
    // 默认初始翻译
    message = formatI18NKey(res.errorCode);

    // 用户未登录
    if (errorCode === 'MustLoggedError') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('isLocal');
    }
    if (!isEmpty(errorDetail)) {
      message = formatI18NKey(errorCode, { ...errorDetail });
      logger.debug('message', message);
    }

    // 登录密码错误次数特殊翻译
    if (errorCode === 'LoginErrorTimesExceed') {
      let errorMessage = formatI18NKey('LoginErrorTimesExceed');

      if (res?.errorDetail) {
        message = getLoginErrorTimesExceedErrorMessage(
          errorMessage,
          res?.errorDetail,
        );
      }
    }

    // 用户密码不正确错误次数
    if (errorCode === 'UserNamePasswordNotMatch') {
      let errorMessage = res?.data?.remainLoginCount
        ? formatI18NKey(formatI18NKey('NamePasswordNotMatchWithCount'), {
            remainLoginCount: res?.errorDetail?.remainLoginCount,
          })
        : formatI18NKey(errorCode);
      message = errorMessage;
    }
  } else if (httpStatus) message = formatI18NKey(httpStatus);
  // 抛错
  message.error(message || res?.errorMessage);
}

export default handleError;
