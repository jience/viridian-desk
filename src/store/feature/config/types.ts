import type { GetAppConfResp } from '@/native/interfaces/config';

export type ConfigState = Omit<GetAppConfResp, 'gateway'>;
