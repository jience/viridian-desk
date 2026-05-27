export const isFormDataBody = (body: unknown): body is FormData =>
  typeof FormData !== 'undefined' && body instanceof FormData;

const isArrayBufferViewBody = (body: unknown): body is ArrayBufferView<ArrayBuffer> =>
  typeof ArrayBuffer !== 'undefined' &&
  ArrayBuffer.isView(body) &&
  body.buffer instanceof ArrayBuffer;

export const shouldEncodeJsonBody = (body: unknown) => {
  if (body === null || body === undefined || isFormDataBody(body)) return false;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return false;
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return false;
  if (isArrayBufferViewBody(body)) return false;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false;
  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) return false;
  if (Array.isArray(body)) return body.length > 0;
  if (typeof body === 'object') return Object.keys(body).length > 0;
  return false;
};

export const normalizeRequestBody = (body: unknown): BodyInit | null | undefined => {
  if (body === undefined || body === null) return body;
  if (typeof body === 'string') return body;
  if (isFormDataBody(body)) return body;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return body;
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return body;
  if (isArrayBufferViewBody(body)) return body;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return body;
  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) return body;
  if (shouldEncodeJsonBody(body)) return JSON.stringify(body);
  return String(body);
};
