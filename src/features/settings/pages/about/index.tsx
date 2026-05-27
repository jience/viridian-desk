import { useEffect, useState } from 'react';
import './index.scss';
import { Skeleton } from '@/shared/ui';

import { VersionInfo } from './VersionInfo';
import { LicenseContent } from './LicenseContent';
import { bridge } from '@/native';
import type { GetClientAboutResp } from '@/native/interfaces/terminal';
import { useTranslation } from 'react-i18next';
import { useMessageFormatter } from '@/utils/message-format';
import { SettingsSection } from '../../components';

type PendingAboutKey = 'product' | 'product_description';

const aboutKey = <T extends PendingAboutKey>(key: T) => `config_page.about.${key}` as const;

export default function About(_props: any) {
  const { t } = useTranslation();
  const intl = useMessageFormatter();
  const tPending = (key: PendingAboutKey) => t(aboutKey(key));
  const [aboutInfo, setAboutInfo] = useState<GetClientAboutResp>();
  const [getClientAboutLoading, setGetClientAboutLoading] = useState(false);

  const fetchAbout = async () => {
    setGetClientAboutLoading(true);
    try {
      const res = await bridge.terminal.getClientAbout();
      setAboutInfo(res.data);
    } finally {
      setGetClientAboutLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  return (
    <SettingsSection
      eyebrow={tPending('product')}
      title={intl.formatMessage({ id: 'ABOUT' })}
      description={tPending('product_description')}
    >
      {getClientAboutLoading ? (
        <div className="about about--loading">
          <Skeleton active />
        </div>
      ) : (
        <div className="about">
          <VersionInfo aboutInfo={aboutInfo} />
          <div className="bottom-wrapper">
            <LicenseContent aboutInfo={aboutInfo} />
          </div>
          <div className="copyright">{aboutInfo?.copyright}</div>
        </div>
      )}
    </SettingsSection>
  );
}
