import { useEffect, useMemo, useState } from 'react';

type ProgressiveOptions = {
  initialCount?: number;
  chunkSize?: number;
};

const scheduleIdleWork = (task: () => void) => {
  const requestIdle =
    window.requestIdleCallback ??
    ((callback: IdleRequestCallback) =>
      window.setTimeout(() => callback({} as IdleDeadline), 120));
  const handle = requestIdle(() => task(), { timeout: 800 });

  return () => {
    if (window.cancelIdleCallback) {
      window.cancelIdleCallback(handle);
      return;
    }
    window.clearTimeout(handle);
  };
};

export function useProgressiveItems<T>(
  items: T[],
  { initialCount = 24, chunkSize = 24 }: ProgressiveOptions = {},
) {
  const targetInitialCount = Math.max(8, initialCount);
  const targetChunkSize = Math.max(8, chunkSize);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(items.length, targetInitialCount),
  );

  useEffect(() => {
    setVisibleCount(Math.min(items.length, targetInitialCount));
  }, [items, targetInitialCount]);

  useEffect(() => {
    if (visibleCount >= items.length) return;

    return scheduleIdleWork(() => {
      setVisibleCount((count) => Math.min(items.length, count + targetChunkSize));
    });
  }, [items.length, targetChunkSize, visibleCount]);

  return useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
}
