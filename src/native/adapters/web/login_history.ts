import type {
  AddHistoryEntryParams,
  ILoginHistoryModule,
  LoginHistoryData,
  LoginHistoryMetaData,
} from '@/native/interfaces/login_history';
import { LoginAuthType } from '@/native/interfaces/login_history';
import type { NativeResponse } from '@/native/interfaces/types';
import { success } from '@/native/utils';

const WEB_LOGIN_HISTORY_STORAGE_KEY = 'viridian.web.login_history';

const defaultLoginHistory: LoginHistoryData = {
  history: [],
  isAutoLogin: false,
  isRememberMe: false,
};

function readLoginHistory(): LoginHistoryData {
  try {
    const stored = window.localStorage.getItem(WEB_LOGIN_HISTORY_STORAGE_KEY);
    return stored ? { ...defaultLoginHistory, ...JSON.parse(stored) } : defaultLoginHistory;
  } catch {
    return defaultLoginHistory;
  }
}

function writeLoginHistory(history: LoginHistoryData) {
  window.localStorage.setItem(WEB_LOGIN_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export const login_history_module: ILoginHistoryModule = {
  getLoginHistory: async function (
    loginType?: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    const data = readLoginHistory();
    return success(
      loginType
        ? {
            ...data,
            history: data.history.filter((entry) => entry.loginType === loginType),
          }
        : data,
    );
  },
  saveLoginHistory: async function (history: LoginHistoryData): Promise<NativeResponse> {
    writeLoginHistory(history);
    return success();
  },
  addLoginEntry: async function (
    loginInfo: AddHistoryEntryParams,
    loginType: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    const data = readLoginHistory();
    const nextHistory = [
      { ...loginInfo, loginType, timestamp: Date.now() },
      ...data.history.filter(
        (entry) => !(entry.username === loginInfo.username && entry.loginType === loginType),
      ),
    ].slice(0, 5);
    const nextData = { ...data, history: nextHistory };
    writeLoginHistory(nextData);
    return success(nextData);
  },
  deleteLoginEntry: async function (
    username: string,
    loginType: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    const data = readLoginHistory();
    const nextData = {
      ...data,
      history: data.history.filter(
        (entry) => !(entry.username === username && entry.loginType === loginType),
      ),
    };
    writeLoginHistory(nextData);
    return success(nextData);
  },
  clearLoginHistory: async function (
    loginType?: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    const data = readLoginHistory();
    const nextData = {
      ...data,
      history: loginType ? data.history.filter((entry) => entry.loginType !== loginType) : [],
    };
    writeLoginHistory(nextData);
    return success(nextData);
  },
  setLoginHistoryMeta: async function (
    meta: Partial<LoginHistoryMetaData>,
  ): Promise<NativeResponse<LoginHistoryData>> {
    const nextData = { ...readLoginHistory(), ...meta };
    writeLoginHistory(nextData);
    return success(nextData);
  },
};
