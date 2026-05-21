import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import dayjs from 'dayjs';
import { LanguageType, type LanguageType as SupportedLanguage } from '@/native/interfaces/config';
import { readCachedConfig } from '@/store/feature/config/configCache';

type LocaleNamespace = 'translation' | 'common' | 'assistant';
type LocaleModule = Promise<{ default: Record<string, unknown> }>;

const localeNamespaces: LocaleNamespace[] = ['translation', 'common', 'assistant'];
const localeLoaders: Record<SupportedLanguage, Record<LocaleNamespace, () => LocaleModule>> = {
  [LanguageType.ZH_CN]: {
    translation: () => import('@/assets/locales/zh-CN.json'),
    common: () => import('@/ui/i18n/locales/zh-CN/common.json'),
    assistant: () => import('@/ui/i18n/locales/zh-CN/assistant.json'),
  },
  [LanguageType.ZH_TW]: {
    translation: () => import('@/assets/locales/zh-TW.json'),
    common: () => import('@/ui/i18n/locales/zh-TW/common.json'),
    assistant: () => import('@/ui/i18n/locales/zh-TW/assistant.json'),
  },
  [LanguageType.EN_US]: {
    translation: () => import('@/assets/locales/en-US.json'),
    common: () => import('@/ui/i18n/locales/en-US/common.json'),
    assistant: () => import('@/ui/i18n/locales/en-US/assistant.json'),
  },
};

const supportedLanguages = Object.values(LanguageType);

const isSupportedLanguage = (language?: string): language is SupportedLanguage => {
  return supportedLanguages.includes(language as SupportedLanguage);
};

const cachedConfigLanguage = readCachedConfig().language;
const cachedLanguage = isSupportedLanguage(cachedConfigLanguage) ? cachedConfigLanguage : undefined;

const isLocaleNamespace = (namespace?: string): namespace is LocaleNamespace => {
  return localeNamespaces.includes(namespace as LocaleNamespace);
};

i18next
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      const lng = isSupportedLanguage(language) ? language : LanguageType.ZH_CN;
      const ns = isLocaleNamespace(namespace) ? namespace : 'translation';
      return localeLoaders[lng][ns]().then((module) => module.default);
    }),
  )
  .use(initReactI18next)
  .init({
    ns: localeNamespaces,
    defaultNS: 'translation',
    nsSeparator: '::',
    keySeparator: false,
    debug: import.meta.env.DEV,
    lng: cachedLanguage,
    fallbackLng: LanguageType.ZH_CN,
    interpolation: {
      escapeValue: false, // React 已经自动防止 XSS，无需再次转义
    },
  });

i18next.services.formatter?.add('DATE_HUGE', (value: Date, lng) => {
  if (lng === 'zh-CN' || lng === 'zh-TW') {
    return dayjs(value).format('YYYY年MM月DD日 HH时mm分ss秒');
  }
  return dayjs(value).format('MMMM D, YYYY HH:mm:ss A');
});

export default i18next;
