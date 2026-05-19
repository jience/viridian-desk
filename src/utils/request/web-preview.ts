const WEB_PREVIEW_LIST_APIS = new Set([
  '/listResourceUser',
  '/listDesktopPool',
  '/listVapp',
  '/listFault',
  '/listWorkflow',
  '/listAppLib',
]);

export function getWebPreviewResponse<RESP>(api: string): RESP | null {
  if (typeof window === 'undefined' || (window as any).__TAURI_INTERNALS__) {
    return null;
  }

  if (!WEB_PREVIEW_LIST_APIS.has(api)) {
    return null;
  }

  return {
    data: {
      results: [],
      totalCount: 0,
    },
  } as RESP;
}
