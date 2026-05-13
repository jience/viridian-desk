import type {
  AddHistoryEntryParams,
  ILoginHistoryModule,
  LoginAuthType,
  LoginHistoryData,
  LoginHistoryMetaData,
} from '@/native/interfaces/login_history';
import type { NativeResponse } from '@/native/interfaces/types';

export const login_history_module: ILoginHistoryModule = {
  getLoginHistory: function (
    _loginType?: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    throw new Error('Function not implemented.');
  },
  saveLoginHistory: function (_history: LoginHistoryData): Promise<NativeResponse> {
    throw new Error('Function not implemented.');
  },
  addLoginEntry: function (
    _loginInfo: AddHistoryEntryParams,
    _loginType: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    throw new Error('Function not implemented.');
  },
  deleteLoginEntry: function (
    _username: string,
    _loginType: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    throw new Error('Function not implemented.');
  },
  clearLoginHistory: function (
    _loginType?: LoginAuthType,
  ): Promise<NativeResponse<LoginHistoryData>> {
    throw new Error('Function not implemented.');
  },
  setLoginHistoryMeta: function (
    _meta: Partial<LoginHistoryMetaData>,
  ): Promise<NativeResponse<LoginHistoryData>> {
    throw new Error('Function not implemented.');
  },
};
