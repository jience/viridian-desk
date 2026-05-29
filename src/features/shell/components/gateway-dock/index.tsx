import { Select } from '@/shared/ui';
import type { DefaultOptionType } from '@/shared/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectAutoGateway,
  selectConnected,
  selectGatewayList,
  selectGatewayStatusChecking,
  selectNetwork,
  switchGateway,
} from '@/store/feature/gateway';
import { cn } from '@/shared/ui/lib/cn';
import './index.scss';

interface LoginGatewayDockProps {
  readonly?: boolean;
}

export function LoginGatewayDock({ readonly = false }: LoginGatewayDockProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const autoGateway = useAppSelector(selectAutoGateway);
  const gatewayList = useAppSelector(selectGatewayList);
  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const checking = useAppSelector(selectGatewayStatusChecking);

  const tone = (() => {
    if (!autoGateway) return 'info';
    return checking ? 'checking' : connected && network ? 'success' : 'danger';
  })();
  const statusText = !autoGateway
    ? t('login_page.please_select_gateway')
    : checking
      ? t('login_page.gateway_status_checking')
      : !network
      ? t('login_page.local_network_not_connected')
      : !connected
        ? t('login_page.server_connection_failed')
        : t('login_page.server_connection_normal');
  const gatewayName = autoGateway?.name || autoGateway?.address || statusText;

  const options = useMemo(() => {
    return gatewayList.map<DefaultOptionType>((gateway) => ({
      label: gateway?.name || gateway?.address,
      value: gateway?.uuid,
    }));
  }, [gatewayList]);

  const handleChangeGateway = async (uuid: string) => {
    await dispatch(switchGateway(uuid));
  };

  return (
    <div
      className={cn(
        'login-gateway-dock',
        `login-gateway-dock--${tone}`,
        readonly && 'login-gateway-dock--readonly',
      )}
      title={statusText}
      aria-label={`${gatewayName} ${t('login_page.tls_protected')}`}
    >
      <span className="login-gateway-dock__signal" />
      <div className="login-gateway-dock__copy">
        <strong title={gatewayName}>{gatewayName}</strong>
        <span>{t('login_page.tls_protected')}</span>
      </div>
      {!readonly && (
        <Select
          placement="topRight"
          variant="borderless"
          value={autoGateway?.uuid}
          onChange={handleChangeGateway}
          placeholder={t('login_page.please_select_gateway')}
          suffixIcon={null}
          size="small"
          className="login-gateway-dock__select"
          classNames={{ root: 'login-gateway-dock__select' }}
          options={options}
        />
      )}
    </div>
  );
}
