import { bridge } from '@/native';
import type { GetDynamicPwdQrCodeReq } from '@/native/interfaces/api';
import { Alert, Button, Input, Modal, QRCode } from 'antd';
import { useImperativeHandle, useRef, useState, type FC, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';

export interface OneTimePwdModalRef {
  show: (values: GetDynamicPwdQrCodeReq) => Promise<string>;
}

export interface OneTimePwdModalProps {
  ref?: Ref<OneTimePwdModalRef>;
}

export const OneTimePwdModal: FC<OneTimePwdModalProps> = (props) => {
  const { ref } = props;
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [dynamicPwd, setDynamicPwd] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);

  const valuesRef = useRef<GetDynamicPwdQrCodeReq | null>(null);
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
      // 存储调用 getDynamicQRcode 所需的数据
      valuesRef.current = values;
      // 为了保持原有逻辑，我们让用户点击按钮获取
      return new Promise<string>((resolve, reject) => {
        promiseHandlesRef.current = { resolve, reject };
      });
    },
  }));

  const getDynamicQRcode = async () => {
    const { loginName, password, domainServerName, ou, authType } = valuesRef.current || {};

    if (!loginName || !password || !authType) {
      return;
    }

    const param: GetDynamicPwdQrCodeReq = {
      loginName: loginName,
      authType: authType,
      password: password,
    };

    if (authType === 'DomainAuth') {
      param.ou = ou;
      param.domainServerName = domainServerName;
    }

    const { data } = await bridge.api.getDynamicPwdQrCode(param);
    setQrValue(data.data.qrCodeContent);
    setShowQrCode(true);
  };

  const handleCancel = () => {
    setVisible(false);
    promiseHandlesRef.current?.reject('User actively cancels the one-time password input'); // 用户取消，reject Promise
  };

  const handleSubmit = () => {
    promiseHandlesRef.current?.resolve(dynamicPwd); // 用户确认，resolve Promise 并传递动态密码
    setVisible(false);
  };

  // 重置内部状态
  const afterClose = () => {
    setQrValue('');
    setDynamicPwd('');
    setShowQrCode(false);
    promiseHandlesRef.current = null;
  };

  const renderInfoTip = () => {
    if (showQrCode) {
      return (
        <div>
          <span className="click-tip-btn" onClick={() => goBack()}>
            {t('login_page.otp.back')}
          </span>
          {t('login_page.otp.fill_tip')}
        </div>
      );
    }
    return (
      <div>
        {t('login_page.otp.open_app_prefix')}&nbsp;
        <span className="click-tip-btn" onClick={() => getDynamicQRcode()}>
          {t('login_page.otp.scan_btn')}
        </span>
        &nbsp;{t('login_page.otp.open_app_suffix')}
      </div>
    );
  };

  const goBack = () => {
    setShowQrCode(false);
    setQrValue('');
  };

  const renderFooter = () => {
    return (
      <>
        <Button onClick={handleCancel}>{t('login_page.otp.cancel')}</Button>
        {!showQrCode && (
          <Button type="primary" onClick={handleSubmit} disabled={!dynamicPwd}>
            {t('login_page.otp.confirm')}
          </Button>
        )}
      </>
    );
  };

  return (
    <Modal
      open={visible}
      keyboard={true}
      onCancel={handleCancel}
      className="one-time-modal"
      getContainer={() => document.getElementById('appLayout')!}
      afterClose={afterClose}
      title={t('login_page.otp.title')}
      centered={true}
      footer={renderFooter()}
    >
      <Alert title={renderInfoTip()} type="info" closable={{ closeIcon: true }} />
      {showQrCode ? (
        <div className="qr-code">
          <QRCode value={qrValue} size={160} fgColor="#000000" />
        </div>
      ) : (
        <Input.Password
          placeholder={t('login_page.otp.placeholder')}
          value={dynamicPwd}
          onChange={(e) => setDynamicPwd(e?.target.value)}
        />
      )}
    </Modal>
  );
};
