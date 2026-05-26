import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Code2 } from 'lucide-react';
import { useAppSelector } from '@/store';
import { selectDeveloperMode } from '@/store/feature/config';
import './index.scss';

const TOAST_DURATION_MS = 3200;

export const DeveloperModeOverlay = () => {
  const { t } = useTranslation();
  const developerMode = useAppSelector(selectDeveloperMode);
  const [toastVisible, setToastVisible] = useState(false);
  const announcedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!developerMode) {
      announcedRef.current = false;
      setToastVisible(false);
      return;
    }

    if (announcedRef.current) return;

    announcedRef.current = true;
    setToastVisible(true);
    timerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      timerRef.current = null;
    }, TOAST_DURATION_MS);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [developerMode]);

  if (!developerMode) return null;

  return (
    <div
      className="developer-mode-overlay"
      data-dev-mode-overlay
      aria-label={t('login_page.developer_mode_enabled')}
    >
      <div className="developer-mode-overlay__strip" aria-hidden="true" />
      <div className="developer-mode-overlay__badge" role="status" aria-live="polite">
        <Code2 aria-hidden="true" />
        <span className="developer-mode-overlay__badge-code">DEV</span>
        <span>{t('login_page.developer_mode_badge')}</span>
      </div>
      {toastVisible && (
        <div className="developer-mode-overlay__toast" role="status" aria-live="polite">
          <Code2 aria-hidden="true" />
          <div>
            <strong>{t('login_page.developer_mode_enabled')}</strong>
            <span>{t('login_page.developer_mode_toast_description')}</span>
          </div>
        </div>
      )}
      <div className="developer-mode-overlay__watermark" aria-hidden="true" />
    </div>
  );
};
