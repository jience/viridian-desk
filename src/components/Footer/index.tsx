import { useMemo, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Tooltip, Modal, Select } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { CaretDownOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import './index.scss';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { selectDeveloperMode, selectIntegration } from '@/store/feature/config';
import { selectMsgDot, setMsgDot, setMsgModalShow } from '@/store/feature/app';
import { useTranslation } from 'react-i18next';
import { bridge } from '@/native';
import { cn } from '@/ui/lib/cn';
import {
  selectAutoGateway,
  selectConnected,
  selectGatewayList,
  selectNetwork,
  switchGateway,
} from '@/store/feature/gateway';

interface FooterAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  hidden?: boolean;
  tone?: 'danger';
}

interface FooterProps {
  hiddenActionKeys?: string[];
}

const Footer: FC<FooterProps> = ({ hiddenActionKeys = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();

  const dispatch = useAppDispatch();

  const isThin = useAppSelector(selectIsThin);

  const developerMode = useAppSelector(selectDeveloperMode);

  const isIntegratedMode = useAppSelector(selectIntegration);
  const msgDot = useAppSelector(selectMsgDot);
  const autoGateway = useAppSelector(selectAutoGateway);
  const gatewayList = useAppSelector(selectGatewayList);
  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);

  const gatewayTone = !autoGateway ? 'info' : connected && network ? 'success' : 'danger';

  const gatewayTip = !autoGateway
    ? t('login_page.please_select_gateway')
    : !network
      ? t('login_page.local_network_not_connected')
      : !connected
        ? t('login_page.server_connection_failed')
        : t('login_page.server_connection_normal');

  const gatewayOptions = useMemo(() => {
    return gatewayList.map<DefaultOptionType>((gateway) => ({
      label: gateway?.address
        ? `${gateway?.name || gateway.address} (${gateway.address})`
        : gateway?.name,
      value: gateway?.uuid,
    }));
  }, [gatewayList]);

  const handleChangeGateway = async (uuid: string) => {
    await dispatch(switchGateway(uuid));
  };

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
          void invoke('open_network_settings');
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
  ).filter((item) => !item.hidden && !hiddenActionKeys.includes(item.key));

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
          <div
            className={cn(
              'login-footer__gateway-dock',
              `login-footer__gateway-dock--${gatewayTone}`,
            )}
          >
            <Tooltip placement="top" title={gatewayTip} arrow={false}>
              <span className="login-footer__gateway-status" />
            </Tooltip>
            <div className="login-footer__gateway-copy">
              <span>{t('login_page.current_server')}</span>
              <strong>{gatewayTip}</strong>
            </div>
            <Select
              placement="topRight"
              variant="borderless"
              value={autoGateway?.uuid}
              onChange={handleChangeGateway}
              placeholder={t('login_page.please_select_gateway')}
              suffixIcon={<CaretDownOutlined />}
              size="small"
              classNames={{ root: 'login-footer__gateway-select' }}
              options={gatewayOptions}
            />
          </div>
        </div>
      </div>
      {contextHolder}
    </footer>
  );
};

export default Footer;
