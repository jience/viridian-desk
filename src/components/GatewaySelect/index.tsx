import './index.scss';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectGatewayAddrShowSwitch } from '@/store/feature/client';
import {
  selectAutoGateway,
  selectConnected,
  selectGatewayList,
  selectNetwork,
  switchGateway,
} from '@/store/feature/gateway';
import { CaretDownOutlined } from '@/ui/icons';
import { Select, Tooltip } from '@/ui';
import type { DefaultOptionType } from '@/ui';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/ui/lib/cn';

export interface GatewaySelectProps {
  readonly?: boolean;
}

export const GatewaySelect: FC<GatewaySelectProps> = (props) => {
  const { readonly } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const autoGateway = useAppSelector(selectAutoGateway);
  const gatewayList = useAppSelector(selectGatewayList);
  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const gatewayAddrShowSwitch = useAppSelector(selectGatewayAddrShowSwitch);
  const showGatewayAddress = gatewayAddrShowSwitch === 'Enabled' && connected && network;

  const getNetworkTip = () => {
    if (!autoGateway) return t('login_page.please_select_gateway');
    if (!network) return t('login_page.local_network_not_connected');
    if (!connected) return t('login_page.server_connection_failed');
    return t('login_page.server_connection_normal');
  };

  const setGateway = async (id: string) => {
    await dispatch(switchGateway(id));
  };

  // 当前网关是否开启代理
  const getPublicNetChecked = () => {
    // window.ipcRenderer.send(gatewayAjax.GetPublic, '');
    // gatewayAjax.getPublicRes({
    //   success: (res: any) => {
    //     dispatch({ type: 'gateway/setPublicNet', publicNet: res.data });
    //   },
    // });
  };

  const handleChangeGateway = (uuid: string) => {
    setGateway(uuid);
    getPublicNetChecked();
  };

  // 获取当前网络状态
  const getNetworkClass = useMemo(() => {
    if (!autoGateway) return 'info';
    if (!network) return 'info';
    if (!connected) return 'danger';
    return 'success';
  }, [autoGateway, connected, network]);

  const options = useMemo(() => {
    return gatewayList.map<DefaultOptionType>((g) => ({
      label: `${g?.name} (${g?.address})`,
      value: g?.uuid,
    }));
  }, [gatewayList]);

  return (
    <div
      className={cn(
        'gateway-select-wrapper',
        readonly && 'gateway-select-wrapper--readonly',
        !showGatewayAddress && 'gateway-select-wrapper--compact',
      )}
    >
      <Tooltip placement="top" title={getNetworkTip()}>
        <div className={cn('network-status', getNetworkClass)}></div>
      </Tooltip>
      <span className="current-server-label">{t('login_page.current_server')}</span>
      <Select
        placement="topRight"
        variant="borderless"
        value={autoGateway?.uuid}
        onChange={handleChangeGateway}
        suffixIcon={readonly ? null : <CaretDownOutlined />}
        disabled={readonly}
        size="small"
        classNames={{ root: 'gateway-select' }}
        options={options}
      />
    </div>
  );
};
