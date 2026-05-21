import { useAppSelector } from '@/store';
import { selectAutoGateway, selectConnected, selectNetwork } from '@/store/feature/gateway';
import { useUiTheme } from '@/ui/theme/use-ui-theme';
import { useMessageFormatter } from '@/utils/message-format';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import brandLogoDark from '@/assets/images/viridian_logo_with_text_dark.svg';
import brandLogoLight from '@/assets/images/viridian_logo_with_text_light.svg';

const LoginBrandPanelComponent = () => {
  const { formatMessage } = useMessageFormatter();
  const { t } = useTranslation('common');
  const { resolvedTheme } = useUiTheme();

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const autoGateway = useAppSelector(selectAutoGateway);
  const brandLogo = resolvedTheme === 'dark' ? brandLogoDark : brandLogoLight;

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
          <img
            src={brandLogo}
            className="auth-page__brand-logo"
            alt={t('appName')}
            onDragStart={(event) => event.preventDefault()}
          />
        </div>
      </header>

      <div className="auth-page__hero">
        <h1>
          <span>{formatMessage({ id: 'LoginHeroTitle', defaultMessage: '安全连接，' })}</span>
          <span className="auth-page__hero-title-accent">
            {formatMessage({ id: 'LoginSubTitle', defaultMessage: '高效访问工作空间' })}
          </span>
        </h1>
        <div className="auth-page__hero-rule" aria-hidden="true" />

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
