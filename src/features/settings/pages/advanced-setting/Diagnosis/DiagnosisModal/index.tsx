import './index.scss';

import {
  useEffect,
  useState,
  useImperativeHandle,
  useMemo,
  useRef,
  type Ref,
  type FC,
} from 'react';
import { DiagnosisInfo } from './DiagnosisInfo';
import { Button, Modal, Progress } from '@/shared/ui';
import type { DiagnosisData } from './DiagnosisInfo/types';
import { useAppSelector } from '@/store';
import { selectClientType, selectVersionName } from '@/store/feature/terminal';
import dayjs from 'dayjs';
import { selectAutoGateway, selectConnected, selectNetwork } from '@/store/feature/gateway';
import { getNetworkType } from '@/utils/common';
import type { UnlistenFn } from '@/native/interfaces/types';
import { useTranslation } from 'react-i18next';
import { CheckCircleFilled, CopyOutlined } from '@/shared/ui/icons';
import type { NetProbeItemRender } from '@/native/interfaces/cmd';
import { bridge } from '@/native';
import { copyText } from '@/utils/clipboard';

export type DiagnosisModalRef = {
  openModal: () => Promise<void>;
};

export interface DiagnosisModalProps {
  ref?: Ref<DiagnosisModalRef>;
}

const DiagnosisModal: FC<DiagnosisModalProps> = ({ ref }) => {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [copyDiagnosis, setCopyDiagnosis] = useState('');
  const [diagnosisCopied, setDiagnosisCopied] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetProbeItemRender>();
  const [totalDiagnosisProgress, setTotalDiagnosisProgress] = useState(0);
  const [diagnosisProgress, setDiagnosisProgress] = useState(0);

  const clientType = useAppSelector(selectClientType);
  const clientVersion = useAppSelector(selectVersionName);
  const network = useAppSelector(selectNetwork);
  const connect = useAppSelector(selectConnected);
  const autoGateway = useAppSelector(selectAutoGateway);
  const unlistenGatewayDiagnosticsUpdateRef = useRef<UnlistenFn>(null);
  const unlistenGatewayDiagnosticsCompleteRef = useRef<UnlistenFn>(null);

  const fetchNetworkInfo = async () => {
    const { data } = await bridge.cmd.getLocalNetInfo();
    if (data?.length > 0) {
      const firstInfo = data[0];
      setNetworkInfo(firstInfo);
    }
  };

  const diagnosisData = useMemo<DiagnosisData>(() => {
    return {
      diagnoseTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      deviceInfo: clientType,
      terminalVersion: clientVersion,
      isConnNet: network ? '是' : '否',
      internetRestriction: navigator.onLine ? (
        <div className="normal">正常</div>
      ) : (
        <div className="error">异常</div>
      ),
      internetType: getNetworkType(),
      socketStatusInfo: connect ? (
        <div className="normal">正常</div>
      ) : (
        <div className="error">异常</div>
      ),
      deviceIP: networkInfo?.ipv4,
      gatewayAddress: autoGateway?.address,
      connTime: '-',
    };
  }, [clientType, clientVersion, network, networkInfo, autoGateway]);

  // ping 详情记录
  const [baseInfo, _setBaseInfo] = useState('');
  const [pingContent, setPingContent] = useState('');

  const startCheck = async () => {
    setPingContent('');
    setDiagnosing(true);
    await bridge.cmd
      .diagnoseGatewayNetwork((e) => {
        if (e.event === 'Started') {
          setTotalDiagnosisProgress(e.data.totalItems);
        } else if (e.event === 'Progress') {
          const { diagnosedItems, status } = e.data;
          const { is_open, port } = status;
          setPingContent((prev) => prev + `端口 ${port}: ${is_open ? '正常' : '异常'}\n`);
          const progress = Math.round((diagnosedItems / totalDiagnosisProgress) * 100);
          setDiagnosisProgress(progress);
        } else if (e.event === 'Finished') {
          setDiagnosing(false);
        }
      })
      .catch(() => {
        setDiagnosing(false);
      });
  };

  const resetData = () => {
    setDiagnosing(false);
    setCopyDiagnosis('');
    setPingContent('');
  };

  const handleCopied = () => {
    setDiagnosisCopied(true);
    setTimeout(() => {
      setDiagnosisCopied(false);
    }, 2000);
  };

  const handleCopyDiagnosis = async () => {
    await copyText(copyDiagnosis);
    handleCopied();
  };

  useEffect(() => {
    if (visible) {
      getNetworkType();
      fetchNetworkInfo();
      startCheck();
    }

    return () => {
      unlistenGatewayDiagnosticsUpdateRef.current?.();
      unlistenGatewayDiagnosticsCompleteRef.current?.();
    };
  }, [visible]);

  useEffect(() => {
    if (pingContent) {
      setCopyDiagnosis(baseInfo + pingContent);
    }
  }, [baseInfo, pingContent, setCopyDiagnosis]);

  useImperativeHandle(ref, () => {
    return {
      openModal: async () => {
        setVisible(true);
        resetData();
      },
    };
  }, []);

  return (
    <Modal
      title={t('config_page.advanced_setting.diagnosis')}
      open={visible}
      keyboard={false}
      maskClosable={false}
      closable={false}
      className="diagnosis-modal-wrapper"
      afterClose={() => {
        resetData();
      }}
      footer={
        <div className="vdui-modal-footer diagnosis-modal-footer">
          <Button
            key="cancel"
            onClick={() => {
              setDiagnosisCopied(false);
              setVisible(false);
              setDiagnosing(false);
            }}
            disabled={diagnosing}
          >
            {t('config_page.close')}
          </Button>
          <Button
            key="copy"
            type="primary"
            disabled={diagnosing}
            icon={diagnosisCopied ? <CheckCircleFilled /> : <CopyOutlined />}
            onClick={handleCopyDiagnosis}
          >
            {t('config_page.advanced_setting.copy_content')}
          </Button>
          <Button
            key="link"
            type="primary"
            loading={diagnosing}
            onClick={() => {
              setDiagnosing(true);
              setDiagnosisCopied(false);
              startCheck();
            }}
          >
            {diagnosing
              ? t('config_page.advanced_setting.diagnosing')
              : t('config_page.advanced_setting.re_diagnosis')}
          </Button>
        </div>
      }
    >
      <Progress
        percent={diagnosisProgress}
        status="active"
        showInfo={false}
        strokeLinecap="square"
        size="small"
        strokeColor={{
          '0%': 'var(--vd-color-accent, #8ef2bd)',
          '100%': 'var(--vd-color-success, #37b56d)',
        }}
      />
      <DiagnosisInfo diagnosing={diagnosing} info={diagnosisData} pingContent={pingContent} />
    </Modal>
  );
};

export default DiagnosisModal;
