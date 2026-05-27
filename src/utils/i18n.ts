import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import dayjs from 'dayjs';
import { LanguageType, type LanguageType as SupportedLanguage } from '@/native/interfaces/config';
import { readCachedConfig } from '@/store/feature/config/configCache';

type LocaleNamespace = 'translation' | 'common' | 'assistant';
type LocaleResource = Record<string, unknown>;
type LocaleLoader = () => Promise<LocaleResource>;

const localeNamespaces: LocaleNamespace[] = ['translation', 'common', 'assistant'];
const translationModules = import.meta.glob<LocaleResource>('../assets/locales/*/*.json', {
  import: 'default',
});
const uiLocaleModules = import.meta.glob<LocaleResource>('../shared/ui/i18n/locales/*/*.json', {
  import: 'default',
});

const loadTranslationNamespace = async (language: SupportedLanguage): Promise<LocaleResource> => {
  const prefix = `../assets/locales/${language}/`;
  const loaders = Object.entries(translationModules)
    .filter(([modulePath]) => modulePath.startsWith(prefix))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, load]) => load);
  const chunks = await Promise.all(loaders.map((load) => load()));
  return Object.assign({}, ...chunks);
};

const loadUiNamespace = async (
  language: SupportedLanguage,
  namespace: Exclude<LocaleNamespace, 'translation'>,
): Promise<LocaleResource> => {
  const loader = uiLocaleModules[`../shared/ui/i18n/locales/${language}/${namespace}.json`];
  return loader ? loader() : {};
};

const createLocaleLoaders = (
  language: SupportedLanguage,
): Record<LocaleNamespace, LocaleLoader> => ({
  translation: () => loadTranslationNamespace(language),
  common: () => loadUiNamespace(language, 'common'),
  assistant: () => loadUiNamespace(language, 'assistant'),
});

const localeLoaders: Record<SupportedLanguage, Record<LocaleNamespace, LocaleLoader>> = {
  [LanguageType.ZH_CN]: {
    ...createLocaleLoaders(LanguageType.ZH_CN),
  },
  [LanguageType.ZH_TW]: createLocaleLoaders(LanguageType.ZH_TW),
  [LanguageType.EN_US]: createLocaleLoaders(LanguageType.EN_US),
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
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      const lng = isSupportedLanguage(language) ? language : LanguageType.ZH_CN;
      const ns = isLocaleNamespace(namespace) ? namespace : 'translation';
      return localeLoaders[lng][ns]();
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
