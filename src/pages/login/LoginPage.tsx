import loginLogo from '@/assets/images/logo.svg';
import Footer from '@/components/Footer';
import { LoginAuthType } from '@/native/interfaces/login_auth';
import { useAppSelector } from '@/store';
import { selectCurrentLoginType } from '@/store/feature/app';
import { selectLoginTypes, selectSmsResetPasswordSwitch } from '@/store/feature/client';
import { selectAutoGateway, selectConnected, selectNetwork } from '@/store/feature/gateway';
import '@/styles/design-system.css';
import { Button } from '@/ui/components/button';
import { QrcodeOutlined } from '@/ui/icons';
import { Form } from '@/ui';
import { DocumentTitle } from '@/ui/shell/document-title';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessageFormatter } from '@/utils/message-format';
import { LoginGatewayDock } from '@/components/LoginGatewayDock';
import LoginWayChange from './component/LoginWayChange';
import { useLoginHandler } from './hooks/useLoginHandler';
import { useLoginWayData } from './initData';
import { LoginFormItems } from './LoginFormItems';
import type { OrgScanLoginModalRef } from './OrgScanLoginModal';
import type { LoginFormType } from './types';
import './LoginPage.scss';

const FindPasswordModal = lazy(() => import('./component/FindPasswordModal'));
const OneTimePwdModal = lazy(() =>
  import('./OneTimePasswordModal').then((module) => ({ default: module.OneTimePwdModal })),
);
const OrgScanLoginModal = lazy(() =>
  import('./OrgScanLoginModal').then((module) => ({ default: module.OrgScanLoginModal })),
);
const SendMsgModal = lazy(() =>
  import('./SendMsgModal').then((module) => ({ default: module.SendMsgModal })),
);
const SliderVerifyModal = lazy(() =>
  import('./SliderVerifyModal').then((module) => ({ default: module.SliderVerifyModal })),
);

export default function LoginPage() {
  const { formatMessage } = useMessageFormatter();
  const { t } = useTranslation('common');
  const [form] = Form.useForm<LoginFormType>();

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const autoGateway = useAppSelector(selectAutoGateway);
  const loginTypes = useAppSelector(selectLoginTypes);
  const smsResetPasswordSwitch = useAppSelector(selectSmsResetPasswordSwitch);
  const currentLoginWay = useAppSelector(selectCurrentLoginType);

  const orgScanLoginModalRef = useRef<OrgScanLoginModalRef | null>(null);
  const orgScanLoginModalResolveRef = useRef<((modal: OrgScanLoginModalRef) => void) | null>(null);
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
    sliderVerifyModalMounted,
    sendMsgModalMounted,
    oneTimePwdModalMounted,
  } = useLoginHandler();

  const [canScan] = useState(false);
  const [threeChannel, setThreeChannel] = useState('');
  const [changeLoginWayVisible, setChangeLoginWayVisible] = useState(false);
  const [findPwdVisible, setFindPwdVisible] = useState(false);
  const [orgScanLoginModalMounted, setOrgScanLoginModalMounted] = useState(false);

  const canSubmit = connected && network;
  const gatewayStatusLabel = !autoGateway
    ? `${formatMessage({ id: 'PleaseSelect', defaultMessage: '请选择' })}${formatMessage({
        id: 'GATEWAY',
        defaultMessage: '服务器',
      })}`
    : !network
      ? formatMessage({ id: 'NetworkError', defaultMessage: '网络异常' })
      : connected
        ? formatMessage({ id: 'Connected', defaultMessage: '已连接' })
        : formatMessage({ id: 'Disconnected', defaultMessage: '未连接' });
  const gatewayStatusTone = connected && network ? 'success' : autoGateway ? 'danger' : 'info';
  const showLocalLinks = currentLoginWay === LoginAuthType.LOCAL;

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

  const setOrgScanLoginModalRef = useCallback((modal: OrgScanLoginModalRef | null) => {
    orgScanLoginModalRef.current = modal;
    if (modal && orgScanLoginModalResolveRef.current) {
      orgScanLoginModalResolveRef.current(modal);
      orgScanLoginModalResolveRef.current = null;
    }
  }, []);

  const waitForOrgScanLoginModal = useCallback(() => {
    if (orgScanLoginModalRef.current) return Promise.resolve(orgScanLoginModalRef.current);

    setOrgScanLoginModalMounted(true);
    return new Promise<OrgScanLoginModalRef>((resolve) => {
      orgScanLoginModalResolveRef.current = resolve;
    });
  }, []);

  const handleOrgScanLogin = useCallback(async () => {
    if (!canScan) return;
    const orgScanLoginModal = await waitForOrgScanLoginModal();
    orgScanLoginModal.show({
      corpId: form.getFieldValue('corpId'),
      threeChannel,
    });
  }, [canScan, form, threeChannel, waitForOrgScanLoginModal]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const isDialogInput = target?.closest('.vdui-modal-root, .vdui-drawer, [role="dialog"]');

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
      <DocumentTitle title={formatMessage({ id: 'LOGIN' })} />
      <section className="auth-page__window">
        <section className="auth-page__brand-zone" aria-label={t('appName')}>
          <header className="auth-page__brand-header">
            <div className="auth-page__brand-lockup" aria-label="viridian desk">
              <span className="auth-page__brand-mark" aria-hidden="true">
                <img
                  src={loginLogo}
                  className="auth-page__logo"
                  alt=""
                  onDragStart={(event) => event.preventDefault()}
                />
              </span>
              <span className="auth-page__brand-name">viridian desk</span>
            </div>
          </header>

          <div className="auth-page__hero">
            <div className="auth-page__eyebrow">
              <span className={`auth-page__pulse auth-page__pulse--${gatewayStatusTone}`} />
              {formatMessage({ id: 'Ready', defaultMessage: '安全桌面接入已就绪' })}
            </div>
            <h1>{formatMessage({ id: 'LoginHeroTitle', defaultMessage: '进入你的云端工作台' })}</h1>
            <p>
              {formatMessage({
                id: 'LoginSubTitle',
                defaultMessage:
                  '统一访问桌面、应用与审批资源。登录前即可确认网关、网络与终端状态，减少等待和错误感知。',
              })}
            </p>

            <div className="auth-page__status-grid">
              <div className="auth-page__status-card">
                <span>{formatMessage({ id: 'GATEWAY', defaultMessage: '服务器' })}</span>
                <strong>{gatewayStatusLabel}</strong>
                <small>
                  {autoGateway?.name ||
                    autoGateway?.address ||
                    formatMessage({ id: 'NoData', defaultMessage: '暂无数据' })}
                </small>
              </div>
              <div className="auth-page__status-card">
                <span>{formatMessage({ id: 'Network', defaultMessage: '网络' })}</span>
                <strong>
                  {network
                    ? formatMessage({ id: 'Normal', defaultMessage: '正常' })
                    : formatMessage({ id: 'Abnormal', defaultMessage: '异常' })}
                </strong>
                <small>
                  {connected
                    ? formatMessage({ id: 'TlsProtected', defaultMessage: 'TLS 已保护' })
                    : formatMessage({ id: 'Disconnected', defaultMessage: '未连接' })}
                </small>
              </div>
              <div className="auth-page__status-card">
                <span>{formatMessage({ id: 'LoginWay', defaultMessage: '登录方式' })}</span>
                <strong>{loginTypes?.length || 1}</strong>
                <small>{loginWayKv[currentLoginWay]}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-page__auth-zone" aria-label={formatMessage({ id: 'LOGIN' })}>
          <div className="auth-page__card">
            <div className="auth-page__card-heading">
              <div>
                <h2>{formatMessage({ id: 'LOGIN' })}</h2>
                <p>{loginWayKv[currentLoginWay]}</p>
              </div>
            </div>

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
                        {formatMessage({
                          id: !isLocalPhoneLogin ? 'loginByphone' : 'loginByUser',
                        })}
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
                </>
              )}
            </div>
          </div>
        </section>

        {findPwdVisible && (
          <Suspense fallback={null}>
            <FindPasswordModal visible={findPwdVisible} setVisible={setFindPwdVisible} />
          </Suspense>
        )}
        {sliderVerifyModalMounted && (
          <Suspense fallback={null}>
            <SliderVerifyModal ref={sliderVerifyModalRef} />
          </Suspense>
        )}
        {sendMsgModalMounted && (
          <Suspense fallback={null}>
            <SendMsgModal ref={sendMsgModalRef} />
          </Suspense>
        )}
        {oneTimePwdModalMounted && (
          <Suspense fallback={null}>
            <OneTimePwdModal ref={oneTimePwdModalRef} />
          </Suspense>
        )}
        {orgScanLoginModalMounted && (
          <Suspense fallback={null}>
            <OrgScanLoginModal ref={setOrgScanLoginModalRef} />
          </Suspense>
        )}
      </section>
      <div className="auth-page__footer-bar">
        <Footer rightSlot={<LoginGatewayDock />} />
      </div>
    </div>
  );
}
