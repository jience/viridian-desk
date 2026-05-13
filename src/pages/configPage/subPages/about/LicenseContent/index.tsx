import type { FC } from 'react';
import style from './index.module.scss';
import { SettingItem } from '@/components/SettingItem';
import { useTranslation } from 'react-i18next';
import type { GetClientAboutResp } from '@/native/interfaces/terminal';

export interface LicenseContentProps {
  aboutInfo?: GetClientAboutResp;
}

export const LicenseContent: FC<LicenseContentProps> = (props) => {
  const { aboutInfo } = props;
  const { t } = useTranslation();

  return (
    <div className={style.licenseContentWrapper}>
      <SettingItem mainTitle={t('config_page.about.license_agreement')} sticky>
        <pre>{aboutInfo?.license || ''}</pre>
      </SettingItem>
    </div>
  );
};
