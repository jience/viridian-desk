import { createEntityAdapter } from '@reduxjs/toolkit';
import type { RequestItem } from './types';

export const loadingAdapter = createEntityAdapter<RequestItem>();

export const initState = loadingAdapter.getInitialState({});
