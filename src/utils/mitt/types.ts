import type { ApiErrResponse } from '../request/types';

export type Events = {
  'api/startLoading': string;
  'api/stopLoading': string;
  'api/error': ApiErrResponse;
};
