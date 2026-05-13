import { useCallback, useEffect, useRef } from 'react';
import './index.scss';
import { Button, App, message, Tag, Space } from 'antd';
import { _get_gateway_server } from '@/services/invokeServices';
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
import { SettingItem } from '@/components/SettingItem';
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

export default function ServerSetting() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const dispatch = useAppDispatch();
  const serverEditModalRef = useRef<ServerEditModalRef>(null);

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const gatewayList = useAppSelector(selectGatewayList);
  const gatewayAddrShowSwitch = useAppSelector(selectGatewayAddrShowSwitch);

  // 设置默认网关
  const setOrCancelDefault = async (data: GatewayItem) => {
    await dispatch(switchGateway(data.uuid));
  };

  // 删除网关
  const deleteGateway = (data: GatewayItem) => {
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
  };

  // 添加网关
  const addServer = async () => {
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
  };

  // 编辑网关
  const editServer = async (params: GatewayItem) => {
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
  };

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
    [t],
  );

  const getGatewayList = async () => {
    await dispatch(fetchGatewayList());
  };

  useEffect(() => {
    getGatewayList();
  }, []);

  return (
    <div className="server-setting-wrapper">
      <Button
        type="dashed"
        block
        icon={<i className="iconfont icon-add" />}
        className="addBtn"
        onClick={addServer}
      >
        {t('config_page.server_setting.add_server')}
      </Button>
      {gatewayList.map((g) => {
        const mainTitle = g.auto ? (
          <Space>
            {g.name}
            <Tag color="success">{t('config_page.current')}</Tag>
          </Space>
        ) : (
          g.name
        );

        const subTitle =
          gatewayAddrShowSwitch === 'Enabled'
            ? `${g.address}:${g.port}`
            : desensitizeText(g.address, 0, 3) + desensitizeText(`:${g.port}`, 1, 0);

        return (
          <SettingItem
            key={g.uuid}
            mainTitle={mainTitle}
            subTitle={subTitle}
            optionSlot={<DropdownBtn options={generateMenus(g)}></DropdownBtn>}
          ></SettingItem>
        );
      })}

      <ServerEditModal ref={serverEditModalRef} />
    </div>
  );
}
