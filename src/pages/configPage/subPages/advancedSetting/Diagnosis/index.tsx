import { useTranslation } from 'react-i18next';
import './index.scss';

import { useRef, type FC } from 'react';
import { Button } from 'antd';
import DiagnosisModal, { type DiagnosisModalRef } from './DiagnosisModal';
import { SettingsRow } from '../../../components';

type PendingDiagnosisKey = 'diagnosis_description';

const advancedSettingKey = <T extends PendingDiagnosisKey>(key: T) =>
  `config_page.advanced_setting.${key}` as const;

export const Diagnosis: FC = () => {
  const { t } = useTranslation();
  const tPending = (key: PendingDiagnosisKey) => t(advancedSettingKey(key));
  const diagnosisRef = useRef<DiagnosisModalRef>(null);

  const handleOpenDiagnosis = async () => {
    if (diagnosisRef.current) {
      await diagnosisRef.current.openModal();
    }
  };

  return (
    <div className="diagnosis-wrapper">
      <SettingsRow
        icon={<i className="iconfont icon-log" />}
        title={t('config_page.advanced_setting.diagnosis')}
        description={tPending('diagnosis_description')}
        action={
          <Button className="right-btn" size="small" onClick={handleOpenDiagnosis}>
            {t('config_page.advanced_setting.diagnosis')}
          </Button>
        }
      />
      <DiagnosisModal ref={diagnosisRef} />
    </div>
  );
};
