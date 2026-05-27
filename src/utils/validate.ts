/**
 * @description 验证ip地址
 * @param {*} value
 */
export function validateIp(value: string) {
  const regex = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
  return regex.test(value);
}

/**
 * @description 验证端口号
 * @param {*} value
 */
export function validatePort(value: string) {
  const regex = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
  return regex.test(value);
}

/**
 * @description 验证域名
 * @param {*} value
 */
export function validateDomain(value: string) {
  const regex = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
  return regex.test(value);
}

/**
 * @description 验证网关地址
 * @param {*} value
 */
export function validateAddress(value: string) {
  const spliteIndex = value.indexOf(':');
  if (spliteIndex > -1) {
    return (
      (validateIp(value.substring(0, spliteIndex)) &&
        validatePort(value.substring(spliteIndex + 1))) ||
      (validateDomain(value.substring(0, spliteIndex)) &&
        validatePort(value.substring(spliteIndex + 1)))
    );
  } else {
    return validateIp(value) || validateDomain(value);
  }
}

/**
 * @description 验证网关名称
 * @param {*} value
 */
export function validateName(value: string) {
  const regex = /^[\u4E00-\u9FA5A-Za-z0-9_]{1,10}$/;
  return regex.test(value);
}
