import { useTranslation } from 'react-i18next';
import './index.scss';

import { useRef, type FC } from 'react';
import { SettingItem } from '@/components/SettingItem';
import { Button } from 'antd';
import DiagnosisModal, { type DiagnosisModalRef } from './DiagnosisModal';

export const Diagnosis: FC = () => {
  const { t } = useTranslation();
  const diagnosisRef = useRef<DiagnosisModalRef>(null);

  const handleOpenDiagnosis = async () => {
    if (diagnosisRef.current) {
      await diagnosisRef.current.openModal();
    }
  };

  return (
    <div className="diagnosis-wrapper">
      <SettingItem
        mainTitle={t('config_page.advanced_setting.diagnosis')}
        optionSlot={
          <Button className="right-btn" size="small" onClick={handleOpenDiagnosis}>
            {t('config_page.advanced_setting.diagnosis')}
          </Button>
        }
      />
      <DiagnosisModal ref={diagnosisRef} />
    </div>
  );
};
