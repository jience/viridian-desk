// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { gatewayReducer, gatewaySliceName } from './feature/gateway';
import { terminalReducer, terminalSliceName } from './feature/terminal';
import { configReducer, configSliceName } from './feature/config';
import { clientReducer, clientSliceName } from './feature/client';
import { appReducer, appSliceName, logoutCurrentUser } from './feature/app';
import { setStoreRuntimeAccess } from './runtime-access';

export const appStore = configureStore({
  reducer: {
    [appSliceName]: appReducer,
    [gatewaySliceName]: gatewayReducer,
    [terminalSliceName]: terminalReducer,
    [configSliceName]: configReducer,
    [clientSliceName]: clientReducer,
  },
});

export type AppState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;

setStoreRuntimeAccess({
  dispatch: appStore.dispatch,
  getState: appStore.getState,
  handleUnauthorized: async () => {
    await appStore.dispatch(logoutCurrentUser(false));
  },
});

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = useDispatch<AppDispatch>;
