import { Button } from '@/ui/components/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import './EmptyPage.scss';

export function EmptyPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <section className="empty-page" aria-labelledby="empty-page-title">
      <div className="empty-page__mark" aria-hidden="true">
        <i className="iconfont icon-lock-o" />
      </div>
      <div className="empty-page__content">
        <p className="empty-page__eyebrow">{t('emptyPage.eyebrow')}</p>
        <h2 id="empty-page-title">{t('emptyPage.title')}</h2>
        <p>{t('emptyPage.description')}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate('/login', { replace: true })}
      >
        <i className="iconfont icon-left" aria-hidden="true" />
        {t('emptyPage.backToLogin')}
      </Button>
    </section>
  );
}
