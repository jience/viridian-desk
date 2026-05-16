import { useMemo } from 'react';
import style from './index.module.scss';
import { useAppSelector } from '@/store';
import { selectIntegration } from '@/store/feature/config';
import { selectIsThin } from '@/store/feature/terminal';
import { AutoStart } from './AutoStart';
import { FullScreen } from './FullScreen';
import { AutoUpdate } from './AutoUpdate';
import { LanguageSelect } from './LanguageSelect';
import { ThemeSelect } from './ThemeSelect';
import { useTranslation } from 'react-i18next';
import { useIntl } from 'react-intl';
import { SettingsGroup, SettingsSection } from '../../redesign/components';

type PendingCommonSettingKey =
  | 'appearance_language'
  | 'appearance_language_description'
  | 'preferences'
  | 'preferences_description'
  | 'startup_display'
  | 'startup_display_description';

const commonSettingKey = (key: PendingCommonSettingKey) => `config_page.common_setting.${key}`;

export default function CommonSetting(_props: any) {
  const { t } = useTranslation();
  const intl = useIntl();
  const tPending = (key: PendingCommonSettingKey) =>
    (t as unknown as (translationKey: string) => string)(commonSettingKey(key));
  const isIntegrated = useAppSelector(selectIntegration);
  const isThin = useAppSelector(selectIsThin);

  const showFullScreen = useMemo(() => {
    return !isIntegrated || !isThin;
  }, [isIntegrated, isThin]);

  return (
    <SettingsSection
      eyebrow={tPending('preferences')}
      title={intl.formatMessage({ id: 'COMMONSETUP' })}
      description={tPending('preferences_description')}
    >
      <div className={style.commonSettingWrapper}>
        <SettingsGroup
          title={tPending('startup_display')}
          description={tPending('startup_display_description')}
        >
          <AutoStart />
          {showFullScreen && <FullScreen />}
          <AutoUpdate />
        </SettingsGroup>
        <SettingsGroup
          title={tPending('appearance_language')}
          description={tPending('appearance_language_description')}
        >
          <LanguageSelect />
          <ThemeSelect />
        </SettingsGroup>
      </div>
    </SettingsSection>
  );
}
