import { Modal, Progress } from 'antd';
import { useIntl } from 'react-intl';
import './index.scss';
import upgradeCon from '@/assets/images/upgrade-con.svg';
import { useEffect, useMemo, useState, type FC } from 'react';
import { transformSize, transformSpeed } from '@/utils/common';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { bridge } from '@/native';
import type { FetchUpdateResp } from '@/native/interfaces/app_updates';

export interface DownloadModalProps {
  data: FetchUpdateResp;
  downloadVisible: boolean;
  setDownloadVisible: (visible: boolean) => void;
}

const DownloadModal: FC<DownloadModalProps> = (props) => {
  const intl = useIntl();
  const { data, downloadVisible, setDownloadVisible } = props;
  const noRequireUpdate = data.currentVersion === data.version;
  const [isDownLoading, setIsDownLoading] = useState(false);
  const [contentLength, setContentLength] = useState(0);
  const [downloadedLength, setDownloadedLength] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [updateStatus, setUpdateStatus] = useState<
    'checking' | 'downloading' | 'downloaded' | 'installing' | 'error'
  >('checking');

  const [errorText, setErrorText] = useState('');

  const handleUpgrade = async () => {
    if (noRequireUpdate) {
      setDownloadVisible(false);
    } else {
      await bridge.app_updates
        .installUpdate((event) => {
          switch (event.event) {
            case 'Started':
              setUpdateStatus('downloading');
              setStartTime(Date.now());
              setIsDownLoading(true);
              setContentLength(event.data?.contentLength || 0);
              break;
            case 'Progress':
              setDownloadedLength(event.data?.downloadedLength || 0);
              break;
            case 'Finished':
              setIsDownLoading(false);
              setUpdateStatus('downloaded');
              break;
          }
        })
        .catch((error) => {
          setIsDownLoading(false);
          setUpdateStatus('error');
          setErrorText(error || '下载更新失败，请稍后重试');
        });
    }
  };

  const downloadSpeed = useMemo(() => {
    return Math.round(((downloadedLength || 0) / (Date.now() - startTime)) * 1000);
  }, [downloadedLength, startTime]);

  const downloadProgress = useMemo(() => {
    return Math.round(((downloadedLength || 0) / contentLength) * 100);
  }, [downloadedLength, contentLength]);

  const renderContent = () => {
    if (noRequireUpdate) {
      return (
        <div className="latest-version-wrapper">
          <CheckCircleFilled className="icon" />
          <div className="info">{intl.formatMessage({ id: 'NO_UPDATE_VERSION_REQUIRED' })}</div>
          <div className="current-version">
            {intl.formatMessage({ id: 'CURRENT_VERSION' })} {data.currentVersion}
          </div>
        </div>
      );
    } else if (updateStatus === 'checking') {
      return (
        <div className="download-ready-wrapper">
          <div className="version-info-wrapper">
            <div className="version-info-start">
              <div className="version">{data.currentVersion}</div>
              <div className="version-desc">{intl.formatMessage({ id: 'CURRENT_VERSION' })}</div>
            </div>
            <img src={upgradeCon} alt="" />
            <div className="version-info-end">
              <div className="version">{data.version}</div>
              <div className="version-desc">{intl.formatMessage({ id: 'UPGRADE_VERSION' })}</div>
            </div>
          </div>

          {data.notes && (
            <div
              className="update-msg"
              dangerouslySetInnerHTML={{
                __html: data.notes?.split('\n').join('<br/>'),
              }}
            ></div>
          )}
        </div>
      );
    } else if (updateStatus === 'downloaded' || updateStatus === 'downloading') {
      return (
        <div className="download-progress-wrapper">
          <div></div>
          <div>
            <div className="download-progress-info">
              <div className="download-progress-version">
                <span>正在下载版本</span>
                <span className="version-number">{data.version}</span>
              </div>
              <div className="download-progress-percent">{downloadProgress}%</div>
            </div>
            <Progress
              strokeColor={{
                '0%': '#8EF2BD',
                '100%': '#4ADE80',
              }}
              percent={downloadProgress}
              status={downloadProgress === 100 ? 'success' : 'active'}
              showInfo={false}
            />
            <div className="download-progress-time">
              <div className="download-progress-remaining">
                剩余 {transformSize(contentLength - downloadedLength)}
              </div>
              <div className="download-progress-speed">{transformSpeed(downloadSpeed)}</div>
            </div>
          </div>
          <div className="current-version">当前版本: {data.currentVersion}</div>
        </div>
      );
    } else if (updateStatus === 'error') {
      return (
        <div className="download-error-wrapper">
          <CloseCircleFilled className="icon" />
          <div className="info">更新失败</div>
          <div className="error-message">{errorText}</div>
        </div>
      );
    }
  };

  const okText = useMemo(() => {
    if (noRequireUpdate) {
      return intl.formatMessage({ id: 'IKnow' });
    }
    if (isDownLoading) {
      return intl.formatMessage({ id: 'NOW_UPGRADE' });
    }
    return intl.formatMessage({ id: 'NOW_UPGRADE' });
  }, [noRequireUpdate, isDownLoading]);

  useEffect(() => {
    if (downloadVisible) {
      setUpdateStatus('checking');
      setIsDownLoading(false);
      setContentLength(0);
      setDownloadedLength(0);
      setStartTime(Date.now());
      setErrorText('');
    }
  }, [downloadVisible]);

  return (
    <Modal
      title={''}
      open={downloadVisible}
      centered={true}
      keyboard={false}
      maskClosable={false}
      onOk={handleUpgrade}
      className={'download-update'}
      closable={updateStatus === 'checking' || updateStatus === 'error'}
      cancelButtonProps={
        noRequireUpdate || updateStatus !== 'checking' ? { style: { display: 'none' } } : {}
      }
      okButtonProps={{
        style: updateStatus !== 'checking' ? { display: 'none' } : {},
      }}
      okText={okText}
      cancelText={noRequireUpdate ? '' : intl.formatMessage({ id: 'NEXT_UPGRADE' })}
      onCancel={() => {
        setDownloadVisible(false);
      }}
      afterClose={() => {
        setIsDownLoading(false);
        setContentLength(0);
        setDownloadedLength(0);
        setStartTime(Date.now());
      }}
    >
      {renderContent()}
    </Modal>
  );
};

export default DownloadModal;
