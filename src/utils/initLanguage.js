import zhCN from '../locales/zh-CN';
import zhTW from '../locales/zh-TW';
import en from '../locales/en-US';

const LanguageData = {
  'en-US': { ...en },
  'zh-CN': { ...zhCN },
  'zh-TW': { ...zhTW },
};
// 全局语言模式设置
// 优先级： 设置过的 > 跟随系统 > 中文
window.LangCode = localStorage.getItem('umi_locale') || navigator?.language || 'zh-CN';
window.LanguageData = LanguageData;

export default LanguageData;
