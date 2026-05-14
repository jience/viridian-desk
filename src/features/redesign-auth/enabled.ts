type RedesignAuthEnv = ImportMetaEnv & {
  readonly VITE_ENABLE_REDESIGN_AUTH?: string;
};

const explicitOffValues = new Set(['false', '0', 'off', 'no']);
const flagValue = (import.meta.env as RedesignAuthEnv).VITE_ENABLE_REDESIGN_AUTH;

export const isRedesignAuthEnabled = !explicitOffValues.has(
  String(flagValue ?? '')
    .trim()
    .toLowerCase(),
);
