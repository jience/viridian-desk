export interface GatewayItem {
  uuid: string;
  name: string;
  address: string;
  port: number; // 端口号
  isPublic: boolean;
  auto: boolean; // 是否自动接入
}

export type GetGatewayServerResp = GatewayItem[];

export type AddGatewayServerReq = {
  name: string;
  address: string;
  isPublic: boolean;
  auto: boolean;
};

export type UpdateGatewayServerReq = {
  gwid: string;
  name: string;
  address: string;
  isPublic: boolean;
};

export interface GetAppConfResp {
  theme: ThemeType;
  auto_update: boolean;
  auto_start: boolean;
  full_screen: boolean;
  developer_mode: boolean;
  integration: boolean;
  language: LanguageType;
  gateway: GatewayItem[];
  client_id: string;
  client_name: string;
  client_version: string;
  api_key: string;
  log: LogInfo;
}

export const LanguageType = {
  ZH_CN: 'zh-CN',
  ZH_TW: 'zh-TW',
  EN_US: 'en-US',
} as const;

export type LanguageType = (typeof LanguageType)[keyof typeof LanguageType];

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  OFF = 'off',
}

export interface LogInfo {
  level: LogLevel;
  path: string;
  max_file_size: number;
  rotation_strategy: number;
}

export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}
