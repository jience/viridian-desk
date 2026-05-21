import loginLogo from '@/assets/images/logo.svg';
import { useAppSelector } from '@/store';
import { selectAutoGateway, selectConnected, selectNetwork } from '@/store/feature/gateway';
import { useMessageFormatter } from '@/utils/message-format';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const LoginBrandPanelComponent = () => {
  const { formatMessage } = useMessageFormatter();
  const { t } = useTranslation('common');

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const autoGateway = useAppSelector(selectAutoGateway);

  const localLoginLabel = formatMessage({
    id: 'LocalAuthLogin',
    defaultMessage: '本地账号',
  });
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

  return (
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
  );
};

export const LoginBrandPanel = memo(LoginBrandPanelComponent);
