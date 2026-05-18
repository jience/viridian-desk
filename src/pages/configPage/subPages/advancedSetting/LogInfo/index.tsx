import './index.scss';
import InfoTable from '@/components/InfoTable';
import { useAppSelector } from '@/store';
import { selectDeveloperMode, selectIntegration } from '@/store/feature/config';
import { transformSize } from '@/utils/common';
import { DeleteOutlined, EditOutlined, FolderOpenOutlined } from '@/ui/icons';
import { Space, Button, Modal, message } from '@/ui';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { LogConfigModal, type LogConfigModalRef } from './LogConfigModal';
import type { GetLogInfoRes, SetLogReq } from '@/native/interfaces/cmd';
import { bridge } from '@/native';
import { SettingsRow } from '../../../components';

export type LogInfoProps = unknown;

export const LogInfo: FC<LogInfoProps> = () => {
  const [modal, contextHolder] = Modal.useModal();
  const logConfigModalRef = useRef<LogConfigModalRef>(null);
  const { t } = useTranslation();
  const developerMode = useAppSelector(selectDeveloperMode);
  const isIntegratedMode = useAppSelector(selectIntegration);

  const [logInfo, setLogInfo] = useState<GetLogInfoRes>();

  // 计算日志信息列表数据状态
  const logInfoRows = useMemo(() => {
    return [
      {
        id: 'logSaveMaxSize',
        key: t('config_page.advanced_setting.log_max_size'),
        keyInfo: '',
        value: transformSize(logInfo?.max_file_size || 0),
      },
      {
        id: 'logSaveNum',
        key: t('config_page.advanced_setting.log_save_num'),
        keyInfo: '',
        value: `${logInfo?.log_retention_files || 0}`,
      },
      {
        id: 'dirPath',
        key: t('config_page.advanced_setting.log_path'),
        keyInfo: t('config_page.advanced_setting.log_path_tip'),
        value: logInfo?.path || '',
      },
    ];
  }, [logInfo, t]);

  // 打开日志存放文件夹查看
  const lookLog = async () => {
    await bridge.cmd.openLogDirectory();
  };

  // 清空日志
  const handleClearLog = () => {
    const logSize = logInfo?.log_size || 0;
    modal.confirm({
      centered: true,
      title: t('config_page.advanced_setting.clear_log'),
      content: t('config_page.advanced_setting.clear_log_confirm', {
        logSize: transformSize(logSize),
      }),
      okText: t('config_page.advanced_setting.clear'),
      cancelText: t('config_page.cancel'),
      onOk: async () => {
        await bridge.cmd.cleanLogFile();
        await fetchLogInfo();
      },
    });
  };

  // infoTable 编辑按钮触发外部处理方法
  const handleInfoTableEdit = async () => {
    const res = await logConfigModalRef.current?.openModal(logInfo);
    if (!res || !logInfo) return;
    const setLogReq: SetLogReq = {
      path: res.path || logInfo.path,
      maxFileSize: res.max_file_size || logInfo.max_file_size,
      // rotation_strategy: res.rotation_strategy || logInfo.rotation_strategy,
      rotationStrategy: logInfo.rotation_strategy,
      logRetentionFiles: res.log_retention_files || logInfo.log_retention_files,
    };
    await bridge.cmd.setLog(setLogReq);
    message.success(t('config_page.advanced_setting.save_log_config_success'));
    await fetchLogInfo();
  };

  const fetchLogInfo = async () => {
    const { data } = await bridge.cmd.getLogInfo();
    setLogInfo(data);
  };

  useEffect(() => {
    if (developerMode) {
      fetchLogInfo();
    }
  }, [developerMode]);

  const [logSizeNumber, logSizeUnit] = useMemo(() => {
    if (logInfo) {
      const size = logInfo.log_size || 0;
      return transformSize(size).split(' ');
    }
    return [0, 'MB'];
  }, [logInfo]);

  return (
    <div className="log-info-wrapper">
      <SettingsRow
        icon={<i className="iconfont icon-log" />}
        title={
          <div className="log-title">
            <span>{logSizeNumber}</span> {logSizeUnit}
          </div>
        }
        description={t('config_page.advanced_setting.log_size')}
        action={
          <Space size={4} wrap>
            <Button icon={<DeleteOutlined />} size="small" onClick={() => handleClearLog()}>
              {t('config_page.advanced_setting.clear')}
            </Button>
            {!isIntegratedMode && (
              <Button icon={<FolderOpenOutlined />} size="small" onClick={() => lookLog()}>
                {t('config_page.advanced_setting.look')}
              </Button>
            )}
          </Space>
        }
      >
        <InfoTable
          rows={logInfoRows}
          showEdit={!isIntegratedMode}
          editOperate={
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e: any) => {
                e.stopPropagation();
                handleInfoTableEdit();
              }}
            >
              {t('config_page.edit')}
            </Button>
          }
        />
      </SettingsRow>
      <LogConfigModal ref={logConfigModalRef} />
      {contextHolder}
    </div>
  );
};
