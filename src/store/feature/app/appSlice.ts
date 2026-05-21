import { bridge } from '@/native';
import type { LoginUserInfo } from '@/native/interfaces/api/types';
import type { AppState } from '@/store';
import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { initState } from './initState';

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
    setMsgDot(state, res: PayloadAction<boolean>) {
      state.msgDot = res.payload;
    },
    setMsgModalShow(state, res: PayloadAction<{ msgModalShow: boolean; msgId: string }>) {
      state.msgModalShow = res.payload.msgModalShow;
      state.msgId = res.payload.msgId;
    },
  },
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

export const { setMsgModalShow, setMsgDot } = appSlice.actions;

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

export const selectCurrentUser = createSelector(
  [(state: AppState) => state.app],
  (app) => app.currentUser,
);
