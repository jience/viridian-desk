import loginLogo from '@/assets/images/logo.svg';
import ControlWindow from '@/components/ControlWindow';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store';
import { selectAutoGateway, selectConnected, selectNetwork } from '@/store/feature/gateway';
import '@/styles/design-system.css';
import { Button } from '@/ui/components/button';
import { Form } from '@/ui';
import { DocumentTitle } from '@/ui/shell/document-title';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessageFormatter } from '@/utils/message-format';
import { LoginGatewayDock } from '@/components/LoginGatewayDock';
import { useLoginHandler } from './hooks/useLoginHandler';
import { UsernamePwd } from './UsernamePwd';
import type { LoginFormType } from './types';
import './LoginPage.scss';

export default function LoginPage() {
  const { formatMessage } = useMessageFormatter();
  const { t } = useTranslation('common');
  const [form] = Form.useForm<LoginFormType>();

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const autoGateway = useAppSelector(selectAutoGateway);

  const { userLogin, loginLoading, submitLockRef } = useLoginHandler();
  const localLoginLabel = formatMessage({
    id: 'LocalAuthLogin',
    defaultMessage: '本地账号',
  });

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

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || loginLoading || submitLockRef.current) return;

    submitLockRef.current = true;
    try {
      const values = await form.validateFields();
      await userLogin(values);
    } finally {
      submitLockRef.current = false;
    }
  }, [canSubmit, form, loginLoading, submitLockRef, userLogin]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const isDialogInput = target?.closest('.vdui-modal-root, .vdui-drawer, [role="dialog"]');

      if (event.defaultPrevented || event.isComposing || isDialogInput) return;

      event.preventDefault();
      handleSubmit();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="auth-page">
      <DocumentTitle title={formatMessage({ id: 'LOGIN' })} />
      <div className="auth-page__drag-region" data-tauri-drag-region />
      <div className="auth-page__controls">
        <ControlWindow />
      </div>
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
                <span className="auth-page__status-label">
                  <i className="iconfont icon-hosts" aria-hidden="true" />
                  {formatMessage({ id: 'GATEWAY', defaultMessage: '服务器' })}
                </span>
                <strong>{gatewayStatusLabel}</strong>
                <small>
                  {autoGateway?.name ||
                    autoGateway?.address ||
                    formatMessage({ id: 'NoData', defaultMessage: '暂无数据' })}
                </small>
              </div>
              <div className="auth-page__status-card">
                <span className="auth-page__status-label">
                  <i className="iconfont icon-net" aria-hidden="true" />
                  {formatMessage({ id: 'Network', defaultMessage: '网络' })}
                </span>
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
                <span className="auth-page__status-label">
                  <i className="iconfont icon-key" aria-hidden="true" />
                  {formatMessage({ id: 'LoginWay', defaultMessage: '登录方式' })}
                </span>
                <strong>1</strong>
                <small>{localLoginLabel}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-page__auth-zone" aria-label={formatMessage({ id: 'LOGIN' })}>
          <div className="auth-page__card">
            <div className="auth-page__card-heading">
              <div>
                <h2>{formatMessage({ id: 'LOGIN' })}</h2>
                <p>{localLoginLabel}</p>
              </div>
            </div>

            <div className="vd-auth-stack">
              <Form form={form} layout="vertical" className="vd-auth-form" requiredMark={false}>
                <UsernamePwd formIns={form} />
              </Form>

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
            </div>
          </div>
        </section>
      </section>
      <div className="auth-page__footer-bar">
        <Footer rightSlot={<LoginGatewayDock />} />
      </div>
    </div>
  );
}
