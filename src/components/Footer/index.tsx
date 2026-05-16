import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Tooltip, Modal } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import './index.scss';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { selectDeveloperMode, selectIntegration } from '@/store/feature/config';
import { selectMsgDot, setMsgDot, setMsgModalShow } from '@/store/feature/app';
import { useTranslation } from 'react-i18next';
import { GatewaySelect } from '../GatewaySelect';
import { bridge } from '@/native';
import { cn } from '@/ui/lib/cn';

interface FooterAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  hidden?: boolean;
  tone?: 'danger';
}

const Footer: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();

  const dispatch = useAppDispatch();

  const isThin = useAppSelector(selectIsThin);

  const developerMode = useAppSelector(selectDeveloperMode);

  const isIntegratedMode = useAppSelector(selectIntegration);
  const msgDot = useAppSelector(selectMsgDot);

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
        key: 'setting',
        label: t('login_page.setting'),
        icon: <i className="iconfont icon-setting" />,
        onClick: () => {
          void navigate('/configPage/serverSetting');
        },
      },
      {
        key: 'network',
        label: t('login_page.network'),
        icon: <i className="iconfont icon-net" />,
        onClick: () => {
          void invoke('open_network_settings');
        },
        hidden: !isIntegratedMode,
      },
      {
        key: 'msg',
        label: t('login_page.message_announcement'),
        icon: <i className="iconfont icon-message" />,
        onClick: () => {
          dispatch(setMsgDot(false));
          dispatch(
            setMsgModalShow({
              msgModalShow: true,
              msgId: '',
            }),
          );
        },
      },
      {
        key: 'question',
        label: t('login_page.help_document'),
        icon: <i className="iconfont icon-c_question-s" />,
        onClick: () => {
          void invoke('open_docs');
        },
      },
      {
        key: 'shutdown',
        label: t('login_page.shutdown'),
        icon: <i className="iconfont icon-power-off-filled" />,
        onClick: () => {
          void shutdown();
        },
        hidden: !isIntegratedMode && !isThin,
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
              <Tooltip key={action.key} placement="top" title={action.label} arrow={false}>
                <button
                  type="button"
                  aria-label={action.label}
                  className={cn(
                    'login-footer__action',
                    action.key === 'msg' && msgDot && 'login-footer__action--unread',
                    action.tone === 'danger' && 'login-footer__action--danger',
                  )}
                  onClick={action.onClick}
                >
                  {action.icon}
                </button>
              </Tooltip>
            );
          })}
          {developerMode && (
            <div className="login-footer__developer" role="status">
              <i className="iconfont icon-ConfigMap" />
              <span>{t('login_page.developer_mode_enabled')}</span>
            </div>
          )}
        </div>
        <div className="login-footer__gateway">
          <GatewaySelect />
        </div>
      </div>
      {contextHolder}
    </footer>
  );
};

export default Footer;
