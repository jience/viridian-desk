import { bridge } from '@/native';
import type { LoginUserInfo } from '@/native/interfaces/api/types';
import type { AddHistoryEntryParams, LoginAuthType } from '@/native/interfaces/login_history';
import type { AppState } from '@/store';
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { initState } from './initState';

/**
 * 获取用户登录历史记录
 */
export const getLoginHistory = createAsyncThunk('app/getLoginHistory', async () => {
  const { data } = await bridge.login_history.getLoginHistory();
  return data;
});

/**
 * 添加用户登录条目
 */
export const addLoginEntry = createAsyncThunk(
  'app/addLoginEntry',
  async (loginInfo: AddHistoryEntryParams, { getState }) => {
    const state = getState() as AppState;
    const currentLoginType = state.app.currentLoginType;
    const { data } = await bridge.login_history.addLoginEntry(loginInfo, currentLoginType);
    return data;
  },
);

/**
 * 删除用户登录条目
 */
export const deleteLoginEntry = createAsyncThunk(
  'app/deleteLoginEntry',
  async (username: string, { getState }) => {
    const state = getState() as AppState;
    const currentLoginType = state.app.currentLoginType;
    const { data } = await bridge.login_history.deleteLoginEntry(username, currentLoginType);
    return data;
  },
);

/**
 * 清空登录历史
 */
export const clearLoginHistory = createAsyncThunk(
  'app/clearLoginHistory',
  async (_, { getState }) => {
    const state = getState() as AppState;
    const currentLoginType = state.app.currentLoginType;
    const { data } = await bridge.login_history.clearLoginHistory(currentLoginType);
    return data;
  },
);

/**
 * 设置自动登录
 */
export const setAutoLogin = createAsyncThunk('app/setAutoLogin', async (isAutoLogin: boolean) => {
  const { data } = await bridge.login_history.setLoginHistoryMeta({ isAutoLogin });
  return data;
});

/**
 * 设置记住我
 */
export const setRememberMe = createAsyncThunk(
  'app/setRememberMe',
  async (isRememberMe: boolean) => {
    const { data } = await bridge.login_history.setLoginHistoryMeta({ isRememberMe });
    return data;
  },
);

/**
 * 保存登录的用户信息
 */
export const setCurrentUser = createAsyncThunk(
  'app/setCurrentUser',
  async (userInfo: LoginUserInfo & { password: string }) => {
    await bridge.cmd.login(userInfo);
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
  reducers: {
    setSmsResetPasswordSwitch(state, res: PayloadAction<'Disabled' | 'Enabled'>) {
      state.smsResetPasswordSwitch = res.payload;
    },
    setMsgDot(state, res: PayloadAction<boolean>) {
      state.msgDot = res.payload;
    },
    setMsgModalShow(state, res: PayloadAction<{ msgModalShow: boolean; msgId: string }>) {
      state.msgModalShow = res.payload.msgModalShow;
      state.msgId = res.payload.msgId;
    },
    setCurrentLoginType(state, res: PayloadAction<LoginAuthType>) {
      state.currentLoginType = res.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getLoginHistory.fulfilled, (state, action) => {
      state.loginHistory = action.payload;
    });
    builder.addCase(addLoginEntry.fulfilled, (state, action) => {
      state.loginHistory = action.payload;
    });
    builder.addCase(deleteLoginEntry.fulfilled, (state, action) => {
      state.loginHistory = action.payload;
    });
    builder.addCase(clearLoginHistory.fulfilled, (state, action) => {
      state.loginHistory = action.payload;
    });
    builder.addCase(setAutoLogin.fulfilled, (state, action) => {
      state.loginHistory.isAutoLogin = action.payload.isAutoLogin;
    });
    builder.addCase(setRememberMe.fulfilled, (state, action) => {
      state.loginHistory.isRememberMe = action.payload.isRememberMe;
    });
    builder.addCase(setCurrentUser.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });
    builder.addCase(logoutCurrentUser.fulfilled, (state) => {
      state.currentUser = null;
    });
  },
});

export const { reducer: appReducer, name: appSliceName } = appSlice;

export const { setMsgModalShow, setMsgDot, setSmsResetPasswordSwitch, setCurrentLoginType } =
  appSlice.actions;

export const selectIsLogin = createSelector(
  [(state: AppState) => state.app],
  (app) => !!app.currentUser,
);

export const selectMsgDot = createSelector([(state: AppState) => state.app], (app) => app.msgDot);

export const selectMsgModalShow = createSelector(
  [(state: AppState) => state.app],
  (app) => app.msgModalShow,
);

export const selectMsgId = createSelector([(state: AppState) => state.app], (app) => app.msgId);

export const selectSmsResetPasswordSwitch = createSelector(
  [(state: AppState) => state.app],
  (app) => app.smsResetPasswordSwitch,
);

export const selectLoginHistory = createSelector([(state: AppState) => state.app], (app) =>
  app.loginHistory.history.filter((entry) => entry.loginType === app.currentLoginType),
);

export const selectLastLoginEntry = createSelector([(state: AppState) => state.app], (app) => {
  const loginType = app.currentLoginType;
  const filteredHistory = app.loginHistory.history.filter((entry) => entry.loginType === loginType);
  return filteredHistory.length > 0 ? filteredHistory[0] : null;
});

export const selectCurrentLoginType = createSelector(
  [(state: AppState) => state.app],
  (app) => app.currentLoginType,
);

export const selectIsAutoLogin = createSelector(
  [(state: AppState) => state.app],
  (app) => app.loginHistory.isAutoLogin,
);

export const selectIsRememberMe = createSelector(
  [(state: AppState) => state.app],
  (app) => app.loginHistory.isRememberMe,
);

export const selectCurrentUser = createSelector(
  [(state: AppState) => state.app],
  (app) => app.currentUser,
);
