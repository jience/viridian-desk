import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import dayjs from 'dayjs';
import { LanguageType } from '@/native/interfaces/config';

i18next
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      // 处理浏览器语言检测可能返回 'zh' 的情况，防止 Vite 报错 "Unknown variable dynamic import"
      if (language === 'zh') {
        return import('@/assets/locales/zh-CN.json');
      }
      if (language === 'en') {
        return import('@/assets/locales/en-US.json');
      }
      if (namespace === 'common' || namespace === 'assistant') {
        return import(`@/ui/i18n/locales/${language}/${namespace}.json`);
      }
      // 仅加载支持的语言包
      if (Object.values(LanguageType).includes(language as LanguageType)) {
        return import(`@/assets/locales/${language}.json`);
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
