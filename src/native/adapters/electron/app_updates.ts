import type { DownloadEvent, IAppUpdatesModule } from '@/native/interfaces/app_updates';
import { success } from '@/native/utils';

export const app_updates_module: IAppUpdatesModule = {
  fetchUpdate: async () => {
    return success();
  },

  installUpdate: async (_onEvent?: (event: DownloadEvent) => void) => {
    return success();
  },
};
