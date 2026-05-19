import type { AppDispatch, AppState } from '@/store';

interface StoreRuntimeAccess {
  dispatch: AppDispatch;
  getState: () => AppState;
  handleUnauthorized: () => Promise<void> | void;
}

let runtimeAccess: StoreRuntimeAccess | null = null;

export function setStoreRuntimeAccess(access: StoreRuntimeAccess) {
  runtimeAccess = access;
}

export function getStoreState() {
  return runtimeAccess?.getState();
}

export async function handleStoreUnauthorized() {
  await runtimeAccess?.handleUnauthorized();
}
