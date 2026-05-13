import {
  HISTORY_FILE_NAME,
  LoginAuthType,
  MAX_HISTORY_ENTRIES,
  type AddHistoryEntryParams,
  type IHistoryEntry,
  type ILoginHistoryModule,
  type LoginHistoryData,
  type LoginHistoryMetaData,
} from '@/native/interfaces/login_history';
import { failure, success } from '@/native/utils';
import { BaseDirectory, exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

async function readHistoryFile(): Promise<LoginHistoryData> {
  if (!(await exists(HISTORY_FILE_NAME, { baseDir: BaseDirectory.AppData }))) {
    return { isAutoLogin: false, isRememberMe: false, history: [] };
  }
  const content = await readTextFile(HISTORY_FILE_NAME, { baseDir: BaseDirectory.AppData });
  const res = JSON.parse(content);
  if (!res.history || !Array.isArray(res.history)) {
    res.history = [];
  }
  if (res.isAutoLogin == null) {
    res.isAutoLogin = false;
  }
  if (res.isRememberMe == null) {
    res.isRememberMe = false;
  }
  return res;
}

async function writeHistoryFile(history: LoginHistoryData): Promise<void> {
  await writeTextFile(HISTORY_FILE_NAME, JSON.stringify(history, null, 2), {
    baseDir: BaseDirectory.AppData,
  });
}

export const login_history_module: ILoginHistoryModule = {
  async getLoginHistory(loginType?: LoginAuthType) {
    try {
      const res = await readHistoryFile();
      if (loginType) {
        res.history = res.history.filter((entry) => entry.loginType === loginType);
      }
      res.history = res.history.sort((a, b) => b.timestamp - a.timestamp);
      return success(res);
    } catch (error) {
      return failure('UnknownError', `Failed to read login history: ${error}`);
    }
  },

  async saveLoginHistory(history: LoginHistoryData) {
    try {
      await writeHistoryFile(history);
      return success();
    } catch (error) {
      return failure('UnknownError', `Failed to save login history: ${error}`);
    }
  },

  async addLoginEntry(loginInfo: AddHistoryEntryParams, loginType: LoginAuthType) {
    const { username } = loginInfo;
    try {
      const res = await readHistoryFile();
      const newTimestamp = Date.now();

      // Remove existing entry for the same username and loginType to update its timestamp and position
      res.history = res.history.filter(
        (entry) => !(entry.username === username && entry.loginType === loginType),
      );

      // Add the new/updated entry to the beginning
      res.history.unshift({ ...loginInfo, loginType, timestamp: newTimestamp });

      // Keep only unique username and loginType combinations
      const uniqueHistory: IHistoryEntry[] = [];
      const seenEntries = new Set<string>();
      for (const entry of res.history) {
        const key = `${entry.username}-${entry.loginType}`;
        if (!seenEntries.has(key)) {
          uniqueHistory.push(entry);
          seenEntries.add(key);
        }
      }

      // Trim to max entries
      const trimmedHistory = uniqueHistory.slice(0, MAX_HISTORY_ENTRIES);
      res.history = trimmedHistory;
      await writeHistoryFile(res);
      return success(res);
    } catch (error) {
      return failure('UnknownError', `Failed to add login entry: ${error}`);
    }
  },

  async clearLoginHistory(loginType?: LoginAuthType) {
    try {
      const res = await readHistoryFile();
      if (loginType) {
        res.history = res.history.filter((entry) => entry.loginType !== loginType);
        await writeHistoryFile(res);
        return success(res);
      }
      res.history = [];
      await writeHistoryFile(res);
      return success(res);
    } catch (error) {
      return failure('UnknownError', `Failed to clear login history: ${error}`);
    }
  },

  deleteLoginEntry: async function (username: string, loginType: LoginAuthType) {
    try {
      const res = await readHistoryFile();
      res.history = res.history.filter(
        (entry) => !(entry.username === username && entry.loginType === loginType),
      );
      await writeHistoryFile(res);
      return success(res);
    } catch (error) {
      return failure('UnknownError', `Failed to delete login entry: ${error}`);
    }
  },

  setLoginHistoryMeta: async function (meta: Partial<LoginHistoryMetaData>) {
    try {
      const { history, ...resMetaData } = await readHistoryFile();
      const newMetaData = { ...resMetaData, ...meta };
      const res = { ...newMetaData, history };
      await writeHistoryFile(res);
      return success(res);
    } catch (error) {
      return failure('UnknownError', `Failed to set login history meta: ${error}`);
    }
  },
};
