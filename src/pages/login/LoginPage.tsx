import logoBlue from '@/assets/images/logoBlue1.png';
import Footer from '@/components/Footer';
import { LoginAuthType } from '@/native/interfaces/login_history';
import { useAppSelector } from '@/store';
import { selectCurrentLoginType } from '@/store/feature/app';
import {
  selectLoginTypes,
  selectSmsResetPasswordSwitch,
  selectTerminalRememberPasswordSwitch,
} from '@/store/feature/client';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';
import '@/styles/design-system.css';
import { Button } from '@/ui/components/button';
import { LoginShell } from '@/ui/shell/login-shell';
import { QrcodeOutlined } from '@ant-design/icons';
import { Checkbox, Form } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import FindPasswordModal from './component/FindPasswordModal';
import LoginWayChange from './component/LoginWayChange';
import { useLoginHandler } from './hooks/useLoginHandler';
import { useLoginWayData } from './initData';
import { LoginFormItems } from './LoginFormItems';
import { OneTimePwdModal } from './OneTimePasswordModal';
import { OrgScanLoginModal, type OrgScanLoginModalRef } from './OrgScanLoginModal';
import { SendMsgModal } from './SendMsgModal';
import { SliderVerifyModal } from './SliderVerifyModal';
import type { LoginFormType } from './types';
import './LoginPage.scss';

export default function LoginPage() {
  const { formatMessage } = useIntl();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginFormType>();

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const terminalRememberPasswordSwitch = useAppSelector(selectTerminalRememberPasswordSwitch);
  const loginTypes = useAppSelector(selectLoginTypes);
  const smsResetPasswordSwitch = useAppSelector(selectSmsResetPasswordSwitch);
  const currentLoginWay = useAppSelector(selectCurrentLoginType);

  const orgScanLoginModalRef = useRef<OrgScanLoginModalRef>(null);
  const submitLockRef = useRef(false);
  const { loginWayKv } = useLoginWayData();
  const {
    userLogin,
    loginLoading,
    isLocalPhoneLogin,
    setIsLocalPhoneLogin,
    sliderVerifyModalRef,
    sendMsgModalRef,
    oneTimePwdModalRef,
    autoLoginChecked,
    setAutoLoginChecked,
    rememberMeChecked,
    setRememberMeChecked,
  } = useLoginHandler();

  const [canScan] = useState(false);
  const [threeChannel, setThreeChannel] = useState('');
  const [changeLoginWayVisible, setChangeLoginWayVisible] = useState(false);
  const [findPwdVisible, setFindPwdVisible] = useState(false);

  const canSubmit = connected && network;
  const showLocalLinks = currentLoginWay === LoginAuthType.LOCAL;
  const showRememberControls =
    (!isLocalPhoneLogin || currentLoginWay !== LoginAuthType.LOCAL) &&
    terminalRememberPasswordSwitch;
  const showAutoLogin =
    (!isLocalPhoneLogin || currentLoginWay !== LoginAuthType.LOCAL) &&
    currentLoginWay !== LoginAuthType.IAM;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || loginLoading || submitLockRef.current) return;

    submitLockRef.current = true;
    try {
      const values = await form.validateFields();
      await userLogin(values);
    } finally {
      submitLockRef.current = false;
    }
  }, [canSubmit, form, loginLoading, userLogin]);

  const handleOrgScanLogin = () => {
    if (!canScan) return;
    orgScanLoginModalRef.current?.show({
      corpId: form.getFieldValue('corpId'),
      threeChannel,
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const isDialogInput = target?.closest('.ant-modal, .ant-drawer, [role="dialog"]');

      if (event.key === 'Enter') {
        if (event.defaultPrevented || event.isComposing || isDialogInput) return;

        event.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="auth-page">
      <LoginShell
        header={
          <div className="auth-page__header">
            <img
              src={logoBlue}
              className="auth-page__logo"
              alt={t('appName')}
              onDragStart={(event) => event.preventDefault()}
            />
            <button
              className="auth-page__settings vd-auth-link"
              type="button"
              onClick={() => navigate('/configPage/serverSetting')}
            >
              <i className="iconfont icon-setting" />
              {formatMessage({ id: 'COMMONSETUP' })}
            </button>
          </div>
        }
        footer={<Footer />}
      >
        <div className="vd-auth-card auth-page__card">
          <div className="vd-auth-stack">
            {changeLoginWayVisible ? (
              <LoginWayChange onChange={() => setChangeLoginWayVisible(false)} />
            ) : (
              <>
                <div className="vd-auth-row auth-page__login-way-row">
                  <button
                    className="vd-auth-login-way"
                    type="button"
                    onClick={() => {
                      if (loginTypes && loginTypes.length > 1) {
                        setChangeLoginWayVisible(true);
                      }
                    }}
                  >
                    {loginTypes && loginTypes.length > 1 && (
                      <span className="auth-page__login-way-icons">
                        <i className="iconfont icon-left" />
                        <i className="iconfont icon-minus" />
                      </span>
                    )}
                    {loginWayKv[currentLoginWay]}
                  </button>

                  {currentLoginWay === LoginAuthType.CORP && (
                    <button
                      aria-label={loginWayKv[currentLoginWay]}
                      className="auth-page__qr"
                      disabled={!canScan}
                      type="button"
                      onClick={handleOrgScanLogin}
                    >
                      <QrcodeOutlined />
                    </button>
                  )}
                </div>

                <Form form={form} layout="vertical" className="vd-auth-form" requiredMark={false}>
                  <LoginFormItems
                    formIns={form}
                    isLocalPhoneLogin={isLocalPhoneLogin}
                    setThreeChannel={setThreeChannel}
                  />
                </Form>

                {showLocalLinks ? (
                  <div className="vd-auth-row auth-page__links">
                    <button
                      className="vd-auth-link"
                      type="button"
                      onClick={() => setIsLocalPhoneLogin(!isLocalPhoneLogin)}
                    >
                      <i className="iconfont icon-icon_phone" />
                      {formatMessage({ id: !isLocalPhoneLogin ? 'loginByphone' : 'loginByUser' })}
                    </button>
                    {smsResetPasswordSwitch === 'Enabled' && (
                      <button
                        className="vd-auth-link"
                        disabled={!canSubmit}
                        type="button"
                        onClick={() => {
                          if (canSubmit) {
                            setFindPwdVisible(true);
                          }
                        }}
                      >
                        {formatMessage({ id: 'ForgetPassword' })}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="auth-page__links-placeholder" />
                )}

                <Button
                  aria-busy={loginLoading}
                  className="auth-page__submit"
                  disabled={!canSubmit || loginLoading}
                  onClick={handleSubmit}
                  size="lg"
                >
                  {loginLoading && <span className="auth-page__submit-spinner" />}
                  {formatMessage({ id: loginLoading ? 'LOGING' : 'LOGIN' })}
                </Button>

                <div className="vd-auth-checkboxes">
                  {showRememberControls ? (
                    <Checkbox
                      checked={rememberMeChecked}
                      onChange={(event) => setRememberMeChecked(!!event.target.checked)}
                    >
                      {formatMessage({ id: 'REMEMBER_PASSWORD' })}
                    </Checkbox>
                  ) : (
                    <span />
                  )}
                  {showAutoLogin ? (
                    <Checkbox
                      checked={autoLoginChecked}
                      onChange={(event) => setAutoLoginChecked(!!event.target.checked)}
                    >
                      {formatMessage({ id: 'AUTOLOGIN' })}
                    </Checkbox>
                  ) : (
                    <span />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <FindPasswordModal visible={findPwdVisible} setVisible={setFindPwdVisible} />
        <SliderVerifyModal ref={sliderVerifyModalRef} />
        <SendMsgModal ref={sendMsgModalRef} />
        <OneTimePwdModal ref={oneTimePwdModalRef} />
        <OrgScanLoginModal ref={orgScanLoginModalRef} />
      </LoginShell>
    </div>
  );
}
