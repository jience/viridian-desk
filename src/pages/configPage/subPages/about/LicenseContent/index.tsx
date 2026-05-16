import type { FC } from 'react';
import style from './index.module.scss';
import { useTranslation } from 'react-i18next';
import type { GetClientAboutResp } from '@/native/interfaces/terminal';
import { SettingsGroup } from '../../../redesign/components';

export interface LicenseContentProps {
  aboutInfo?: GetClientAboutResp;
}

export const LicenseContent: FC<LicenseContentProps> = (props) => {
  const { aboutInfo } = props;
  const { t } = useTranslation();
  const tPending = (key: 'license_description') =>
    (t as unknown as (translationKey: string) => string)(`config_page.about.${key}`);

  return (
    <div className={style.licenseContentWrapper}>
      <SettingsGroup
        title={t('config_page.about.license_agreement')}
        description={tPending('license_description')}
        className={style.licenseGroup}
      >
        <pre>{aboutInfo?.license || ''}</pre>
      </SettingsGroup>
    </div>
  );
};
