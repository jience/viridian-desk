/**
 * 登录类型枚举
 */
export const LoginAuthType = {
  /** 本地认证 */
  LOCAL: 'LocalAuth',
  /** 域认证 */
  DOMAIN: 'DomainAuth',
  /** 企业认证 */
  CORP: 'CorpAuth',
  /** IAM认证 */
  IAM: 'IamAuth',
  /** NIS认证 */
  NIS: 'NisAuth',
} as const;

/** 登录类型 */
export type LoginAuthType = (typeof LoginAuthType)[keyof typeof LoginAuthType];
