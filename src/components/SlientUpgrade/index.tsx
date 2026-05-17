import { Modal, Progress } from 'antd';
import { useIntl } from 'react-intl';
import './index.scss';
import UpgradeLoading from '@/assets/images/upgradeLoading.svg?react';

const SlientUpgrade = (props: any) => {
  const intl = useIntl();

  const { showSilentUpdate, silentData, setShowSilentUpdate } = props;

  const renderContent = () => {
    if (silentData?.status == 'download') {
      return (
        <div className="upgrade-modal-content">
          <div className="content">
            <div className="top">
              <p>
                {intl.formatMessage({ id: 'DOWNLOADINGPAKAGE' })}
                <span>{silentData?.displayNext}</span>
              </p>
              <p>{silentData?.progress.toFixed(2) || ''}%</p>
            </div>
            <Progress
              status="active"
              showInfo={false}
              strokeColor={{
                '0%': 'var(--vd-color-accent, #8ef2bd)',
                '100%': 'var(--vd-color-success, #37b56d)',
              }}
              percent={silentData?.progress.toFixed(2) || ''}
            ></Progress>
            <p className="download-progress">
              剩余
              {((silentData?.total - silentData?.received) / 1048576).toFixed(2) || ''} MB{' '}
              {silentData?.networkSpeed < 1024
                ? `${silentData?.networkSpeed || ''}KB/s`
                : `${(silentData?.networkSpeed / 1024).toFixed(2) || ''}MB/s`}
            </p>
          </div>
          <p className="current-version">
            {intl.formatMessage({ id: 'CURRENT_VERSION' })}
            {silentData?.displayCurrent || ''}
          </p>
        </div>
      );
    } else if (silentData?.status == 'upgradeFail') {
      return (
        <div className="upgrade-modal-content">
          <div className="upgradeFail">
            <i className="iconfontColor icon-error-red upgradeFailIcon" />

            <p className="err">
              {intl.formatMessage({
                id: silentData?.message || 'NotSupportSlientUpgrade',
              })}
            </p>
            <p className="current-version-fail">
              {intl.formatMessage({ id: 'CURRENT_VERSION' })}
              {silentData?.displayCurrent}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="upgrade-modal-content">
          <div className="upgrading">
            <UpgradeLoading className="upgradeLoading"></UpgradeLoading>
            <p>
              {intl.formatMessage({ id: 'INSTALLINGPAKAGE' })}
              <span>{silentData?.displayNext}</span>
            </p>
          </div>
          <p className="current-version">
            {intl.formatMessage({ id: 'CURRENT_VERSION' })}
            {silentData?.displayCurrent}
          </p>
        </div>
      );
    }
  };

  return (
    <Modal
      title={''}
      open={showSilentUpdate}
      centered={true}
      keyboard={false}
      closable={silentData?.status == 'upgradeFail'}
      maskClosable={false}
      footer={null}
      className={'silent-update'}
      onCancel={() => {
        setShowSilentUpdate(false);
      }}
    >
      {renderContent()}
    </Modal>
  );
};

export default SlientUpgrade;
