import type { NativeResponse } from '@/native/interfaces/types';
import { failure, success } from '@/native/utils';
import { invoke } from '@tauri-apps/api/core';

export async function wrapInvoke<T>(
  command: string,
  opt?: {
    args?: Record<string, unknown>;
    errorType?: string;
  },
): Promise<NativeResponse<T>> {
  try {
    const resp = await invoke<T>(command, opt?.args);
    return success(resp);
  } catch (error) {
    throw failure(
      opt?.errorType ?? 'UnknownError',
      typeof error === 'string' ? error : (error as Error).message,
    );
  }
}
