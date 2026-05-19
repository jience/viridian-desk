import type {
  DownloadEvent,
  FetchUpdateResp,
  IAppUpdatesModule,
} from '@/native/interfaces/app_updates';
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

  installUpdate: async (onEvent?: (event: DownloadEvent) => void) => {
    const { Channel, invoke } = await import('@tauri-apps/api/core');
    const channel = new Channel<DownloadEvent>();

    if (onEvent) {
      channel.onmessage = onEvent;
    }

    return invoke(AppUpdatesInvoke.INSTALL_UPDATE, {
      onEvent: channel,
    });
  },
};
