import { useCallback, useMemo, useState, type FC } from 'react';
import style from './index.module.scss';
import { useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal';
import { Button, Tag } from '@/shared/ui';
import { CheckCircleFilled, CopyOutlined, RocketOutlined } from '@/shared/ui/icons';
import { useTranslation } from 'react-i18next';
import DownloadModal from '@/features/settings/components/download-modal';
import type { FetchUpdateResp } from '@/native/interfaces/app_updates';
import { bridge } from '@/native';
import type { GetClientAboutResp } from '@/native/interfaces/terminal';
import { SettingsGroup, SettingsMetric, SettingsRow } from '../../../components';
import { copyText } from '@/utils/clipboard';

type PendingAboutKey =
  | 'client_type'
  | 'client_version'
  | 'sku'
  | 'version_info'
  | 'version_info_description';

const aboutKey = <T extends PendingAboutKey>(key: T) => `config_page.about.${key}` as const;

export interface VersionInfoProps {
  aboutInfo?: GetClientAboutResp;
}

export const VersionInfo: FC<VersionInfoProps> = (props) => {
  const { aboutInfo } = props;
  const isThin = useAppSelector(selectIsThin);
  const { t } = useTranslation();
  const tPending = (key: PendingAboutKey) => t(aboutKey(key));
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [downloadData, setDownloadData] = useState<FetchUpdateResp>();
  const [checkUpgradeLoading, setCheckUpgradeLoading] = useState(false);
  const [clientIdCopied, setClientIdCopied] = useState(false);
  const [buildIdCopied, setBuildIdCopied] = useState(false);

  const mainTitle = useMemo(() => {
    const mainTitleTags = [
      {
        className: style.clientTypeTag,
        text: aboutInfo?.clientType,
      },
      {
        className: style.versionTag,
        text: aboutInfo?.clientVersion,
      },
    ];
    if (isThin) {
      mainTitleTags.push({
        className: style.skuTag,
        text: aboutInfo?.sku || '-',
      });
    }

    return (
      <div className={style.mainTitle}>
        <span>{aboutInfo?.clientName}</span>
        <div className={style.tagWrapper}>
          {mainTitleTags.map((tag, index) => (
            <Tag key={index} className={tag.className}>
              {tag.text}
            </Tag>
          ))}
        </div>
      </div>
    );
  }, [aboutInfo, isThin]);

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

  const handleClientIdCopy = useCallback(async () => {
    await copyText(aboutInfo?.clientId || '');
    setClientIdCopied(true);
    setTimeout(() => {
      setClientIdCopied(false);
    }, 2000);
  }, [aboutInfo?.clientId]);

  const handleBuildIdCopy = useCallback(async () => {
    await copyText(aboutInfo?.buildId || '-');
    setBuildIdCopied(true);
    setTimeout(() => {
      setBuildIdCopied(false);
    }, 2000);
  }, [aboutInfo?.buildId]);

  const subTitle = useMemo(() => {
    const buildIdText = aboutInfo?.buildId || '-';
    return (
      <div className={style.subTitleWrapper}>
        <div className={style.subTitleItem}>
          <span>{t('config_page.about.client_id', { clientId: aboutInfo?.clientId || '-' })}</span>
          <Button
            aria-label={t('config_page.advanced_setting.copy_content')}
            className={style.copyInlineButton}
            icon={clientIdCopied ? <CheckCircleFilled /> : <CopyOutlined />}
            size="small"
            type="text"
            onClick={handleClientIdCopy}
          />
        </div>
        <div className={style.subTitleItem}>
          <span>{t('config_page.about.build_id', { buildId: buildIdText })}</span>
          <Button
            aria-label={t('config_page.advanced_setting.copy_content')}
            className={style.copyInlineButton}
            icon={buildIdCopied ? <CheckCircleFilled /> : <CopyOutlined />}
            size="small"
            type="text"
            onClick={handleBuildIdCopy}
          />
        </div>
      </div>
    );
  }, [aboutInfo, buildIdCopied, clientIdCopied, handleBuildIdCopy, handleClientIdCopy, t]);

  return (
    <div className={style.versionInfoWrapper}>
      <SettingsGroup
        title={tPending('version_info')}
        description={tPending('version_info_description')}
      >
        <SettingsRow
          icon={<i className="iconfont icon-info-s" />}
          title={mainTitle}
          description={subTitle}
          action={
            <Button
              size="small"
              icon={<RocketOutlined />}
              loading={checkUpgradeLoading}
              onClick={handleCheckUpgrade}
            >
              {t('config_page.about.version_update')}
            </Button>
          }
        />
        <div className={style.versionMetrics}>
          <SettingsMetric label={tPending('client_type')} value={aboutInfo?.clientType || '-'} />
          <SettingsMetric
            label={tPending('client_version')}
            value={aboutInfo?.clientVersion || '-'}
          />
          {isThin && <SettingsMetric label={tPending('sku')} value={aboutInfo?.sku || '-'} />}
        </div>
      </SettingsGroup>
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
