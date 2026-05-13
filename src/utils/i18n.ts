import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import dayjs from 'dayjs';
import { LanguageType } from '@/native/interfaces/config';

const supportedLanguages = Object.values(LanguageType);

const canonicalizeLanguage = (language: string): LanguageType => {
  if (supportedLanguages.includes(language as LanguageType)) {
    return language as LanguageType;
  }

  const normalizedLanguage = language.toLowerCase();

  if (
    normalizedLanguage === 'zh' ||
    normalizedLanguage === 'zh-cn' ||
    normalizedLanguage.startsWith('zh-hans')
  ) {
    return LanguageType.ZH_CN;
  }
  if (normalizedLanguage === 'zh-tw' || normalizedLanguage.startsWith('zh-hant')) {
    return LanguageType.ZH_TW;
  }
  if (normalizedLanguage === 'en' || normalizedLanguage.startsWith('en-')) {
    return LanguageType.EN_US;
  }

  return LanguageType.ZH_CN;
};

i18next
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      const canonicalLanguage = canonicalizeLanguage(language);

      if (namespace === 'common' || namespace === 'assistant') {
        return import(`@/ui/i18n/locales/${canonicalLanguage}/${namespace}.json`);
      }

      // 处理浏览器语言检测可能返回 'zh' 的情况，防止 Vite 报错 "Unknown variable dynamic import"
      if (canonicalLanguage === LanguageType.ZH_CN) {
        return import('@/assets/locales/zh-CN.json');
      }
      if (canonicalLanguage === LanguageType.EN_US) {
        return import('@/assets/locales/en-US.json');
      }
      // 仅加载支持的语言包
      if (supportedLanguages.includes(canonicalLanguage)) {
        return import(`@/assets/locales/${canonicalLanguage}.json`);
      }
      return Promise.resolve({});
    }),
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    nsSeparator: false,
    debug: import.meta.env.DEV,
    fallbackLng: LanguageType.ZH_CN,
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,
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
