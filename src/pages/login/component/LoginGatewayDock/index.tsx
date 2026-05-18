import { CaretDownOutlined } from '@ant-design/icons';
import { Select, Tooltip } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectAutoGateway,
  selectConnected,
  selectGatewayList,
  selectNetwork,
  switchGateway,
} from '@/store/feature/gateway';
import { cn } from '@/ui/lib/cn';

export function LoginGatewayDock() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const autoGateway = useAppSelector(selectAutoGateway);
  const gatewayList = useAppSelector(selectGatewayList);
  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);

  const tone = !autoGateway ? 'info' : connected && network ? 'success' : 'danger';
  const statusText = !autoGateway
    ? t('login_page.please_select_gateway')
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
    <div className={cn('login-gateway-dock', `login-gateway-dock--${tone}`)}>
      <Tooltip placement="top" title={statusText} arrow={false}>
        <span className="login-gateway-dock__signal" />
      </Tooltip>
      <div className="login-gateway-dock__copy">
        <strong title={gatewayName}>{gatewayName}</strong>
        <span>{statusText}</span>
      </div>
      <Select
        placement="topRight"
        variant="borderless"
        value={autoGateway?.uuid}
        onChange={handleChangeGateway}
        placeholder={t('login_page.please_select_gateway')}
        suffixIcon={<CaretDownOutlined />}
        size="small"
        classNames={{ root: 'login-gateway-dock__select' }}
        options={options}
      />
    </div>
  );
}
