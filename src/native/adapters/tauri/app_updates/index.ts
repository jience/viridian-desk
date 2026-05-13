import type {
  DownloadEvent,
  FetchUpdateResp,
  IAppUpdatesModule,
} from '@/native/interfaces/app_updates';
import { Channel, invoke } from '@tauri-apps/api/core';
import { wrapInvoke } from '../utils';

export const AppUpdatesInvoke = {
  FETCH_UPDATE: 'fetch_update',
  INSTALL_UPDATE: 'install_update',
} as const;

export type AppUpdatesInvoke = (typeof AppUpdatesInvoke)[keyof typeof AppUpdatesInvoke];

export const app_updates_module: IAppUpdatesModule = {
  fetchUpdate: () => {
    return wrapInvoke<FetchUpdateResp | null>(AppUpdatesInvoke.FETCH_UPDATE);
  },

  installUpdate: (onEvent?: (event: DownloadEvent) => void) => {
    const channel = new Channel<DownloadEvent>();

    if (onEvent) {
      channel.onmessage = onEvent;
    }

    return invoke(AppUpdatesInvoke.INSTALL_UPDATE, {
      onEvent: channel,
    });
  },
};
