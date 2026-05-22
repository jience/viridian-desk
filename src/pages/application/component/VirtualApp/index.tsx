import { useState, useEffect, type FC, useRef } from 'react';
import { Modal, Spin } from '@/ui';

import { AppDetailModal } from '../AppDetailModal';
import { AppIcon } from '../AppIcon';
import { DropdownBtn } from '@/components/Dropdown';
import Actions from '@/utils/actions';
import './index.scss';
import { hasPermission } from '@/utils/permission';
import { useTranslation } from 'react-i18next';
import type { ListVappItem } from '@/services/api/vapp/types';
import type { ItemType } from '@/ui';
import type { ModalFunc } from '@/ui';
import type { ConnectVappReq } from '@/services/invoke/vapp/types';

export interface VirtualAppProps {
  dataSource: ListVappItem[];
  OnFavoriteApp: () => void;
  OnCustomPublish: () => void;
  OnRemoveApp: (params: { mIds: string[]; desktopIds: string[] }) => Promise<void>;
  OnDeleteApp: (params: { mIds: string[]; desktopIds: string[] }) => Promise<void>;
  OnVappItemClick: (params: ConnectVappReq) => Promise<void>;
}

export const VirtualApp: FC<VirtualAppProps> = (props) => {
  const { dataSource, OnFavoriteApp, OnCustomPublish } = props;
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const deleteConfirmRef = useRef<ReturnType<ModalFunc>>(null);

  const addAppWays = [
    {
      name: t('application_page.custom_publish'),
      value: 'self',
      icon: 'icon-custom',
      actions: [Actions.TerminalRWAppAddCustom],
      callBack: OnCustomPublish,
    },
    {
      name: t('application_page.favorite_app'),
      value: 'sys',
      icon: 'icon-setting',
      actions: [Actions.TerminalRWAppAddPrepare],
      callBack: OnFavoriteApp,
    },
  ];
  const [operateAppLoading, setOperateAppLoading] = useState(false);

  // const [redDot, setRedDot] = useState(false);
  const [appDetailVisible, setAppDetailVisible] = useState(false);
  const [currentWatchApp, setCurrentWatchApp] = useState<any>(null);
  const [enterAppLoading, setEnterAppLoading] = useState(false);

  //获取红点
  const getRedDot = () => {
    // AppAjax.getRealTimeVappRes({
    //   success: () => {
    //     setRedDot(true);
    //   },
    // });
  };

  /**
   * remove app
   * @param id
   */
  const removeApp = async (id: string, desktopId?: string) => {
    await props.OnRemoveApp({ mIds: [id], desktopIds: desktopId ? [desktopId] : [] });
  };

  /**
   * 删除app
   * @param id
   */
  const deleteApp = async (id: string, desktopId?: string) => {
    await props.OnDeleteApp({ mIds: [id], desktopIds: desktopId ? [desktopId] : [] });
  };

  /**
   * 移除 或 取消收藏
   * @param data
   */
  const deleteHandle = (data: ListVappItem) => {
    const isSystem = data.vapp.publishType === 'System';
    const title = isSystem
      ? t('application_page.cancel_favorite_app')
      : t('application_page.delete_app');
    deleteConfirmRef.current = modal.confirm({
      centered: true,
      className: 'confirm-modal',
      title,
      content: (
        <span>
          {isSystem
            ? t('application_page.confirm_cancel_favorite_app')
            : t('application_page.confirm_delete_app')}
          <span className="confirm-tag">{data?.vapp?.name}</span> ?
        </span>
      ),
      okText: isSystem ? t('application_page.cancel_favorite') : t('application_page.delete'),
      okButtonProps: {
        loading: operateAppLoading,
      },
      cancelText: t('application_page.close'),
      onOk: async () => {
        setOperateAppLoading(true);
        try {
          if (isSystem) {
            await removeApp(data.id + '', data?.desktop?.id);
          } else {
            await deleteApp(data.id + '', data?.desktop?.id);
          }
        } finally {
          setOperateAppLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    if (deleteConfirmRef.current) {
      deleteConfirmRef.current.update({
        okButtonProps: {
          loading: operateAppLoading,
        },
      });
    }
  }, [deleteConfirmRef.current, operateAppLoading]);

  const enterVappHandler = async (opt: ConnectVappReq) => {
    setEnterAppLoading(true);
    await props.OnVappItemClick(opt).finally(() => {
      setEnterAppLoading(false);
    });
    // if (getNetworkClass() == 'success') {
    //   setGlobalLoading(true);
    //   setGlobalLoadingText(intl.formatMessage({ id: 'ALP_VIRTUAL_APPLICATION_CONNECTING' }));
    // } else {
    // window.messageWarn({
    //   content: intl.formatMessage({ id: 'DLP_NETWORK_UNAVAILABLE' }),
    // });
    // return false;
    // }
    // window.ipcRenderer.send(AppAjax.EnterVapp, {
    //   mId: id,
    // });
    // AppAjax.enterVappRes({
    //   success: () => {
    //     setGlobalLoading(false);
    //     setGlobalLoadingText('');
    //   },
    //   error: () => {
    //     setGlobalLoading(false);
    //     setGlobalLoadingText('');
    //   },
    // });
  };

  const renderAppList = () => {
    return dataSource.map((i) => {
      const options: ItemType[] = [
        {
          label: t('application_page.details'),
          key: 'DetailInfo',
          onClick: (e) => {
            e.domEvent.stopPropagation();
            setCurrentWatchApp(i);
            setAppDetailVisible(true);
          },
        },
        {
          label:
            i.vapp.publishType === 'System'
              ? t('application_page.remove')
              : t('application_page.delete'), // 删除或移除
          key: 'deleteHandle',
          onClick: (e) => {
            e.domEvent.stopPropagation();
            deleteHandle(i);
          },
          // action: Actions.TerminalRWAppDelete,
        },
      ];

      return (
        <Spin spinning={enterAppLoading}>
          <div
            key={i.id}
            className="app-item"
            onClick={() =>
              enterVappHandler({
                vappId: i.vapp.id,
                mId: i.id,
              })
            }
          >
            <div className="app-info">
              <AppIcon appIconUrl={i.vapp.appIconUrl} appId={i.id} />
              <div className="app-name" title={i.vapp.name}>
                {i.vapp.name}
              </div>
            </div>
            <DropdownBtn options={options} />
          </div>
        </Spin>
      );
    });
  };

  useEffect(() => {
    getRedDot();
    return () => {
      // window.ipcRenderer.removeAllListeners(`${AppAjax.GetRealTimeVapp}`);
      setAppDetailVisible(false);
    };
  }, []);

  return (
    <div className="application-container">
      <div className="app-list">
        {hasPermission(
          [Actions.TerminalRWAppAddPrepare, Actions.TerminalRWAppAddCustom],
          <div className="app-add-container">
            {/* {redDot && <div className="redDot"></div>} */}
            {addAppWays.map((i: any) => {
              return hasPermission(
                i.actions,
                <div className="add-way" key={i.value} onClick={() => i.callBack()}>
                  <i className={`iconfont ${i.icon}`} />
                  <div>{i.name}</div>
                </div>,
              );
            })}
          </div>,
        )}
        {renderAppList()}
      </div>
      <AppDetailModal
        visible={appDetailVisible}
        setVisible={() => {
          setAppDetailVisible(false);
          setCurrentWatchApp(null);
        }}
        app={currentWatchApp}
      />
      {/* {globalLoading ? <AppLoading text={globalLoadingText} /> : null} */}
      {contextHolder}
    </div>
  );
};
