export type EmptyObject = Record<string, never>;

export interface ApiResponse<T = EmptyObject> {
  requestId: string;
  data: T;
}

export interface ApiErrResponse<T = EmptyObject> {
  requestId: string;
  data: T;
  errorCode: string;
  errorMessage: string;
}

export interface ApiPageResponse<T = EmptyObject> {
  totalCount: number;
  pageSize?: number;
  pageNumber?: number;
  results?: T[];
}

export interface ApiPageRequest {
  pageSize: number;
  pageNumber: number;
}

/**
 * ApiResponse err的类型守卫
 */
export const isApiErrResponse = <T = EmptyObject>(res: unknown): res is ApiErrResponse<T> => {
  if (typeof res !== 'object' || res === null) return false;
  const value = res as Partial<ApiErrResponse<T>>;
  return (
    typeof value.errorCode === 'string' &&
    typeof value.errorMessage === 'string' &&
    typeof value.requestId === 'string'
  );
};
