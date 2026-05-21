import { LanguageType, LogLevel, ThemeType } from '@/native/interfaces/config';
import { readCachedConfig } from './configCache';
import type { ConfigState } from './types';

const defaultState: ConfigState = {
  theme: ThemeType.LIGHT,
  auto_update: false,
  auto_start: false,
  full_screen: false,
  developer_mode: false,
  integration: false,
  language: LanguageType.ZH_CN,
  client_id: '',
  client_name: 'Client',
  client_version: '2.0.1',
  api_key: '',
  log: {
    max_file_size: 10485760,
    level: LogLevel.INFO,
    path: '',
    rotation_strategy: 1,
  },
};

export const initState: ConfigState = {
  ...defaultState,
  ...readCachedConfig(),
};
