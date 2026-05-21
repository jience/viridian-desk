import { bridge } from '@/native';
import type { AppState } from '@/store';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { initState } from './initState';

export const fetchClientInfo = createAsyncThunk('client/fetchClientInfo', async () => {
  const { data } = await bridge.terminal.getClientConfig();

  return data;
});

const clientSlice = createSlice({
  name: 'client',
  initialState: initState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchClientInfo.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
  },
});

export const { reducer: clientReducer, name: clientSliceName } = clientSlice;

// export const {} = clientSlice.actions;

export const selectLogo = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.logo,
);

export const selectLogoWhite = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.logoWhite,
);

export const selectLicense = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.license,
);

export const selectClientIconPng = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.clientIconPng,
);

export const selectClientIconIco = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.clientIconIco,
);

export const selectCompanyName = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.companyName,
);

export const selectIsUpdate = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.isUpdate,
);

export const selectCopyright = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.copyright,
);

export const selectClientPrefix = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.clientPrefix,
);

export const selectTimeout = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.timeout,
);

export const selectClientTheme = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.clientTheme,
);

export const selectDeskToolbar = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.deskToolbar,
);

export const selectDeskToolbarPosition = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.deskToolbarPosition,
);

export const selectCompanyPhone = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.companyPhone,
);

export const selectCompanyEmail = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.companyEmail,
);

export const selectGatewayAddrShowSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.gatewayAddrShowSwitch,
);

export const selectDisplayVersion = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.displayVersion,
);

export const selectBackgroundImage = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.backgroundImage,
);

export const selectPublicityImage = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.publicityImage,
);

export const selectFloatBall = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.floatBall,
);

export const selectSecurityPassword = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.securityPassword,
);

export const selectSecurityPasswordSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.securityPasswordSwitch,
);
