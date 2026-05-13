import type { GatewayItem } from '@/native/interfaces/config';

export interface StorageData {
  userId?: string;
  userName?: string;
  isLocal?: string;
  domain?: string;
  deviceId?: string;
  autoGateway?: GatewayItem;
  permissions?: string[];
}
