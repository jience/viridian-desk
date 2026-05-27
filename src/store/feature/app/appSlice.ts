import { bridge } from '@/native';
import type { LoginUserInfo } from '@/native/interfaces/api/types';
import type { NativeLoginUserInfo } from '@/native/interfaces/cmd';
import type { AppState } from '@/store';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { initState } from './initState';

/**
 * 保存登录的用户信息
 */
export const setCurrentUser = createAsyncThunk(
  'app/setCurrentUser',
  async (userInfo: LoginUserInfo) => {
    const nativeUserInfo: NativeLoginUserInfo = {
      ...userInfo,
      password: '',
    };
    await bridge.cmd.login(nativeUserInfo);
    return userInfo;
  },
);

/**
 * 登出当前用户
 */
export const logoutCurrentUser = createAsyncThunk(
  'app/logoutCurrentUser',
  async (forceLogout: boolean, { getState }) => {
    const state = getState() as AppState;
    const currentUser = state.app.currentUser;
    if (!currentUser?.loginName) {
      return;
    }
    await bridge.api.logoutUser({ loginName: currentUser.loginName, forceLogout });
    await bridge.cmd.logout();
  },
);

const appSlice = createSlice({
  name: 'app',
  initialState: initState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setCurrentUser.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });
    builder.addCase(logoutCurrentUser.fulfilled, (state) => {
      state.currentUser = null;
    });
  },
});

export const { reducer: appReducer, name: appSliceName } = appSlice;

export const selectIsLogin = createSelector(
  [(state: AppState) => state.app],
  (app) => !!app.currentUser,
);

export const selectCurrentUser = createSelector(
  [(state: AppState) => state.app],
  (app) => app.currentUser,
);
