export const isNilValue = (value: unknown): value is null | undefined => value == null;

export const isEmptyValue = (value: unknown): boolean => {
  if (isNilValue(value)) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return true;
};

export const getPathValue = <T = unknown>(source: unknown, path: string, fallback?: T): T => {
  const result = path.split('.').reduce<unknown>((current, segment) => {
    if (current == null) return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);

  return (result === undefined ? fallback : result) as T;
};

export const clonePlainValue = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // Fall through to JSON for plain request parameter objects.
    }
  }

  return JSON.parse(JSON.stringify(value)) as T;
};
