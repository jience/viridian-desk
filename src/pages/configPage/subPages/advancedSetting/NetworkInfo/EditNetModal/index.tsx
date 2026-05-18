import './index.scss';
import { Modal, Form, Switch } from 'antd';
import { useImperativeHandle, useRef, useState, type FC, type Ref } from 'react';
import { IPv4Input } from './IPv4Input';
import { useTranslation } from 'react-i18next';

// 网络信息类型定义
export interface NetworkInfo {
  dhcpEnabled: boolean;
  address: string;
  gatewayIp: string;
  netmask: string;
}

// 指定弹窗返回值类型
export type EditNetModalRespType = NetworkInfo | null;
// 指定弹窗请求参数类型
export type EditNetModalReqType = NetworkInfo;

export type ResolveFunType = (value: EditNetModalRespType) => void;

export type EditNetModalRef = {
  openModal: (initData?: Partial<EditNetModalReqType>) => Promise<EditNetModalRespType>;
};

export interface EditNetModalProps {
  ref?: Ref<EditNetModalRef>;
}

export const EditNetModal: FC<EditNetModalProps> = ({ ref }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const resolveRef = useRef<ResolveFunType | null>(null);
  const [dhcpEnabled, setDhcpEnabled] = useState(false);
  const { t } = useTranslation();

  useImperativeHandle(
    ref,
    () => ({
      openModal: (initData?: Partial<EditNetModalReqType>): Promise<EditNetModalRespType> => {
        return new Promise<EditNetModalRespType>((resolvePromise) => {
          setVisible(true);
          resolveRef.current = resolvePromise;

          // 设置表单初始值
          if (initData) {
            form.setFieldsValue(initData);
            setDhcpEnabled(initData.dhcpEnabled || false);
          } else {
            form.resetFields();
            setDhcpEnabled(false);
          }
        });
      },
    }),
    [form],
  );

  const handleOk = async () => {
    const values = await form.validateFields();
    const result: NetworkInfo = {
      dhcpEnabled: values.dhcpEnabled || false,
      address: values.address || '',
      gatewayIp: values.gatewayIp || '',
      netmask: values.netmask || '',
    };

    setVisible(false);
    resolveRef.current?.(result);
  };

  const handleCancel = () => {
    setVisible(false);
    resolveRef.current?.(null);
  };

  // 处理DHCP开关变化
  const handleDhcpChange = (checked: boolean) => {
    setDhcpEnabled(checked);
    if (checked) {
      // DHCP启用时，清空IP相关字段
      form.setFieldsValue({
        address: '',
        gatewayIp: '',
        netmask: '',
      });
    }
  };

  return (
    <Modal
      title={t('config_page.advanced_setting.network_setting')}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      centered
      maskClosable={false}
      keyboard={false}
      className="edit-net-modal-wrapper"
    >
      <Form form={form} colon={false} labelCol={{ span: 5 }}>
        <Form.Item
          name="dhcpEnabled"
          label="DHCP"
          valuePropName="checked"
          rules={[
            { required: true, message: t('config_page.advanced_setting.dhcp_enabled_placeholder') },
          ]}
        >
          <Switch size="small" onChange={handleDhcpChange} />
        </Form.Item>

        <Form.Item
          name="address"
          label={t('config_page.advanced_setting.ip_address')}
          rules={[
            {
              required: !dhcpEnabled,
              message: t('config_page.advanced_setting.ip_address_placeholder'),
            },
            {
              validator: (_, value) => {
                if (dhcpEnabled || !value) return Promise.resolve();
                const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
                const match = value.match(ipPattern);
                if (!match) {
                  return Promise.reject(
                    new Error(t('config_page.advanced_setting.ip_address_validation')),
                  );
                }
                const parts = [match[1], match[2], match[3], match[4]];
                const validParts = parts.every((part) => {
                  const num = parseInt(part, 10);
                  return num >= 0 && num <= 255;
                });
                if (!validParts) {
                  return Promise.reject(
                    new Error(t('config_page.advanced_setting.ip_address_segment_validation')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <IPv4Input disabled={dhcpEnabled} placeholder="0-255.0-255.0-255.0-255" />
        </Form.Item>

        <Form.Item
          name="gatewayIp"
          label={t('config_page.advanced_setting.gateway')}
          rules={[
            {
              required: !dhcpEnabled,
              message: t('config_page.advanced_setting.gateway_ip_placeholder'),
            },
            {
              validator: (_, value) => {
                if (dhcpEnabled || !value) return Promise.resolve();
                const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
                const match = value.match(ipPattern);
                if (!match) {
                  return Promise.reject(
                    new Error(t('config_page.advanced_setting.gateway_ip_validation')),
                  );
                }
                const parts = [match[1], match[2], match[3], match[4]];
                const validParts = parts.every((part, index) => {
                  const num = parseInt(part, 10);
                  if (index === 3) {
                    return num >= 1 && num <= 254; // 最后一段不能是0或255
                  }
                  return num >= 0 && num <= 255;
                });
                if (!validParts) {
                  return Promise.reject(
                    new Error(t('config_page.advanced_setting.gateway_ip_format_error')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <IPv4Input disabled={dhcpEnabled} placeholder="0-255.0-255.0-255.1-254" />
        </Form.Item>

        <Form.Item
          name="netmask"
          label={t('config_page.advanced_setting.subnet_mask')}
          rules={[
            {
              required: !dhcpEnabled,
              message: t('config_page.advanced_setting.subnet_mask_placeholder'),
            },
            {
              validator: (_, value) => {
                if (dhcpEnabled || !value) return Promise.resolve();
                const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
                const match = value.match(ipPattern);
                if (!match) {
                  return Promise.reject(
                    new Error(t('config_page.advanced_setting.subnet_mask_validation')),
                  );
                }
                const parts = [match[1], match[2], match[3], match[4]];
                const validParts = parts.every((part) => {
                  const num = parseInt(part, 10);
                  return num >= 0 && num <= 255;
                });
                if (!validParts) {
                  return Promise.reject(
                    new Error(t('config_page.advanced_setting.subnet_mask_segment_validation')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <IPv4Input disabled={dhcpEnabled} placeholder="0-255.0-255.0-255.0-255" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
