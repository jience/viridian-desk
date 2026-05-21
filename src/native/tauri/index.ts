import type { INativeBridge } from '@/native/interfaces';
import { withNativeInterceptors } from '@/native/interceptor';
import { success } from '@/native/utils';
import type {
  AppEventMap,
  NativeOpenDialogOptions,
  NativeResponse,
  UnlistenFn,
} from '@/native/interfaces/types';

const createModuleLoader = <Module,>(load: () => Promise<Module>) => {
  let modulePromise: Promise<Module> | undefined;
  return () => {
    modulePromise ??= load();
    return modulePromise;
  };
};

const deferModuleMethod = <Module, Key extends keyof Module>(
  load: () => Promise<Module>,
  method: Key,
): Module[Key] => {
  return (async (...args: unknown[]) => {
    const module = await load();
    const fn = module[method] as unknown as (...args: unknown[]) => unknown;
    return fn(...args);
  }) as Module[Key];
};

const loadAppUpdatesModule = createModuleLoader(() =>
  import('./app_updates').then(({ app_updates_module }) => app_updates_module),
);
const loadTerminalModule = createModuleLoader(() =>
  import('./terminal').then(({ terminal_module }) => terminal_module),
);
const loadConfigModule = createModuleLoader(() =>
  import('./config').then(({ config_module }) => config_module),
);
const loadCmdModule = createModuleLoader(() =>
  import('./cmd').then(({ cmd_module }) => cmd_module),
);
const loadApiModule = createModuleLoader(() =>
  import('./api').then(({ api_module }) => api_module),
);

const tauriNative: INativeBridge = {
  platform: 'tauri',
  app_updates: {
    fetchUpdate: deferModuleMethod(loadAppUpdatesModule, 'fetchUpdate'),
    installUpdate: deferModuleMethod(loadAppUpdatesModule, 'installUpdate'),
  },
  terminal: {
    getClientAbout: deferModuleMethod(loadTerminalModule, 'getClientAbout'),
    getClientConfig: deferModuleMethod(loadTerminalModule, 'getClientConfig'),
    getTerminalInfo: deferModuleMethod(loadTerminalModule, 'getTerminalInfo'),
  },
  config: {
    getGatewayServer: deferModuleMethod(loadConfigModule, 'getGatewayServer'),
    addGatewayServer: deferModuleMethod(loadConfigModule, 'addGatewayServer'),
    switchGatewayServer: deferModuleMethod(loadConfigModule, 'switchGatewayServer'),
    updateGatewayServer: deferModuleMethod(loadConfigModule, 'updateGatewayServer'),
    deleteGatewayServer: deferModuleMethod(loadConfigModule, 'deleteGatewayServer'),
    getAppConf: deferModuleMethod(loadConfigModule, 'getAppConf'),
    setDeveloperMode: deferModuleMethod(loadConfigModule, 'setDeveloperMode'),
    setLogFilter: deferModuleMethod(loadConfigModule, 'setLogFilter'),
    setTheme: deferModuleMethod(loadConfigModule, 'setTheme'),
    setLanguage: deferModuleMethod(loadConfigModule, 'setLanguage'),
    setAutoStart: deferModuleMethod(loadConfigModule, 'setAutoStart'),
    setFullScreen: deferModuleMethod(loadConfigModule, 'setFullScreen'),
    setAutoUpdate: deferModuleMethod(loadConfigModule, 'setAutoUpdate'),
  },
  cmd: {
    getLocalNetInfo: deferModuleMethod(loadCmdModule, 'getLocalNetInfo'),
    getClientOnlineStatus: deferModuleMethod(loadCmdModule, 'getClientOnlineStatus'),
    diagnoseGatewayNetwork: deferModuleMethod(loadCmdModule, 'diagnoseGatewayNetwork'),
    shutdownLocalDevice: deferModuleMethod(loadCmdModule, 'shutdownLocalDevice'),
    getLogInfo: deferModuleMethod(loadCmdModule, 'getLogInfo'),
    cleanLogFile: deferModuleMethod(loadCmdModule, 'cleanLogFile'),
    openLogDirectory: deferModuleMethod(loadCmdModule, 'openLogDirectory'),
    openNetworkSettings: deferModuleMethod(loadCmdModule, 'openNetworkSettings'),
    openDocs: deferModuleMethod(loadCmdModule, 'openDocs'),
    connectDesktop: deferModuleMethod(loadCmdModule, 'connectDesktop'),
    setLog: deferModuleMethod(loadCmdModule, 'setLog'),
    login: deferModuleMethod(loadCmdModule, 'login'),
    logout: deferModuleMethod(loadCmdModule, 'logout'),
  },
  api: {
    loginUser: deferModuleMethod(loadApiModule, 'loginUser'),
    logoutUser: deferModuleMethod(loadApiModule, 'logoutUser'),
  },

  async minimizeWindow() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
    return success();
  },

  async maximizeWindow() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().maximize();
    return success();
  },

  async closeWindow() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().close();
    return success();
  },

  async openDialog(
    options: NativeOpenDialogOptions,
  ): Promise<NativeResponse<string | string[] | null>> {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open(options);
    return success(selected);
  },

  async onEvent<K extends keyof AppEventMap>(
    event: K,
    callback: (payload: AppEventMap[K]) => void,
  ): Promise<UnlistenFn> {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen<AppEventMap[K]>(event, (eventObj) => {
      callback(eventObj.payload);
    });

    return unlisten;
  },
};

export const nativeBridge = withNativeInterceptors(
  tauriNative as unknown as Record<string, unknown>,
) as unknown as INativeBridge;
