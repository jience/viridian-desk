import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from '@/shared/ui';
import './index.scss';
import { useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { selectIntegration } from '@/store/feature/config';
import { useTranslation } from 'react-i18next';
import { bridge } from '@/native';
import { cn } from '@/shared/ui/lib/cn';

const isThinFromEnv = import.meta.env.TAURI_IS_THIN_CLIENT === 'true';

interface FooterAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  hidden?: boolean;
  tone?: 'danger';
}

interface FooterProps {
  rightSlot?: ReactNode;
}

const Footer: FC<FooterProps> = ({ rightSlot }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();

  const isThin = useAppSelector(selectIsThin);
  const resolvedIsThin = isThin ?? isThinFromEnv;

  const isIntegratedMode = useAppSelector(selectIntegration);

  const shutdown = async () => {
    const confirmed = await modal.confirm({
      title: t('common.warning'),
      content: t('common.warning_shutdown_msg'),
    });
    if (confirmed) {
      await bridge.cmd.shutdownLocalDevice();
    }
  };

  const actions = (
    [
      {
        key: 'network',
        label: t('login_page.network'),
        icon: <i className="iconfont icon-net" />,
        onClick: () => {
          void bridge.cmd.openNetworkSettings();
        },
        hidden: !isIntegratedMode,
      },
      {
        key: 'setting',
        label: t('login_page.setting'),
        icon: <i className="iconfont icon-setting" />,
        onClick: () => {
          void navigate('/configPage/serverSetting');
        },
      },
      {
        key: 'shutdown',
        label: t('login_page.shutdown'),
        icon: <i className="iconfont icon-power-off-filled" />,
        onClick: () => {
          void shutdown();
        },
        hidden: !isIntegratedMode && !resolvedIsThin,
        tone: 'danger',
      },
    ] satisfies FooterAction[]
  ).filter((item) => !item.hidden);

  return (
    <footer className="login-footer" aria-label={t('login_page.footer_controls')}>
      <div className="login-footer__inner">
        <div className="login-footer__actions">
          {actions.map((action) => {
            return (
              <button
                key={action.key}
                type="button"
                aria-label={action.label}
                className={cn(
                  'login-footer__action',
                  action.tone === 'danger' && 'login-footer__action--danger',
                )}
                onClick={action.onClick}
              >
                {action.icon}
              </button>
            );
          })}
        </div>
        {rightSlot && <div className="login-footer__side">{rightSlot}</div>}
      </div>
      {contextHolder}
    </footer>
  );
};

export default Footer;
