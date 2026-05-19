import type { INativeBridge } from '@/native/interfaces';
import { success } from '@/native/utils';
import { app_updates_module } from './app_updates';
import { terminal_module } from './terminal';
import { config_module } from './config';
import type {
  AppEventMap,
  NativeOpenDialogOptions,
  NativeResponse,
  UnlistenFn,
} from '@/native/interfaces/types';
import { cmd_module } from './cmd';
import { login_history_module } from './login_history';
import { api_module } from './api';

export class TauriAdapter implements INativeBridge {
  platform = 'tauri' as const;

  app_updates = app_updates_module;

  terminal = terminal_module;

  config = config_module;

  cmd = cmd_module;

  login_history = login_history_module;

  api = api_module;

  async minimizeWindow(): Promise<NativeResponse> {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
    return success();
  }

  async maximizeWindow(): Promise<NativeResponse> {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().maximize();
    return success();
  }

  async closeWindow(): Promise<NativeResponse> {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().close();
    return success();
  }

  async openDialog(
    options: NativeOpenDialogOptions,
  ): Promise<NativeResponse<string | string[] | null>> {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open(options);
    return success(selected);
  }

  async onEvent<K extends keyof AppEventMap>(
    event: K,
    callback: (payload: AppEventMap[K]) => void,
  ): Promise<UnlistenFn> {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen<AppEventMap[K]>(event, (eventObj) => {
      callback(eventObj.payload);
    });

    return unlisten;
  }
}
