// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { globalEmitter } from '@/utils/mitt';
import { gatewayReducer, gatewaySliceName } from './feature/gateway';
import { terminalReducer, terminalSliceName } from './feature/terminal';
import { configReducer, configSliceName } from './feature/config';
import { clientReducer, clientSliceName } from './feature/client';
import { appReducer, appSliceName } from './feature/app';
import { loadingReducer, loadingSliceName, startLoading, stopLoading } from './feature/loading';

export const appStore = configureStore({
  reducer: {
    [appSliceName]: appReducer,
    [gatewaySliceName]: gatewayReducer,
    [terminalSliceName]: terminalReducer,
    [loadingSliceName]: loadingReducer,
    [configSliceName]: configReducer,
    [clientSliceName]: clientReducer,
  },
});

// 监听网络请求开始和结束
globalEmitter.on('api/startLoading', (url) => appStore.dispatch(startLoading(url)));
globalEmitter.on('api/stopLoading', (url) => appStore.dispatch(stopLoading(url)));

export type AppState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = useDispatch<AppDispatch>;
