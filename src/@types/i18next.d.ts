import type Resources from './i18next-resource';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: Resources;
  }
}
