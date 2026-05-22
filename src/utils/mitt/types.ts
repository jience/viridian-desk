import type { ApiErrResponse } from '../request/types';

export type Events = {
  'api/error': ApiErrResponse;
};
