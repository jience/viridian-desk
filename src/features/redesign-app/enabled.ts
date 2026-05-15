type RedesignAppEnv = ImportMetaEnv & {
  readonly VITE_ENABLE_REDESIGN_APP?: string;
};

const explicitOffValues = new Set(['false', '0', 'off', 'no']);
const flagValue = (import.meta.env as RedesignAppEnv).VITE_ENABLE_REDESIGN_APP;

export const isRedesignAppEnabled = !explicitOffValues.has(
  String(flagValue ?? '')
    .trim()
    .toLowerCase(),
);
