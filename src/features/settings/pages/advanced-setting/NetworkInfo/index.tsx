import './index.scss';
import { useEffect, useMemo, useRef, useState, type FC, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message } from '@/shared/ui';
import InfoTable from '@/shared/components/info-table';
import { CheckCircleOutlined, CopyOutlined, EditOutlined } from '@/shared/ui/icons';
import { useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal';
import { EditNetModal, type EditNetModalRef, type EditNetModalReqType } from './EditNetModal';
import type { NetProbeItemRender } from '@/native/interfaces/cmd';
import { bridge } from '@/native';
import { SettingsRow } from '../../../components';
import { copyText } from '@/utils/clipboard';

type PendingNetworkInfoKey = 'network_info_description';

const advancedSettingKey = <T extends PendingNetworkInfoKey>(key: T) =>
  `config_page.advanced_setting.${key}` as const;

export const NetworkInfo: FC = () => {
  const { t } = useTranslation();
  const tPending = (key: PendingNetworkInfoKey) => t(advancedSettingKey(key));
  const [copyIpMacInfo, setCopyIpMacInfo] = useState('');
  const [networkInfo, setNetworkInfo] = useState<NetProbeItemRender>();
  const [netCopied, setNetCopied] = useState(false);
  const isThin = useAppSelector(selectIsThin);
  const editNetModalRef = useRef<EditNetModalRef>(null);

  const networkInfoRows = useMemo(() => {
    return [
      {
        id: 'IPAddress',
        key: t('config_page.advanced_setting.ip_address'),
        keyInfo: '',
        value: networkInfo?.ipv4,
      },
      {
        id: 'gatewayIp',
        key: t('config_page.advanced_setting.gateway'),
        keyInfo: '',
        value: networkInfo?.gateway,
      },
      {
        id: 'IPSubnetMask',
        key: t('config_page.advanced_setting.subnet_mask'),
        keyInfo: '',
        value: networkInfo?.netmask,
      },
      {
        id: 'NIC',
        key: t('config_page.advanced_setting.network_card_name'),
        keyInfo: '',
        value: networkInfo?.name,
      },
      {
        id: 'MACAddress',
        key: t('config_page.advanced_setting.physical_address'),
        keyInfo: '',
        value: networkInfo?.mac,
      },
      {
        id: 'WorkSpeed',
        key: t('config_page.advanced_setting.work_speed'),
        keyInfo: '',
        value: networkInfo?.speed,
      },
    ];
  }, [t, networkInfo]);

  const handleEditNetworkInfo = async () => {
    const initData: Partial<EditNetModalReqType> = {
      dhcpEnabled: networkInfo?.dhcpEnabled,
      address: networkInfo?.ipv4,
      gatewayIp: networkInfo?.gateway,
      netmask: networkInfo?.netmask,
    };

    await editNetModalRef.current?.openModal(initData);
    message.success(t('config_page.advanced_setting.edit_network_success'));
  };

  const fetchNetworkInfo = async () => {
    const { data } = await bridge.cmd.getLocalNetInfo();
    if (data?.length > 0) {
      const firstInfo = data[0];
      setNetworkInfo(firstInfo);
      setCopyIpMacInfo(JSON.stringify(firstInfo));
    }
  };

  const markNetCopied = () => {
    setNetCopied(true);
    setTimeout(() => {
      setNetCopied(false);
    }, 2000);
  };

  const handleCopyNetworkInfo = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await copyText(copyIpMacInfo);
    markNetCopied();
  };

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  return (
    <div className="network-info-wrapper">
      <SettingsRow
        className="vd-settings-row--detail"
        icon={<i className="iconfont icon-net" />}
        title={t('config_page.advanced_setting.network_info')}
        description={networkInfo?.name || tPending('network_info_description')}
        action={
          <Button
            size="small"
            icon={netCopied ? <CheckCircleOutlined /> : <CopyOutlined />}
            onClick={handleCopyNetworkInfo}
          >
            {t('config_page.advanced_setting.copy_content')}
          </Button>
        }
      >
        <InfoTable
          rows={networkInfoRows}
          showEdit={!!isThin}
          editOperate={
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e: any) => {
                e.stopPropagation();
                handleEditNetworkInfo();
              }}
            >
              {t('config_page.edit')}
            </Button>
          }
        />
      </SettingsRow>
      <EditNetModal ref={editNetModalRef} />
    </div>
  );
};
