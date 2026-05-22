import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { initState } from './initState';
import type { AppState } from '@/store';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: initState,
  reducers: {
    startLoading: (state, action: PayloadAction<string>) => {
      state.byKey[action.payload] = (state.byKey[action.payload] || 0) + 1;
    },

    stopLoading: (state, action: PayloadAction<string>) => {
      const currentLoadingNumber = (state.byKey[action.payload] || 0) - 1;

      if (currentLoadingNumber <= 0) {
        delete state.byKey[action.payload];
      } else {
        state.byKey[action.payload] = currentLoadingNumber;
      }
    },
  },
});

export const { reducer: loadingReducer, name: loadingSliceName } = loadingSlice;

export const { startLoading, stopLoading } = loadingSlice.actions;

export const isLoading = (state: AppState, key: string | string[]): boolean => {
  if (typeof key === 'string') {
    return (state.loading.byKey[key] || 0) > 0;
  }

  return key.some((loadingKey) => isLoading(state, loadingKey));
};
