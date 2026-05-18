import { useEffect, useState } from 'react';
import Regex from '@/utils/regex.ts';
import { useAppSelector } from '@/store';
import { Button, Form, Input, Space, type FormInstance } from '@/ui';
import type { LoginFormType } from '../../types';
import { selectConnected } from '@/store/feature/gateway';
import useSmsCountdown from '@/hooks/useSmsCountdown';
import { selectLastLoginEntry } from '@/store/feature/app';
import { useTranslation } from 'react-i18next';
import { bridge } from '@/native';
import './index.scss';

export interface PhoneFormItemProps {
  formIns: FormInstance<LoginFormType>;
}

export const PhoneFormItem = (props: PhoneFormItemProps) => {
  const { formIns } = props;
  const { t } = useTranslation();
  const { isCounting, countdown, start } = useSmsCountdown();

  const connected = useAppSelector(selectConnected);
  const lastLoginInfo = useAppSelector(selectLastLoginEntry);

  const [getTerminalAuthCodeLoading, setGetTerminalAuthCodeLoading] = useState(false);

  const send = async () => {
    if (isCounting || !formIns || countdown != 0) return;
    const { phone } = await formIns.validateFields(['phone']);
    if (!phone) return;

    setGetTerminalAuthCodeLoading(true);
    await bridge.api.getTerminalAuthCode({ phone, authType: 'LocalAuth' }).finally(() => {
      setGetTerminalAuthCodeLoading(false);
    });
    start();
  };

  useEffect(() => {
    if (!formIns) return;
    const { telephone } = lastLoginInfo || {};
    formIns?.resetFields(['smsCaptcha']);
    if (telephone) formIns.setFieldValue('phone', telephone);
  }, [formIns]);

  return (
    <>
      <Form.Item
        className="basic-form-item"
        name="phone"
        rules={[
          {
            required: true,
            message: t('login_page.phone_required'),
          },
          {
            pattern: Regex.isMobile,
            message: t('login_page.phone_pattern_error'),
          },
        ]}
      >
        <Input
          prefix={<i className="iconfont icon-icon_phone" />}
          placeholder={t('login_page.phone_placeholder')}
        />
      </Form.Item>
      <Space className="phone-form-sms-row">
        <Form.Item
          name="smsCaptcha"
          rules={[
            {
              required: true,
              message: t('login_page.sms_captcha_required'),
            },
            {
              pattern: /^\d{6}$/,
              message: t('login_page.sms_captcha_pattern_error'),
            },
          ]}
          className="phone-form-sms-item"
        >
          <Input placeholder={t('login_page.sms_captcha_placeholder')} />
        </Form.Item>
        <Button
          disabled={isCounting || !connected}
          loading={getTerminalAuthCodeLoading}
          onClick={send}
        >
          {isCounting ? t('login_page.sms_resend', { countdown }) : t('login_page.get_sms_captcha')}
        </Button>
      </Space>
    </>
  );
};
