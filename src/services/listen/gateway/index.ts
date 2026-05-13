// import { listen, type EventCallback } from '@tauri-apps/api/event';
// import type { GatewayDiagnosticsUpdatePayload } from './types';

// export enum GatewayListen {
//   GATEWAY_DIAGNOSTICS_UPDATE = 'gateway-diagnostics-update',
//   GATEWAY_DIAGNOSTICS_COMPLETE = 'gateway-diagnostics-complete',
// }

// export const gatewayDiagnosticsUpdate = async (
//   callback: EventCallback<GatewayDiagnosticsUpdatePayload>,
// ) => {
//   return await listen<GatewayDiagnosticsUpdatePayload>(
//     GatewayListen.GATEWAY_DIAGNOSTICS_UPDATE,
//     (event) => {
//       callback(event);
//     },
//   );
// };

// export const gatewayDiagnosticsComplete = async (callback: EventCallback<boolean>) => {
//   return await listen<boolean>(GatewayListen.GATEWAY_DIAGNOSTICS_COMPLETE, (event) => {
//     callback(event);
//   });
// };
