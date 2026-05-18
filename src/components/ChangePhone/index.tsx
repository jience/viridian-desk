import { useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Button, Form, Input, Modal, message } from '@/ui';
import Regex from '@/utils/regex';
import { formatTel } from '@/utils/utils';
import './index.scss';
import { updateUserPhone } from '@/services/user';
import { getPhoneCode } from '@/services/public';
import useRequest from '@/hooks/useRequest';
import { useAppSelector } from '@/store';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';

const ChangePhone = (props: any) => {
  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);

  const intl = useIntl();
  const { formatMessage } = intl;
  const { visible = false, setVisible } = props;

  const [form] = Form.useForm();
  const phoneValue = Form.useWatch('phone', form);
  //  验证码发送按钮控制
  const [sent, setSent] = useState(false);
  const [number, setNumber] = useState(0);
  const timerID = useRef<any>(null);
  const formRules = {
    verifyCode: [
      {
        required: true,
        message: intl.formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: intl.formatMessage({ id: 'VERIFY_CODE' }) },
        ),
      },
    ],
  };

  const { run: getPhoneCodeRun } = useRequest(getPhoneCode, {
    manual: true,
    onSuccess: () => {
      if (number != 0) {
        return;
      } else {
        setNumber(60);
        setSent(true);
      }
    },
  });

  const { run: updateUserPhoneRun, loading: updateUserPhoneLoading } = useRequest(updateUserPhone, {
    manual: true,
    onSuccess: () => {
      message.success(
        intl.formatMessage({ id: 'ChangePhone' }) + intl.formatMessage({ id: 'SUCCESS' }),
      );
      setVisible(false);
    },
  });

  const send = () => {
    if (!Regex.isMobile.test(phoneValue || '') || !connected || !network || sent) return;
    if (sent) return;
    getPhoneCodeRun({
      phone: phoneValue,
    });
  };

  const submitChangePhone = () => {
    form.validateFields().then((res: any) => {
      const { verifyCode } = res;
      // 调用接口修改手机号
      updateUserPhoneRun({
        phone: phoneValue,
        smsCaptcha: verifyCode,
      });
    });
  };

  useEffect(() => {
    if (sent && number != 0) {
      timerID.current = setInterval(() => {
        setNumber((n) => {
          if (n == 1) {
            setSent(false);
            clearInterval(timerID.current);
            setNumber(0);
          }
          return n - 1;
        });
      }, 1000);
    }
    return () => {
      // 组件销毁时，清除定时器
      clearInterval(timerID.current);
    };
  }, [number, sent]);

  const cancelModal = () => {
    setVisible(false);
    form.resetFields();
  };
  const canSendCode = Regex.isMobile.test(phoneValue || '') && connected && network && !sent;

  return (
    <Modal
      open={visible}
      className="change-phone-modal"
      keyboard={false}
      onCancel={() => cancelModal()}
      okText={formatMessage({ id: 'SURE' })}
      onOk={() => submitChangePhone()}
      title={formatMessage({ id: 'ChangePhone' })}
      centered
      destroyOnHidden
      okButtonProps={{
        loading: updateUserPhoneLoading,
      }}
      cancelText={formatMessage({ id: 'Cancel' })}
    >
      <Form layout="vertical" form={form} className="change-phone-modal__form">
        <Form.Item
          name="phone"
          label={formatMessage({ id: 'UserPhone' })}
          rules={[
            {
              required: true,
              message: formatMessage(
                { id: 'FORM_ERROR_MSG' },
                { name: formatMessage({ id: 'UserPhone' }) },
              ),
            },
            {
              pattern: Regex.isMobile,
              message: formatMessage({ id: 'ValidPhoneError' }),
            },
          ]}
        >
          <Input placeholder={formatMessage({ id: 'ChangePhonePlaceHolder' })} />
        </Form.Item>
        <p className="change-phone-modal__hint">
          {formatMessage({ id: 'SendPhoneLable' }, { phone: formatTel(phoneValue) })}
        </p>
        <div className="change-phone-modal__code-row">
          <Form.Item
            name="verifyCode"
            className="change-phone-modal__code-item"
            rules={formRules['verifyCode']}
          >
            <Input
              placeholder={intl.formatMessage(
                { id: 'FORM_ERROR_MSG' },
                {
                  name: intl.formatMessage({
                    id: 'INPUT_TELEPHONE_VERIFY_CODE',
                  }),
                },
              )}
            />
          </Form.Item>
          <Button
            className="change-phone-modal__send"
            disabled={!canSendCode}
            type="default"
            onClick={send}
          >
            {sent
              ? `${number}s ${formatMessage({ id: 'RetryGetCode' })}`
              : formatMessage({ id: 'GetVerificationCode' })}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePhone;
