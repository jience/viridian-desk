import type { INativeBridge } from '@/native/interfaces';
import { onIpcEvent } from './utils';
import { app_updates_module } from './app_updates';
import { terminal_module } from './terminal';
import { config_module } from './config';
import type { NativeResponse, AppEventMap, UnlistenFn } from '@/native/interfaces/types';
import { cmd_module } from './cmd';
import { login_history_module } from './login_history';
import { api_module } from './api';

export class ElectronAdapter implements INativeBridge {
  platform = 'electron' as const;

  app_updates = app_updates_module;

  terminal = terminal_module;

  config = config_module;

  cmd = cmd_module;

  login_history = login_history_module;

  api = api_module;

  async minimizeWindow(): Promise<NativeResponse> {
    // 待实现
    console.warn('minimizeWindow not implemented yet for Electron');
    return { data: null };
  }

  async onEvent<K extends keyof AppEventMap>(
    event: K,
    callback: (payload: AppEventMap[K]) => void,
  ): Promise<UnlistenFn> {
    if (!window.ipcRenderer) {
      console.warn('Electron API not found');
      return () => {};
    }

    const unlisten = onIpcEvent<AppEventMap[K]>(event, callback);

    // 包装成 Promise 返回，保持接口一致性
    return Promise.resolve(unlisten);
  }
}
