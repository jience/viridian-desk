export const redesignNamespaces = ['common', 'assistant'] as const;

export type RedesignNamespace = (typeof redesignNamespaces)[number];
