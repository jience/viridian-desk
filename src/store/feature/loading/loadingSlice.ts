import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loadingAdapter, initState } from './initState';
import { find } from 'lodash-es';
import { matchPath } from 'react-router';
import type { AppState } from '@/store';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: initState,
  reducers: {
    startLoading: (state, action: PayloadAction<string>) => {
      const { selectById } = loadingAdapter.getSelectors();
      const { loadingNumber = 0 } = selectById(state, action.payload) || {};

      const currentLoadingNumber = loadingNumber + 1;

      loadingAdapter.upsertOne(state, {
        id: action.payload,
        loadingNumber: currentLoadingNumber,
      });
    },

    stopLoading: (state, action: PayloadAction<string>) => {
      const { selectById } = loadingAdapter.getSelectors();
      const { loadingNumber = 0 } = selectById(state, action.payload) || {};

      const currentLoadingNumber = loadingNumber - 1;

      if (currentLoadingNumber <= 0) {
        loadingAdapter.removeOne(state, action.payload);
      } else {
        loadingAdapter.upsertOne(state, {
          id: action.payload,
          loadingNumber: currentLoadingNumber,
        });
      }
    },
  },
});

export const { reducer: loadingReducer, name: loadingSliceName } = loadingSlice;

export const { startLoading, stopLoading } = loadingSlice.actions;

const { selectEntities } = loadingAdapter.getSelectors<AppState>((state) => state.loading);

export const isLoading = (state: AppState, key: string | string[]) => {
  const requests = selectEntities(state);

  if (typeof key === 'string') {
    const req = find(requests, (_value, k) => {
      return !!matchPath(key, k);
    });
    if (!req) return false;
    if (req.loadingNumber > 0) return true;
    return false;
  }

  return key.some((kk) => {
    const req = find(requests, (_value, k) => {
      return !!matchPath(kk, k);
    });
    if (!req) return false;
    if (req.loadingNumber > 0) return true;
    return false;
  });
};
