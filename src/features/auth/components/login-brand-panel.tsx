import { useUiTheme } from '@/shared/ui/theme/use-ui-theme';
import { useMessageFormatter } from '@/utils/message-format';
import { Bot, Monitor, ShieldCheck } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import brandLogoDark from '@/assets/images/viridian_logo_with_text_dark.svg';
import brandLogoLight from '@/assets/images/viridian_logo_with_text_light.svg';

const LOGIN_FEATURE_CARDS = [
  {
    Icon: ShieldCheck,
    title: 'LoginFeatureSecureTitle',
    titleDefault: '安全接入',
    description: 'LoginFeatureSecureDescription',
    descriptionDefault: '可信网关加密访问',
    tag: 'LoginFeatureSecureTag',
    tagDefault: 'TLS 保护',
  },
  {
    Icon: Monitor,
    title: 'LoginFeatureWorkspaceTitle',
    titleDefault: '统一工作空间',
    description: 'LoginFeatureWorkspaceDescription',
    descriptionDefault: '桌面、应用统一入口',
    tag: 'LoginFeatureWorkspaceTag',
    tagDefault: '桌面 + 应用',
  },
  {
    Icon: Bot,
    title: 'LoginFeatureAssistantTitle',
    titleDefault: '智能辅助',
    description: 'LoginFeatureAssistantDescription',
    descriptionDefault: '助手诊断连接问题',
    tag: 'LoginFeatureAssistantTag',
    tagDefault: 'AI / 诊断',
  },
] as const;

const LoginBrandPanelComponent = () => {
  const { formatMessage } = useMessageFormatter();
  const { t } = useTranslation('common');
  const { resolvedTheme } = useUiTheme();

  const brandLogo = resolvedTheme === 'dark' ? brandLogoDark : brandLogoLight;

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
      </div>

      <div className="auth-page__status-grid">
        {LOGIN_FEATURE_CARDS.map((feature) => {
          return (
            <article className="auth-page__status-card auth-page__feature-card" key={feature.title}>
              <span className="auth-page__feature-icon" aria-hidden="true">
                <feature.Icon className="auth-page__feature-lucide" strokeWidth={2.1} />
              </span>
              <div className="auth-page__feature-copy">
                <strong>
                  {formatMessage({ id: feature.title, defaultMessage: feature.titleDefault })}
                </strong>
                <small>
                  {formatMessage({
                    id: feature.description,
                    defaultMessage: feature.descriptionDefault,
                  })}
                </small>
              </div>
              <span className="auth-page__feature-tag">
                {formatMessage({ id: feature.tag, defaultMessage: feature.tagDefault })}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const LoginBrandPanel = memo(LoginBrandPanelComponent);
