export interface IHistoryEntry {
  /** 登录名或者手机号码(如果isLocalPhoneLogin===true就是手机号码) */
  username: string;
  /** 登录类型 */
  loginType: LoginAuthType;
  /** 域服务器名称 */
  domainServerName?: string;
  /** OU（组织单位） */
  ou?: string;
  /** NIS ID */
  nisId?: string;
  /** NIS 域 */
  nisDomain?: string;
  /** 是否为本地手机登录 */
  isLocalPhoneLogin?: boolean;
  /** 企业ID */
  corpId?: string;
  /** 电话号码 */
  telephone?: string;
  /** 创建时间戳 */
  timestamp: number;
}

export type AddHistoryEntryParams = Omit<IHistoryEntry, 'timestamp' | 'loginType'>;
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

export interface LoginHistoryMetaData {
  /** 是否自动登录 */
  isAutoLogin: boolean;
  /** 是否记住我 */
  isRememberMe: boolean;
}

export type LoginHistoryData = LoginHistoryMetaData & {
  /** 登录历史记录 */
  history: IHistoryEntry[];
};
