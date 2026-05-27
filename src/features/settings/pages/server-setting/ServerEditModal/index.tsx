import { Form, Input, Modal, Switch } from '@/shared/ui';
import { useImperativeHandle, useMemo, useRef, useState, type FC, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import { validateAddress, validateName } from '@/utils/validate';
import styles from './index.module.scss';

// 指定弹窗返回值类型
export type ServerEditModalRespType = {
  name: string;
  address: string;
  isPublic: boolean;
} | null;

// 指定弹窗请求参数类型
export interface ServerEditModalReqType {
  name: string;
  address: string;
  isPublic: boolean;
}

export type ResolveFunType = (value: ServerEditModalRespType) => void;

export type ServerEditModalRef = {
  openModal: (opt: {
    initData?: Partial<ServerEditModalReqType>;
    modalType?: 'add' | 'edit';
  }) => Promise<ServerEditModalRespType>;
};

export interface ServerEditModalProps {
  ref?: Ref<ServerEditModalRef>;
}

export const ServerEditModal: FC<ServerEditModalProps> = ({ ref }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<ServerEditModalReqType>();
  const resolveRef = useRef<ResolveFunType>(null);
  const { t } = useTranslation();
  const [modalType, setModalType] = useState<'add' | 'edit'>('edit');

  const modalTitle = useMemo(() => {
    return modalType === 'add'
      ? t('config_page.server_setting.add_access_gateway')
      : t('config_page.server_setting.edit_access_gateway');
  }, [t, modalType]);

  useImperativeHandle(
    ref,
    () => ({
      openModal: (opt): Promise<ServerEditModalRespType> => {
        return new Promise<ServerEditModalRespType>((resolvePromise) => {
          const { initData, modalType = 'edit' } = opt || {};
          setVisible(true);
          setModalType(modalType);
          if (initData) {
            form.setFieldsValue(initData);
          }
          resolveRef.current = resolvePromise;
        });
      },
    }),
    [form],
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setVisible(false);
      resolveRef.current?.(values);
    } catch (error) {
      logger.debug('server edit form validation failed', error);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    resolveRef.current?.(null);
  };

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      centered
      maskClosable={false}
      keyboard={false}
      okText={t('config_page.server_setting.save')}
      cancelText={t('config_page.cancel')}
      className={styles.serverEditModalWrapper}
    >
      <Form
        form={form}
        initialValues={{
          isPublic: false,
        }}
        colon={false}
        labelCol={{ span: 5 }}
      >
        <Form.Item
          name="name"
          label={`${t('config_page.server_setting.gateway_name')}`}
          rules={[
            {
              required: true,
              message: t('config_page.server_setting.gateway_name_placeholder'),
            },
            () => ({
              validator(_rule: any, value: any) {
                if (!value) {
                  return Promise.resolve();
                }
                if (!validateName(value)) {
                  return Promise.reject(t('config_page.server_setting.gateway_name_format_error'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input placeholder={t('config_page.server_setting.gateway_name_placeholder')} />
        </Form.Item>

        <Form.Item
          name="address"
          label={t('config_page.server_setting.gateway_address')}
          rules={[
            {
              required: true,
              message: t('config_page.server_setting.gateway_address_placeholder'),
            },
            () => ({
              validator(_rule: any, value: any) {
                if (!value) {
                  return Promise.resolve();
                }
                if (!validateAddress(value)) {
                  return Promise.reject(
                    t('config_page.server_setting.gateway_address_format_error'),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input placeholder={t('config_page.server_setting.gateway_address_placeholder')} />
        </Form.Item>

        <Form.Item
          name="isPublic"
          label={t('config_page.server_setting.public_network_agent')}
          valuePropName="checked"
          tooltip={t('config_page.server_setting.public_network_tooltip')}
        >
          <Switch size="small" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
