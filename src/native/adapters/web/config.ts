import type {
  AddGatewayServerReq,
  GetAppConfResp,
  GetGatewayServerResp,
  IConfigModule,
  LanguageType,
  LogLevel,
  ThemeType,
  UpdateGatewayServerReq,
} from '@/native/interfaces/config';
import {
  LanguageType as SupportedLanguage,
  LogLevel as SupportedLogLevel,
  ThemeType as SupportedTheme,
} from '@/native/interfaces/config';
import type { NativeResponse } from '@/native/interfaces/types';
import { success } from '@/native/utils';

const WEB_CONFIG_STORAGE_KEY = 'viridian.web.config';

type WebConfigStorage = Pick<GetAppConfResp, 'language' | 'theme'>;

function readWebConfig(): WebConfigStorage {
  const fallback: WebConfigStorage = {
    language: SupportedLanguage.ZH_CN,
    theme: SupportedTheme.LIGHT,
  };

  try {
    const stored = window.localStorage.getItem(WEB_CONFIG_STORAGE_KEY);
    if (!stored) {
      return fallback;
    }

    const parsed = JSON.parse(stored) as Partial<WebConfigStorage>;
    return {
      language: Object.values(SupportedLanguage).includes(parsed.language as LanguageType)
        ? (parsed.language as LanguageType)
        : fallback.language,
      theme: Object.values(SupportedTheme).includes(parsed.theme as ThemeType)
        ? (parsed.theme as ThemeType)
        : fallback.theme,
    };
  } catch {
    return fallback;
  }
}

function writeWebConfig(config: Partial<WebConfigStorage>) {
  const nextConfig = { ...readWebConfig(), ...config };
  window.localStorage.setItem(WEB_CONFIG_STORAGE_KEY, JSON.stringify(nextConfig));
}

export const config_module: IConfigModule = {
  getGatewayServer: function (): Promise<NativeResponse<GetGatewayServerResp>> {
    throw new Error('Function not implemented.');
  },
  addGatewayServer: function (_gatewayInfo: AddGatewayServerReq): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  switchGatewayServer: function (_gwid?: string): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  updateGatewayServer: function (
    _gatewayInfo: UpdateGatewayServerReq,
  ): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  deleteGatewayServer: function (_gwid?: string): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  getAppConf: async function (): Promise<NativeResponse<GetAppConfResp>> {
    const config = readWebConfig();
    return success({
      theme: config.theme,
      language: config.language,
      auto_update: false,
      auto_start: false,
      full_screen: false,
      developer_mode: false,
      integration: false,
      gateway: [],
      client_id: 'web-preview',
      client_name: 'Viridian Desk Preview',
      client_version: '2.0.1',
      api_key: '',
      log: {
        max_file_size: 10485760,
        level: SupportedLogLevel.INFO,
        path: '',
        rotation_strategy: 1,
      },
    });
  },
  setDeveloperMode: function (_developerMode: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setLogFilter: function (_level: LogLevel): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setTheme: async function (theme: ThemeType): Promise<NativeResponse<void>> {
    writeWebConfig({ theme });
    return success();
  },
  setLanguage: async function (language: string): Promise<NativeResponse<void>> {
    if (Object.values(SupportedLanguage).includes(language as LanguageType)) {
      writeWebConfig({ language: language as LanguageType });
    }
    return success();
  },
  setAutoStart: function (_autoStart: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setFullScreen: function (_fullScreen: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
  setAutoUpdate: function (_autoUpdate: boolean): Promise<NativeResponse<void>> {
    throw new Error('Function not implemented.');
  },
};
