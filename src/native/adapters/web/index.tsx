import type { INativeBridge } from '@/native/interfaces';
import { app_updates_module } from './app_updates';
import { terminal_module } from './terminal';
import { config_module } from './config';
import type { AppEventMap, NativeResponse, UnlistenFn } from '@/native/interfaces/types';
import { cmd_module } from './cmd';
import { login_history_module } from './login_history';
import { api_module } from './api';
import { logger } from '@/utils/logger';

export class WebAdapter implements INativeBridge {
  platform = 'web' as const;

  app_updates = app_updates_module;

  terminal = terminal_module;

  config = config_module;

  cmd = cmd_module;

  login_history = login_history_module;

  api = api_module;

  async minimizeWindow(): Promise<NativeResponse> {
    logger.debug('[Web Mock] minimizeWindow called');
    return { data: null };
  }

  async onEvent<K extends keyof AppEventMap>(
    event: K,
    _callback: (payload: AppEventMap[K]) => void,
  ): Promise<UnlistenFn> {
    logger.debug(`[Web Mock] Listening for event: ${event}`);
    return () => logger.debug(`[Web Mock] UnListening event: ${event}`);
  }
}
