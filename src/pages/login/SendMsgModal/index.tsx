import useSmsCountdown from '@/hooks/useSmsCountdown';
import { bridge } from '@/native';
import type { GetSmsCaptchaReq } from '@/native/interfaces/api';
import { Button, Form, Input, Modal } from 'antd';
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FC,
  type Ref,
} from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';

type FormValues = {
  title: string;
} & GetSmsCaptchaReq;

export interface SendMsgModalRef {
  show: (values: FormValues) => Promise<string>;
}

export interface SendMsgModalProps {
  ref?: Ref<SendMsgModalRef>;
}

export const SendMsgModal: FC<SendMsgModalProps> = (props) => {
  const { ref } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);

  const { countdown, isCounting, start } = useSmsCountdown();

  const formRules = useMemo(() => {
    return {
      verifyCode: [
        {
          required: true,
          message: t('login_page.sms_modal.error_required'),
        },
        {
          pattern: /^\d{6}$/,
          message: t('login_page.sms_modal.error_pattern'),
        },
      ],
    };
  }, [t]);

  const valuesRef = useRef<FormValues | null>(null);
  const promiseHandlesRef = useRef<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    show: (values) => {
      if (!values.loginName || !values.password || !values.authType) {
        return Promise.reject('Missing required parameters.');
      }
      setVisible(true);
      valuesRef.current = values;
      return new Promise<string>((resolve, reject) => {
        promiseHandlesRef.current = { resolve, reject };
      });
    },
  }));

  const handleCancel = () => {
    setVisible(false);
    promiseHandlesRef.current?.reject(); // 用户取消，reject Promise
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    promiseHandlesRef.current?.resolve(values.verifyCode); // 用户确认，resolve Promise 并传递动态密码
    setVisible(false);
  };

  const afterClose = () => {
    form.resetFields();
  };

  const send = async () => {
    if (!valuesRef.current) return;

    const { loginName, password, domainServerName, ou, corpId, nisId, authType } =
      valuesRef.current;

    if (!loginName || !password || !authType) {
      return;
    }

    const params: GetSmsCaptchaReq = {
      loginName,
      password,
      authType,
    };
    if (authType === 'DomainAuth') {
      params.domainServerName = domainServerName;
      params.ou = ou;
    } else if (authType === 'CorpAuth') {
      params.corpId = corpId;
    } else if (authType === 'NisAuth') {
      params.nisId = nisId;
    }

    await bridge.api.getSmsCaptcha(params);
    start();
  };

  useEffect(() => {
    // 清空表单
    if (visible) {
      form.resetFields();
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      keyboard={true}
      className="send-msg-modal-wrapper"
      onCancel={handleCancel}
      okText={t('login_page.sms_modal.ok')}
      onOk={handleSubmit}
      afterClose={afterClose}
      title={valuesRef.current?.title}
      centered={true}
    >
      <Form layout="vertical" form={form} className="send-msg-form">
        <p className="send-title"></p>
        <div style={{ display: 'flex' }}>
          <Form.Item
            name="verifyCode"
            className="send-msg-form-item"
            rules={formRules['verifyCode']}
            style={{ flex: 1 }}
          >
            <Input placeholder={t('login_page.sms_modal.placeholder')} />
          </Form.Item>
          <Button loading={isCounting} onClick={() => send()}>
            {isCounting
              ? t('login_page.sms_modal.resend', { countdown })
              : t('login_page.sms_modal.get_code')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
