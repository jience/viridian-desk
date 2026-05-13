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
export const isApiErrResponse = <T = EmptyObject>(
  res: ApiResponse<T> | ApiErrResponse<T>,
): res is ApiErrResponse<T> => {
  return (
    typeof (res as ApiErrResponse<T>).errorCode === 'string' &&
    typeof (res as ApiErrResponse<T>).errorMessage === 'string' &&
    typeof (res as ApiErrResponse<T>).requestId === 'string'
  );
};
