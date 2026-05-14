import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import dayjs from 'dayjs';
import { LanguageType } from '@/native/interfaces/config';
import zhCNTranslation from '@/assets/locales/zh-CN.json';
import zhTWTranslation from '@/assets/locales/zh-TW.json';
import enUSTranslation from '@/assets/locales/en-US.json';
import zhCNCommon from '@/ui/i18n/locales/zh-CN/common.json';
import zhTWCommon from '@/ui/i18n/locales/zh-TW/common.json';
import enUSCommon from '@/ui/i18n/locales/en-US/common.json';
import zhCNAssistant from '@/ui/i18n/locales/zh-CN/assistant.json';
import zhTWAssistant from '@/ui/i18n/locales/zh-TW/assistant.json';
import enUSAssistant from '@/ui/i18n/locales/en-US/assistant.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      [LanguageType.ZH_CN]: {
        translation: zhCNTranslation,
        common: zhCNCommon,
        assistant: zhCNAssistant,
      },
      [LanguageType.ZH_TW]: {
        translation: zhTWTranslation,
        common: zhTWCommon,
        assistant: zhTWAssistant,
      },
      [LanguageType.EN_US]: {
        translation: enUSTranslation,
        common: enUSCommon,
        assistant: enUSAssistant,
      },
    },
    ns: ['translation', 'common', 'assistant'],
    defaultNS: 'translation',
    nsSeparator: '::',
    keySeparator: false,
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
