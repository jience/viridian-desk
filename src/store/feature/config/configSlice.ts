import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { initState } from './initState';
import type { AppState } from '@/store';
import i18next from 'i18next';
import { bridge } from '@/native';
import type { LanguageType, ThemeType } from '@/native/interfaces/config';
import { patchCachedConfig, writeCachedConfig } from './configCache';

export const fetchConfigInfo = createAsyncThunk('config/fetchConfigInfo', async () => {
  const { data } = await bridge.config.getAppConf();
  await i18next.changeLanguage(data.language);
  writeCachedConfig(data);
  return data;
});

export const configDeveloperMode = createAsyncThunk(
  'config/configDeveloperMode',
  async (developerMode: boolean) => {
    // 调用设置开发者模式的服务
    await bridge.config.setDeveloperMode(developerMode);
    return developerMode;
  },
);

/**
 * 设置主题
 */
export const configTheme = createAsyncThunk('config/configTheme', async (theme: ThemeType) => {
  await bridge.config.setTheme(theme);
  patchCachedConfig({ theme });
  return theme;
});

/**
 * 设置语言
 */
export const configLanguage = createAsyncThunk(
  'config/configLanguage',
  async (language: LanguageType) => {
    await bridge.config.setLanguage(language);
    await i18next.changeLanguage(language);
    patchCachedConfig({ language });
    return language;
  },
);

/**
 * 设置开机自启
 */
export const configAutoStart = createAsyncThunk(
  'config/configAutoStart',
  async (autoStart: boolean) => {
    await bridge.config.setAutoStart(autoStart);
    return autoStart;
  },
);

/**
 * 设置全屏模式
 */
export const configFullScreen = createAsyncThunk(
  'config/configFullScreen',
  async (fullScreen: boolean) => {
    await bridge.config.setFullScreen(fullScreen);
    return fullScreen;
  },
);

/**
 * 设置自动更新
 */
export const configAutoUpdate = createAsyncThunk(
  'config/configAutoUpdate',
  async (autoUpdate: boolean) => {
    await bridge.config.setAutoUpdate(autoUpdate);
    return autoUpdate;
  },
);

const configSlice = createSlice({
  name: 'config',
  initialState: initState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfigInfo.fulfilled, (state, action) => {
        // 更新配置状态
        Object.assign(state, action.payload);
      })
      .addCase(configDeveloperMode.fulfilled, (state, action) => {
        // 更新开发者模式状态
        state.developer_mode = action.payload;
      })
      .addCase(configTheme.fulfilled, (state, action) => {
        // 更新主题状态
        state.theme = action.payload;
      })
      .addCase(configLanguage.fulfilled, (state, action) => {
        // 更新语言状态
        state.language = action.payload;
      })
      .addCase(configAutoStart.fulfilled, (state, action) => {
        // 更新开机自启状态
        state.auto_start = action.payload;
      })
      .addCase(configFullScreen.fulfilled, (state, action) => {
        // 更新全屏模式状态
        state.full_screen = action.payload;
      })
      .addCase(configAutoUpdate.fulfilled, (state, action) => {
        // 更新自动更新状态
        state.auto_update = action.payload;
      });
  },
});

export const { reducer: configReducer, name: configSliceName } = configSlice;

export const selectTheme = createSelector(
  [(state: AppState) => state.config],
  (config) => config.theme,
);

export const selectAutoUpdate = createSelector(
  [(state: AppState) => state.config],
  (config) => config.auto_update,
);

export const selectAutoStart = createSelector(
  [(state: AppState) => state.config],
  (config) => config.auto_start,
);

export const selectFullScreen = createSelector(
  [(state: AppState) => state.config],
  (config) => config.full_screen,
);

export const selectDeveloperMode = createSelector(
  [(state: AppState) => state.config],
  (config) => config.developer_mode,
);

export const selectIntegration = createSelector(
  [(state: AppState) => state.config],
  (config) => config.integration,
);

export const selectLanguage = createSelector(
  [(state: AppState) => state.config],
  (config) => config.language,
);

export const selectClientId = createSelector(
  [(state: AppState) => state.config],
  (config) => config.client_id,
);

export const selectClientName = createSelector(
  [(state: AppState) => state.config],
  (config) => config.client_name,
);

export const selectClientVersion = createSelector(
  [(state: AppState) => state.config],
  (config) => config.client_version,
);

export const selectApiKey = createSelector(
  [(state: AppState) => state.config],
  (config) => config.api_key,
);

export const selectLogConfig = createSelector(
  [(state: AppState) => state.config],
  (config) => config.log,
);
