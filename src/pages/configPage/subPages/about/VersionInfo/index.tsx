import { useMemo, useState, type FC } from 'react';
import style from './index.module.scss';
import { SettingItem } from '@/components/SettingItem';
import { useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal';
import { Button, Tag } from 'antd';
import { CheckCircleFilled, CopyOutlined, RocketOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import DownloadModal from '@/components/DownloadModal';
import CopyToClipboard from 'react-copy-to-clipboard';
import type { FetchUpdateResp } from '@/native/interfaces/app_updates';
import { bridge } from '@/native';
import type { GetClientAboutResp } from '@/native/interfaces/terminal';

export interface VersionInfoProps {
  aboutInfo?: GetClientAboutResp;
}

export const VersionInfo: FC<VersionInfoProps> = (props) => {
  const { aboutInfo } = props;
  const isThin = useAppSelector(selectIsThin);
  const { t } = useTranslation();
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [downloadData, setDownloadData] = useState<FetchUpdateResp>();
  const [checkUpgradeLoading, setCheckUpgradeLoading] = useState(false);
  const [clientIdCopied, setClientIdCopied] = useState(false);
  const [buildIdCopied, setBuildIdCopied] = useState(false);

  const mainTitle = useMemo(() => {
    const mainTitleTags = [
      {
        color: '#A6C682',
        text: aboutInfo?.clientType,
      },
      {
        color: '#38A59B',
        text: aboutInfo?.clientVersion,
      },
    ];
    if (isThin) {
      mainTitleTags.push({
        color: '#38A59B',
        text: aboutInfo?.sku || '-',
      });
    }

    return (
      <div className={style.mainTitle}>
        <span>{aboutInfo?.clientName}</span>
        <div className={style.tagWrapper}>
          {mainTitleTags.map((tag, index) => (
            <Tag key={index} color={tag.color}>
              {tag.text}
            </Tag>
          ))}
        </div>
      </div>
    );
  }, [aboutInfo]);

  const handleCheckUpgrade = async () => {
    setCheckUpgradeLoading(true);
    const res = await bridge.app_updates.fetchUpdate().finally(() => setCheckUpgradeLoading(false));
    const params: FetchUpdateResp = {
      currentVersion: aboutInfo?.clientVersion || '-',
      notes: '',
      version: aboutInfo?.clientVersion || '-',
      ...res.data,
    };
    setDownloadVisible(true);
    setDownloadData(params);
  };

  const handleClientIdCopy = () => {
    setClientIdCopied(true);
    setTimeout(() => {
      setClientIdCopied(false);
    }, 2000);
  };

  const handleBuildIdCopy = () => {
    setBuildIdCopied(true);
    setTimeout(() => {
      setBuildIdCopied(false);
    }, 2000);
  };

  const subTitle = useMemo(() => {
    const clientIdText = aboutInfo?.clientId || '';
    const buildIdText = aboutInfo?.buildId || '-';
    return (
      <div className={style.subTitleWrapper}>
        <div className={style.subTitleItem}>
          <span>{t('config_page.about.client_id', { clientId: aboutInfo?.clientId || '-' })}</span>
          <CopyToClipboard text={clientIdText} onCopy={handleClientIdCopy}>
            {clientIdCopied ? <CheckCircleFilled /> : <CopyOutlined />}
          </CopyToClipboard>
        </div>
        <div className={style.subTitleItem}>
          <span>{t('config_page.about.build_id', { buildId: buildIdText })}</span>
          <CopyToClipboard text={buildIdText} onCopy={handleBuildIdCopy}>
            {buildIdCopied ? <CheckCircleFilled /> : <CopyOutlined />}
          </CopyToClipboard>
        </div>
      </div>
    );
  }, [aboutInfo, clientIdCopied, buildIdCopied, t]);

  return (
    <div className={style.versionInfoWrapper}>
      <SettingItem
        mainTitle={mainTitle}
        subTitle={subTitle}
        optionSlot={
          <Button
            size="small"
            icon={<RocketOutlined />}
            loading={checkUpgradeLoading}
            onClick={handleCheckUpgrade}
          >
            {t('config_page.about.version_update')}
          </Button>
        }
      ></SettingItem>
      {downloadData && (
        <DownloadModal
          setDownloadVisible={setDownloadVisible}
          data={downloadData}
          downloadVisible={downloadVisible}
        ></DownloadModal>
      )}
    </div>
  );
};
