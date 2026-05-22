import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { initState } from './initState';
import type { AppState } from '@/store';
import { bridge } from '@/native';

export const fetchTerminalInfo = createAsyncThunk('terminal/fetchTerminalInfo', async () => {
  const { data } = await bridge.terminal.getTerminalInfo();
  return data;
});

const terminalSlice = createSlice({
  name: 'terminal',
  initialState: initState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTerminalInfo.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
  },
});

export const { reducer: terminalReducer, name: terminalSliceName } = terminalSlice;

// export const {} = terminalSlice.actions;
export const selectId = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.id,
);

export const selectOsType = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.osType,
);

export const selectPlatform = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.platform,
);

export const selectPlatformCode = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.platformCode,
);

export const selectVersionCode = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.versionCode,
);

export const selectVersionName = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.versionName,
);

export const selectCpuInfo = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.cpuInfo,
);

export const selectMac = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.mac,
);

export const selectMemInfo = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.memInfo,
);

export const selectClientType = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.clientType,
);

export const selectClientOsVersion = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.clientOsVersion,
);

export const selectIsThin = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.isThin,
);

export const selectSku = createSelector(
  [(state: AppState) => state.terminal],
  (terminal) => terminal?.sku,
);
