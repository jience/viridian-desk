import './index.scss';
import { useState, useImperativeHandle, type FC, type Ref, useRef } from 'react';
import { Modal, Form, InputNumber, Input, Select } from '@/ui';
import { getBSize, SizeType, transformSize } from '@/utils/common';
import { sizeTypeOptions } from './initData';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/plugin-dialog';
import type { GetLogInfoRes } from '@/native/interfaces/cmd';

export type LogConfigModalResData = Pick<
  GetLogInfoRes,
  'max_file_size' | 'log_retention_files' | 'path'
>;

export type LogConfigModalRef = {
  openModal: (initData?: Partial<GetLogInfoRes>) => Promise<LogConfigModalResData | null>;
};

export interface LogConfigModalProps {
  ref?: Ref<LogConfigModalRef>;
}

export interface LogConfigFormValues {
  logSaveMaxSize: number;
  logSaveNum: number;
  dirPath: string;
}

export const LogConfigModal: FC<LogConfigModalProps> = ({ ref }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<LogConfigFormValues>();
  const [visible, setVisible] = useState(false);
  const resolveRef = useRef<((value: LogConfigModalResData | null) => void) | null>(null);
  const [logSaveSizeType, setLogSaveSizeType] = useState<SizeType>(SizeType.MB);

  useImperativeHandle(
    ref,
    () => ({
      openModal: (initData: Partial<GetLogInfoRes> = {}): Promise<LogConfigModalResData | null> => {
        return new Promise<LogConfigModalResData | null>((resolvePromise) => {
          const [logSizeNumber = 0, logSizeUnit = 'MB'] = transformSize(
            initData.max_file_size,
          ).split(' ');

          const defaultValues: LogConfigFormValues = {
            logSaveMaxSize: +logSizeNumber,
            logSaveNum: initData.log_retention_files || 10,
            dirPath: initData.path || '',
          };
          setLogSaveSizeType(logSizeUnit as SizeType);

          form.setFieldsValue(defaultValues);
          setVisible(true);
          resolveRef.current = resolvePromise;
        });
      },
    }),
    [form],
  );

  // 选择目录的处理函数
  const handleSelectDirectory = async () => {
    try {
      const res = await open({
        directory: true,
        multiple: false,
        title: t('config_page.advanced_setting.select_dir_tip'),
      });
      if (res) {
        form.setFieldValue('dirPath', res);
      }
    } catch (error) {
      console.error('选择目录失败:', error);
    }
  };

  // 处理表单提交
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const result: LogConfigModalResData = {
        max_file_size: getBSize(values.logSaveMaxSize, logSaveSizeType),
        log_retention_files: values.logSaveNum,
        path: values.dirPath,
      };

      if (resolveRef.current) {
        resolveRef.current(result);
        resolveRef.current = null;
      }

      setVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
    resolveRef.current?.(null);
    resolveRef.current = null;
  };

  return (
    <Modal
      title={t('config_page.advanced_setting.log_management')}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={t('config_page.confirm')}
      cancelText={t('config_page.cancel')}
      centered
      maskClosable={false}
      keyboard={false}
      className="log-config-modal"
    >
      <Form<LogConfigFormValues> form={form} colon={false} labelCol={{ span: 5 }}>
        <Form.Item
          name="logSaveMaxSize"
          label={t('config_page.advanced_setting.log_max_size')}
          rules={[
            {
              required: true,
              message: t('config_page.advanced_setting.log_max_size_placeholder'),
            },
          ]}
        >
          <InputNumber
            className="log-config-field"
            min={1}
            max={1024}
            precision={0}
            placeholder={t('config_page.advanced_setting.log_max_size_placeholder')}
            addonAfter={
              <Select
                className="log-save-size-type-select"
                options={sizeTypeOptions}
                value={logSaveSizeType}
                onChange={(value) => setLogSaveSizeType(value)}
              />
            }
          />
        </Form.Item>

        <Form.Item
          name="logSaveNum"
          label={t('config_page.advanced_setting.log_save_num')}
          rules={[
            {
              required: true,
              message: t('config_page.advanced_setting.log_save_num_placeholder'),
            },
          ]}
        >
          <InputNumber
            className="log-config-field"
            min={7}
            max={500}
            precision={0}
            placeholder={t('config_page.advanced_setting.log_save_num_placeholder')}
          />
        </Form.Item>

        <Form.Item
          name="dirPath"
          label={t('config_page.advanced_setting.log_path')}
          tooltip={t('config_page.advanced_setting.log_path_tip')}
          rules={[
            {
              required: true,
              message: t('config_page.advanced_setting.log_path_placeholder'),
            },
          ]}
        >
          <Input
            className="log-config-field"
            placeholder={t('config_page.advanced_setting.log_path_placeholder')}
            addonAfter={
              <span className="log-save-path-select" onClick={handleSelectDirectory}>
                {t('config_page.advanced_setting.select_dir')}
              </span>
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
