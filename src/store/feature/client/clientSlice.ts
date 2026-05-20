import { bridge } from '@/native';
import { LoginAuthType } from '@/native/interfaces/login_auth';
import type { AppState } from '@/store';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { initState } from './initState';
import { LoginType } from './types';

export const fetchClientInfo = createAsyncThunk('client/fetchClientInfo', async () => {
  const { data } = await bridge.terminal.getClientConfig();

  return { ...data, loginTypes: data.loginTypes.split(',') as LoginType[] };
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

export const selectLoginTypes = createSelector([(state: AppState) => state.client], (client) => {
  const loginTypeToLoginAuthTypeMap: Record<LoginType, LoginAuthType> = {
    [LoginType.LOCAL]: LoginAuthType.LOCAL,
    [LoginType.DOMAIN]: LoginAuthType.DOMAIN,
    [LoginType.OTHER]: LoginAuthType.CORP,
    [LoginType.USER_DEFINED]: LoginAuthType.IAM,
    [LoginType.NIS]: LoginAuthType.NIS,
  };
  return client?.loginTypes.map((type) => loginTypeToLoginAuthTypeMap[type]) || [];
});

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

export const selectTerminalRememberPasswordSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalRememberPasswordSwitch === 'Enabled',
);

export const selectPublicityImage = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.publicityImage,
);

export const selectFloatBall = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.floatBall,
);

export const selectFirstLoginResetPasswordSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.firstLoginResetPasswordSwitch,
);

export const selectOneTimePasswordSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.oneTimePasswordSwitch === 'Enabled',
);

export const selectSecurityPassword = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.securityPassword,
);

export const selectSecurityPasswordSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.securityPasswordSwitch,
);

export const selectSmsResetPasswordSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.smsResetPasswordSwitch,
);

export const selectTerminalGraphAuthenticationSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalGraphAuthenticationSwitch === 'Enabled',
);

export const selectTerminalLoginErrorTimes = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalLoginErrorTimes,
);

export const selectTerminalLoginMeteringMinute = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalLoginMeteringMinute,
);

export const selectTerminalMultiFactorAuthenticationSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalMultiFactorAuthenticationSwitch === 'Enabled',
);

export const selectTerminalPasswordRemainingValidity = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalPasswordRemainingValidity,
);

export const selectTerminalPasswordValidDays = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalPasswordValidDays,
);

export const selectTerminalStrongPasswordSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.terminalStrongPasswordSwitch,
);

export const selectWarnLoginFromDifferentLocationSwitch = createSelector(
  [(state: AppState) => state.client],
  (client) => client?.warnLoginFromDifferentLocationSwitch,
);
