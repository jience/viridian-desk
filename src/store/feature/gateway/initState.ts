import type { GatewayState } from './types';

export const initState: GatewayState = {
  autoGateway: null,
  connected: false,
  network: navigator.onLine,
  publicNet: false,
  gatewayList: [],
};
