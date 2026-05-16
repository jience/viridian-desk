import style from './index.module.scss';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';
import { configLanguage, selectLanguage } from '@/store/feature/config';
import { LanguageType } from '@/native/interfaces/config';
import { SettingsRow } from '../../../redesign/components';

export const LanguageSelect: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  const languageOptions = useMemo(() => {
    return [
      { value: LanguageType.ZH_CN, label: t('config_page.common_setting.language_zh') },
      { value: LanguageType.EN_US, label: t('config_page.common_setting.language_en') },
      { value: LanguageType.ZH_TW, label: t('config_page.common_setting.language_tw') },
    ];
  }, [t]);

  // 修改全局语言
  const changeLanguage = async (language: LanguageType) => {
    await dispatch(configLanguage(language));
  };

  return (
    <div className={style.languageSelectWrapper}>
      <SettingsRow
        icon={<i className="iconfont icon-language" />}
        title={t('config_page.common_setting.language')}
        description={t('config_page.common_setting.language_description')}
        action={
          <Select
            className={style.languageSelect}
            size="small"
            options={languageOptions}
            onChange={(e) => changeLanguage(e)}
            value={language || 'zh-CN'}
            defaultValue={language || 'zh-CN'}
          />
        }
      />
    </div>
  );
};
