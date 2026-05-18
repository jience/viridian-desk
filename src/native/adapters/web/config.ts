import type {
  AddGatewayServerReq,
  GatewayItem,
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

type WebConfigStorage = Pick<GetAppConfResp, 'gateway' | 'language' | 'theme'>;

function readWebConfig(): WebConfigStorage {
  const fallback: WebConfigStorage = {
    gateway: [],
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
      gateway: Array.isArray(parsed.gateway) ? parsed.gateway : fallback.gateway,
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

function createGateway(gatewayInfo: AddGatewayServerReq): GatewayItem {
  return {
    ...gatewayInfo,
    uuid: `web-gateway-${Date.now()}`,
    port: 443,
  };
}

export const config_module: IConfigModule = {
  getGatewayServer: async function (): Promise<NativeResponse<GetGatewayServerResp>> {
    return success(readWebConfig().gateway);
  },
  addGatewayServer: async function (
    gatewayInfo: AddGatewayServerReq,
  ): Promise<NativeResponse<void>> {
    const config = readWebConfig();
    const nextGateway = createGateway(gatewayInfo);
    writeWebConfig({
      gateway: [
        ...(nextGateway.auto
          ? config.gateway.map((gateway) => ({ ...gateway, auto: false }))
          : config.gateway),
        nextGateway,
      ],
    });
    return success();
  },
  switchGatewayServer: async function (gwid?: string): Promise<NativeResponse<void>> {
    const config = readWebConfig();
    writeWebConfig({
      gateway: config.gateway.map((gateway) => ({
        ...gateway,
        auto: gateway.uuid === gwid,
      })),
    });
    return success();
  },
  updateGatewayServer: async function (
    gatewayInfo: UpdateGatewayServerReq,
  ): Promise<NativeResponse<void>> {
    const config = readWebConfig();
    writeWebConfig({
      gateway: config.gateway.map((gateway) =>
        gateway.uuid === gatewayInfo.gwid
          ? {
              ...gateway,
              address: gatewayInfo.address,
              isPublic: gatewayInfo.isPublic,
              name: gatewayInfo.name,
            }
          : gateway,
      ),
    });
    return success();
  },
  deleteGatewayServer: async function (gwid?: string): Promise<NativeResponse<void>> {
    const config = readWebConfig();
    writeWebConfig({
      gateway: config.gateway.filter((gateway) => gateway.uuid !== gwid),
    });
    return success();
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
      gateway: config.gateway,
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
  setDeveloperMode: async function (_developerMode: boolean): Promise<NativeResponse<void>> {
    return success();
  },
  setLogFilter: async function (_level: LogLevel): Promise<NativeResponse<void>> {
    return success();
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
  setAutoStart: async function (_autoStart: boolean): Promise<NativeResponse<void>> {
    return success();
  },
  setFullScreen: async function (_fullScreen: boolean): Promise<NativeResponse<void>> {
    return success();
  },
  setAutoUpdate: async function (_autoUpdate: boolean): Promise<NativeResponse<void>> {
    return success();
  },
};
