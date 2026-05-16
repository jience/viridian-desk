import { useCallback, useEffect, useRef } from 'react';
import './index.scss';
import { Button, App, message } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchGatewayList,
  selectConnected,
  selectGatewayList,
  selectNetwork,
  switchGateway,
  deleteGateway as delGateway,
  addGateway,
  updateGateway,
} from '@/store/feature/gateway';

import { selectGatewayAddrShowSwitch } from '@/store/feature/client';
import { desensitizeText } from '@/utils/common';
import { DropdownBtn } from '@/components/Dropdown';
import type { ItemType } from 'antd/es/menu/interface';
import { ServerEditModal, type ServerEditModalRef } from './ServerEditModal';
import { useTranslation } from 'react-i18next';
import type {
  AddGatewayServerReq,
  GatewayItem,
  UpdateGatewayServerReq,
} from '@/native/interfaces/config';
import {
  SettingsGroup,
  SettingsMetric,
  SettingsRow,
  SettingsSection,
  SettingsStatus,
} from '../../components';

type PendingServerSettingKey =
  | 'available_gateway'
  | 'current_gateway'
  | 'empty_description'
  | 'empty_title'
  | 'eyebrow'
  | 'gateway_count'
  | 'gateway_count_helper'
  | 'gateway_list'
  | 'gateway_list_description'
  | 'network_available'
  | 'network_limited'
  | 'network_state'
  | 'network_state_helper'
  | 'no_current_gateway'
  | 'not_configured'
  | 'private_network'
  | 'workbench_description'
  | 'workbench_title';

const serverSettingKey = <T extends PendingServerSettingKey>(key: T) =>
  `config_page.server_setting.${key}` as const;

export default function ServerSetting() {
  const { t } = useTranslation();
  const tPending = (key: PendingServerSettingKey) => t(serverSettingKey(key));
  const { modal } = App.useApp();
  const dispatch = useAppDispatch();
  const serverEditModalRef = useRef<ServerEditModalRef>(null);

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const gatewayList = useAppSelector(selectGatewayList);
  const gatewayAddrShowSwitch = useAppSelector(selectGatewayAddrShowSwitch);

  const currentGateway = gatewayList.find((gateway) => gateway.auto);
  const gatewayCount = gatewayList.length;
  const connectionTone: 'success' | 'warning' = connected && network ? 'success' : 'warning';
  const connectionLabel =
    connected && network ? tPending('network_available') : tPending('network_limited');

  // 设置默认网关
  const setOrCancelDefault = useCallback(
    async (data: GatewayItem) => {
      await dispatch(switchGateway(data.uuid));
    },
    [dispatch],
  );

  // 删除网关
  const deleteGateway = useCallback(
    (data: GatewayItem) => {
      modal.confirm({
        centered: true,
        className: 'confirm-modal',
        title: <span>{t('config_page.server_setting.delete_access_gateway')}</span>,
        content: t('config_page.server_setting.delete_access_gateway_msg', {
          name: data.name,
          address:
            gatewayAddrShowSwitch === 'Enabled' && connected && network
              ? `(${data.address}:${data.port})`
              : '',
        }),
        okText: t('config_page.delete'),
        cancelText: t('config_page.cancel'),
        onOk: async () => {
          await dispatch(delGateway(data.uuid));
          message.success(
            t('config_page.server_setting.success_gateway_delete', { name: data.name }),
          );
        },
      });
    },
    [connected, dispatch, gatewayAddrShowSwitch, modal, network, t],
  );

  // 添加网关
  const addServer = useCallback(async () => {
    if (!serverEditModalRef.current) return;
    const res = await serverEditModalRef.current.openModal({
      modalType: 'add',
    });
    if (!res) return;
    const gateway: AddGatewayServerReq = {
      ...res,
      auto: false,
    };
    if (gatewayList.length == 0) {
      gateway.auto = true;
    }
    await dispatch(addGateway(gateway));
    message.success(t('config_page.server_setting.success_gateway_create', { name: res.name }));
  }, [dispatch, gatewayList.length, t]);

  // 编辑网关
  const editServer = useCallback(
    async (params: GatewayItem) => {
      if (!serverEditModalRef.current) return;
      const res = await serverEditModalRef.current?.openModal({
        initData: {
          name: params.name,
          address: params.address,
          isPublic: params.isPublic,
        },
        modalType: 'edit',
      });
      if (!res) return;

      const data: UpdateGatewayServerReq = {
        gwid: params.uuid,
        ...res,
      };

      await dispatch(updateGateway(data));
      message.success(t('config_page.server_setting.success_gateway_edit', { name: params?.name }));
    },
    [dispatch, t],
  );

  // 右侧操作按钮下拉菜单
  const generateMenus = useCallback(
    (data: GatewayItem): ItemType[] => {
      return [
        {
          key: 'edit',
          label: t('config_page.edit'),
          onClick: () => editServer(data),
        },
        {
          key: 'enable',
          label: t('config_page.enable'),
          disabled: data.auto,
          onClick: () => setOrCancelDefault(data),
        },
        {
          key: 'delete',
          label: t('config_page.delete'),
          disabled: data.auto,
          onClick: () => deleteGateway(data),
        },
      ];
    },
    [deleteGateway, editServer, setOrCancelDefault, t],
  );

  const getGatewayList = useCallback(async () => {
    await dispatch(fetchGatewayList());
  }, [dispatch]);

  useEffect(() => {
    getGatewayList();
  }, [getGatewayList]);

  return (
    <SettingsSection
      className="server-setting-wrapper"
      eyebrow={tPending('eyebrow')}
      title={tPending('workbench_title')}
      description={tPending('workbench_description')}
      actions={
        <Button
          type="primary"
          icon={<i className="iconfont icon-add" />}
          className="server-setting-add-btn"
          onClick={addServer}
        >
          {t('config_page.server_setting.add_server')}
        </Button>
      }
    >
      <div className="server-setting-summary">
        <SettingsMetric
          label={tPending('gateway_count')}
          value={gatewayCount}
          helper={tPending('gateway_count_helper')}
        />
        <SettingsMetric
          label={tPending('current_gateway')}
          value={currentGateway?.name || tPending('no_current_gateway')}
          helper={currentGateway ? t('config_page.current') : tPending('not_configured')}
        />
        <SettingsMetric
          label={tPending('network_state')}
          value={<SettingsStatus tone={connectionTone}>{connectionLabel}</SettingsStatus>}
          helper={tPending('network_state_helper')}
        />
      </div>

      <SettingsGroup
        title={tPending('gateway_list')}
        description={tPending('gateway_list_description')}
      >
        {gatewayList.length === 0 ? (
          <div className="server-setting-empty">
            <span>{tPending('empty_title')}</span>
            <p>{tPending('empty_description')}</p>
          </div>
        ) : (
          gatewayList.map((g) => {
            const address =
              gatewayAddrShowSwitch === 'Enabled'
                ? `${g.address}:${g.port}`
                : desensitizeText(g.address, 0, 3) + desensitizeText(`:${g.port}`, 1, 0);

            return (
              <SettingsRow
                key={g.uuid}
                className="server-setting-gateway-row"
                title={<span className="server-setting-gateway-name">{g.name}</span>}
                description={<span className="server-setting-gateway-address">{address}</span>}
                meta={
                  g.auto ? (
                    <SettingsStatus tone="success">{t('config_page.current')}</SettingsStatus>
                  ) : (
                    <SettingsStatus>{tPending('available_gateway')}</SettingsStatus>
                  )
                }
                action={<DropdownBtn options={generateMenus(g)}></DropdownBtn>}
              >
                <div className="server-setting-gateway-meta">
                  <span>
                    {g.isPublic
                      ? t('config_page.server_setting.public_network_agent')
                      : tPending('private_network')}
                  </span>
                </div>
              </SettingsRow>
            );
          })
        )}
      </SettingsGroup>
      <ServerEditModal ref={serverEditModalRef} />
    </SettingsSection>
  );
}
