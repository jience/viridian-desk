const isDebugRuntime = import.meta.env.DEV || import.meta.env.TAURI_DEBUG === 'true';

type LogMethod = (...args: unknown[]) => void;

const devOnly =
  (method: LogMethod): LogMethod =>
  (...args) => {
    if (isDebugRuntime) {
      method(...args);
    }
  };

export const logger = {
  debug: devOnly(console.debug.bind(console)),
  info: devOnly(console.info.bind(console)),
  warn: devOnly(console.warn.bind(console)),
  error: devOnly(console.error.bind(console)),
};
