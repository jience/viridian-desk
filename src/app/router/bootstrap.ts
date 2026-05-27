import { appStore } from '@/store';
import { fetchClientInfo } from '@/store/feature/client';
import { fetchConfigInfo } from '@/store/feature/config';
import { fetchClientOnlineStatus, fetchGatewayList, setNetwork } from '@/store/feature/gateway';
import { fetchTerminalInfo } from '@/store/feature/terminal';

let authenticatedClientBootstrapScheduled = false;

const scheduleAfterFirstPaint = (task: () => void) => {
  window.requestAnimationFrame(() => {
    window.setTimeout(task, 0);
  });
};

const scheduleWhenIdle = (task: () => void) => {
  const requestIdle =
    window.requestIdleCallback ??
    ((callback: IdleRequestCallback) => window.setTimeout(() => callback({} as IdleDeadline), 180));
  requestIdle(() => task(), { timeout: 1200 });
};

export const preAuthConfigLoader = () => {
  authenticatedClientBootstrapScheduled = false;
  appStore.dispatch(setNetwork(navigator.onLine));
  schedulePreAuthClientBootstrap();
  return null;
};

function schedulePreAuthClientBootstrap() {
  scheduleAfterFirstPaint(() => {
    const state = appStore.getState();
    if (!state.terminal) {
      void appStore.dispatch(fetchTerminalInfo());
    }
    if (!state.config.client_id) {
      void appStore.dispatch(fetchConfigInfo());
    }
    if (!state.gateway.gatewayList.length) {
      void appStore.dispatch(fetchGatewayList());
    }
  });

  scheduleWhenIdle(() => {
    const state = appStore.getState();
    if (state.gateway.connected === false) {
      void appStore.dispatch(fetchClientOnlineStatus());
    }
  });
}

export const clientLayoutLoader = () => {
  appStore.dispatch(setNetwork(navigator.onLine));
  scheduleAuthenticatedClientBootstrap();
  return null;
};

function scheduleAuthenticatedClientBootstrap() {
  if (authenticatedClientBootstrapScheduled) return;
  authenticatedClientBootstrapScheduled = true;

  scheduleAfterFirstPaint(() => {
    const state = appStore.getState();
    if (!state.terminal) {
      void appStore.dispatch(fetchTerminalInfo());
    }
    if (!state.gateway.gatewayList.length) {
      void appStore.dispatch(fetchGatewayList());
    }
    if (state.gateway.connected === false) {
      void appStore.dispatch(fetchClientOnlineStatus());
    }
  });

  scheduleWhenIdle(() => {
    const state = appStore.getState();
    if (!state.config.client_id) {
      void appStore.dispatch(fetchConfigInfo());
    }
    if (!state.client) {
      void appStore.dispatch(fetchClientInfo());
    }
  });
}
