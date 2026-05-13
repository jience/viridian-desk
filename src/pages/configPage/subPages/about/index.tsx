import { useEffect, useState } from 'react';
import './index.scss';
import { Skeleton } from 'antd';

import { _get_client_about, _check_version_upgrade } from '@/services/invokeServices';
import { VersionInfo } from './VersionInfo';
import { LicenseContent } from './LicenseContent';
import { bridge } from '@/native';
import type { GetClientAboutResp } from '@/native/interfaces/terminal';

export default function About(_props: any) {
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
    <div className="about">
      {getClientAboutLoading ? (
        <Skeleton active />
      ) : (
        <>
          <VersionInfo aboutInfo={aboutInfo} />
          <div className="bottom-wrapper">
            <LicenseContent aboutInfo={aboutInfo} />
          </div>
          <div className="copyright">{aboutInfo?.copyright}</div>
        </>
      )}
    </div>
  );
}
