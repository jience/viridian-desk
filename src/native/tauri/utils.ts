import type { NativeResponse } from '@/native/interfaces/types';
import { failure, success } from '@/native/utils';

export async function wrapInvoke<T>(
  command: string,
  opt?: {
    args?: Record<string, unknown>;
    errorType?: string;
  },
): Promise<NativeResponse<T>> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const resp = await invoke<T>(command, opt?.args);
    return success(resp);
  } catch (error) {
    throw failure(
      opt?.errorType ?? 'UnknownError',
      typeof error === 'string' ? error : (error as Error).message,
    );
  }
}
