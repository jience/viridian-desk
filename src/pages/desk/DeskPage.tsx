import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { Button, Dropdown, Empty, message, Modal, Spin, Tooltip } from 'antd';
import { listen } from '@tauri-apps/api/event';
import { get } from 'lodash-es';
import DeskLoading from '@/components/DeskLoading';
import Deskpool from '@/components/Deskpoolsvg';
import useRequest from '@/hooks/useRequest';
import { detachVolume } from '@/services/resource';
import { killAllHdpViewers } from '@/services/invoke/shell';
import { useAppSelector } from '@/store';
import { selectFullScreen } from '@/store/feature/config';
import { authActionShow } from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { DESK_STATUS, EmptyText, getStatus } from '@/utils/constant';
import { transIcon, transRam } from '@/utils/utils';
import DeskPoolModal from './components/deskPoolDetail';
import InUseLoading from './components/loading';
import useDeskHooks from './useDeskHooks';
import './DeskPage.scss';

export function DeskPage() {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const isFullScreen = useAppSelector(selectFullScreen);
  const [_attachIds, setAttachIds] = useState({
    desktopId: '',
    iaasId: '',
    storageType: '',
    hostName: '',
    encrypt: false,
  });
  const [poolDetailVisible, setPoolDetailVisible] = useState(false);

  const {
    deskData,
    deskPoolData,
    generateMenus,
    shutDownDesktop,
    restartDesk,
    isLoadingDesk,
    setIsLoadingDesk,
    enterDesk,
    createDeskFromDeskPool,
    checkDeskPoolItem,
    setCheckDeskPoolItem,
    getDeskPoolDetail,
    getDeskList,
    getDeskPoolList,
    deskLoading,
    deskPoolLoading,
    listResourceUserRefresh,
    listDesktopPoolRefresh,
    loadingDeskText,
  } = useDeskHooks({
    isFullScreen,
  });

  const isRefreshing = deskLoading || deskPoolLoading;
  const isEmpty = !deskData?.length && !deskPoolData?.length && !isRefreshing;
  const refreshLabel = formatMessage({ id: 'REFRESH', defaultMessage: 'Refresh' });
  const connectLabel = formatMessage({ id: 'ConnectDesktop' });
  const restartLabel = formatMessage({ id: 'RESTART' });
  const shutdownLabel = formatMessage({ id: 'SHUT_DOWN' });
  const detailLabel = formatMessage({ id: 'DETAIL' });
  const moreLabel = formatMessage({ id: 'ACTION' });

  const getDesktopStatusInfo = (item: any) => {
    if (item?.isLock) {
      return {
        title: formatMessage({ id: 'Lock' }),
        type: 'warning',
      };
    }
    return getStatus(item?.status || DESK_STATUS.UNKNOWN);
  };

  const getPrimaryIp = (interfaces: any[] = []) => {
    const current = interfaces.find((interfaceItem) => interfaceItem?.ip || interfaceItem?.ip2);
    return current?.ip || current?.ip2 || EmptyText;
  };

  const getDesktopSpec = (item: any) => {
    const cpu = Number.parseInt(item?.flavor?.cpu);
    const cpuText = Number.isNaN(cpu)
      ? item?.flavor?.cpu || EmptyText
      : `${cpu}${formatMessage({ id: 'DESK_CPU_UNIT' })}`;
    const { num, unit } = transRam(item?.flavor?.memory);
    const memoryText = num ? `${num}${unit}` : EmptyText;
    return `${cpuText} / ${memoryText}`;
  };

  const getOsLabel = (item: any) => item?.image?.name || item?.image?.os || item?.os || EmptyText;

  const getDesktopMetaLine = (item: any) =>
    [getOsLabel(item), getDesktopSpec(item), getPrimaryIp(item?.interfaces)]
      .filter(Boolean)
      .join('  ·  ');

  const getPoolMetaLine = (item: any) =>
    [
      item?.image?.name || item?.os || EmptyText,
      getDesktopSpec(item),
      item?.network?.subnets?.[0]?.cidr || EmptyText,
    ]
      .filter(Boolean)
      .join('  ·  ');

  const getDesktopMenu = (item: any) => {
    const originalMenu = generateMenus(item, getPersonalDiskMenuActions());
    const menuItems = [
      {
        key: 'detail',
        label: <p>{detailLabel}</p>,
        disabled: item.status === DESK_STATUS.DELETING,
      },
    ];

    if (authActionShow([Actions.TerminalRWDesktopForceReboot])) {
      menuItems.push({
        key: 'restart',
        label: <p>{restartLabel}</p>,
        disabled: item.status !== DESK_STATUS.START || item.isLock,
      });
    }

    if (authActionShow([Actions.TerminalRWDesktopShutdown])) {
      menuItems.push({
        key: 'shutdown',
        label: <p>{shutdownLabel}</p>,
        disabled: item.status !== DESK_STATUS.START || item.isLock,
      });
    }

    return {
      ...originalMenu,
      items: [...menuItems, ...(originalMenu.items || [])],
      onClick: (info: any) => {
        info.domEvent.stopPropagation();

        if (info.key === 'detail') {
          navigate('/app/deskDetail', {
            state: { id: item.id },
          });
          return;
        }

        if (info.key === 'restart') {
          restartDesk(item, false);
          return;
        }

        if (info.key === 'shutdown') {
          shutDownDesktop(item);
          return;
        }

        originalMenu.onClick?.(info);
      },
    };
  };

  useEffect(() => {
    let disposed = false;
    const unsubscribers: Array<() => void> = [];

    const registerListener = (unlistenPromise: Promise<() => void>) => {
      unlistenPromise
        .then((unlisten) => {
          if (disposed) {
            unlisten();
            return;
          }
          unsubscribers.push(unlisten);
        })
        .catch((error) => {
          console.error('Failed to register desktop event listener', error);
        });
    };

    registerListener(
      listen('desktop-connect', () => {
        setIsLoadingDesk(false);
      }),
    );

    registerListener(
      listen('desktop-list', () => {
        listResourceUserRefresh();
        listDesktopPoolRefresh();
      }),
    );

    registerListener(
      listen('desktop-idle-disconnect', async () => {
        await killAllHdpViewers();
        message.warning('用户闲置策略生效，断开桌面连接');
      }),
    );

    registerListener(
      listen('desktop-idle-close', async () => {
        // TODO 用户闲置策略生效，关闭桌面 待实现
      }),
    );

    return () => {
      disposed = true;
      unsubscribers.forEach((unlisten) => {
        unlisten();
      });
    };
  }, [listDesktopPoolRefresh, listResourceUserRefresh, setIsLoadingDesk]);

  const { run: detachVolumeRun } = useRequest(detachVolume, {
    manual: true,
    onSuccess: () => {
      getDeskList();
      getDeskPoolList();
    },
  });

  const refreshDeskResources = () => {
    listResourceUserRefresh();
    listDesktopPoolRefresh();
  };

  const handleDetach = (desk: any) => {
    Modal.confirm({
      title: (
        <span>
          <i className="iconfont icon-malfunction1 modal-confirm-icon" />
          {formatMessage({ id: 'DETACH_VOLUME_GATEWAY' })}
        </span>
      ),
      centered: true,
      className: 'confirm-modal',
      content: formatMessage({ id: 'DETACH_VOLUME_MSG' }),
      okText: formatMessage({ id: 'DETACH' }),
      cancelText: formatMessage({ id: 'CANCEL' }),
      onOk: () => {
        detachVolumeRun({
          desktopId: desk.id,
          iaasId: desk.iaas.id,
          volumeId: desk?.disks?.find((disk: any) => disk?.attribute === 'personal')?.id,
        });
      },
    });
  };

  const getPersonalDiskMenuActions = () => [
    {
      actionId: 'PersonalDiskManagement',
      action: (type: any, desktop: any) => {
        switch (type) {
          case 'mount': {
            const dataDisk = get(desktop, 'disks', []).filter(
              (disk: any) => disk.isSystem == false,
            ).length;
            if (dataDisk >= 2 && desktop?.os?.includes('Windows Server 2000')) {
              message.error({
                content: 'Windows Server 2000 已挂满2个数据盘无法继续挂载个人盘',
              });
              break;
            }

            if (
              desktop?.os?.includes('Windows Server 2000') &&
              desktop.status !== DESK_STATUS.STOP
            ) {
              message.error({
                content: 'Windows Server 2000 未关机，请先执行关机后再操作挂载个人盘',
              });
              break;
            }

            setAttachIds({
              desktopId: desktop.id,
              iaasId: desktop.iaas.id,
              storageType: desktop.storageType,
              hostName: desktop.hostName ? desktop.hostName : '',
              encrypt: desktop.encrypt,
            });
            break;
          }
          case 'unmount':
            if (
              desktop?.os?.includes('Windows Server 2000') &&
              desktop.status !== DESK_STATUS.STOP
            ) {
              message.error({
                content: 'Windows Server 2000 未关机，请先执行关机后再操作卸载个人盘',
              });
              break;
            }
            handleDetach(desktop);
            break;
        }
      },
    },
  ];

  return (
    <main className="desk-page">
      <header className="desk-page__toolbar">
        <Button
          className="desk-page__refresh"
          type="primary"
          loading={isRefreshing}
          icon={<i className="iconfont icon-refresh" />}
          aria-label={refreshLabel}
          title={refreshLabel}
          onClick={refreshDeskResources}
        />
      </header>

      <Spin spinning={isRefreshing}>
        <div className="desk-page__scroll">
          {isEmpty && (
            <section className="desk-page__empty">
              <Empty description={formatMessage({ id: 'DESK' })} />
            </section>
          )}

          {!!deskData?.length && (
            <section className="desk-page__section desk-page__section--desktops">
              <div className="desk-page__grid">
                {deskData.map((item: any, index: number) => {
                  const isStopped = ['stop', 'stopretain'].includes(item?.status?.toLowerCase());
                  const statusInfo = getDesktopStatusInfo(item);
                  return (
                    <article
                      className={`desk-card desk-card--${item?.desktopPool?.type} desk-card-item-${index} ${
                        isStopped ? 'desk-card--disabled' : ''
                      }`}
                      key={item?.id || `${item?.name}-${index}`}
                    >
                      <Dropdown
                        menu={getDesktopMenu(item)}
                        placement="bottomRight"
                        trigger={['click']}
                        classNames={{ root: 'desk-more-menu desk-page__more-menu' }}
                        getPopupContainer={(triggerNode: HTMLElement) =>
                          triggerNode.ownerDocument.body
                        }
                      >
                        <Button
                          className="desk-card__menu"
                          type="text"
                          icon={<i className="iconfont icon-more" />}
                          aria-label={moreLabel}
                          title={moreLabel}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </Dropdown>

                      <button
                        className="desk-card__preview"
                        type="button"
                        onClick={() => enterDesk(item)}
                      >
                        <div className="desk-card__icon">
                          {transIcon(item.image?.os || item.os)}
                          {item.isDefault && (
                            <span className="desk-card__default">
                              {formatMessage({ id: 'DEFAULT' })}
                            </span>
                          )}
                        </div>

                        <div className="desk-card__identity">
                          <Tooltip title={item.name}>
                            <h3 className="desk-card__name">
                              <span>{item.name}</span>
                            </h3>
                          </Tooltip>
                          <p className="desk-card__meta-line">{getDesktopMetaLine(item)}</p>
                        </div>

                        <div className={`desk-card__status desk-card__status--${statusInfo.type}`}>
                          <span className="desk-card__status-dot" />
                          <span>{statusInfo.title}</span>
                          {item?.sessionStatus == '1' && <InUseLoading />}
                        </div>
                      </button>

                      <Button
                        className="desk-card__connect"
                        type="primary"
                        aria-label={connectLabel}
                        title={connectLabel}
                        onClick={() => enterDesk(item)}
                      >
                        <span>{connectLabel}</span>
                        <i className="iconfont icon-arrow" />
                      </Button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {!!deskPoolData?.length && (
            <section className="desk-page__section desk-page__section--pools">
              <div className="desk-page__pool-grid">
                {deskPoolData.map((item: any, index: number) => (
                  <article className="desk-pool" key={item?.id || `${item?.name}-${index}`}>
                    <Button
                      className="desk-card__menu"
                      type="text"
                      icon={<i className="iconfont icon-info-o" />}
                      aria-label={`${detailLabel}: ${item.name}`}
                      title={detailLabel}
                      onClick={() => {
                        getDeskPoolDetail(item.id);
                        setPoolDetailVisible(true);
                      }}
                    />

                    <button
                      type="button"
                      className="desk-pool__preview"
                      aria-label={`${detailLabel}: ${item.name}`}
                      onClick={() => {
                        getDeskPoolDetail(item.id);
                        setPoolDetailVisible(true);
                      }}
                    >
                      <div className="desk-card__icon desk-card__icon--pool">
                        <Deskpool />
                        {transIcon(item?.os)}
                      </div>

                      <div className="desk-card__identity">
                        <Tooltip title={item.name}>
                          <h3 className="desk-pool__name">
                            <span>{item.name}</span>
                          </h3>
                        </Tooltip>
                        <p className="desk-card__meta-line">{getPoolMetaLine(item)}</p>
                      </div>

                      <div className="desk-card__status desk-card__status--success">
                        <span className="desk-card__status-dot" />
                        <span>{formatMessage({ id: 'DESK_POOL' })}</span>
                      </div>
                    </button>

                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        createDeskFromDeskPool(item);
                      }}
                      className="desk-card__connect desk-pool__create"
                    >
                      <span>{formatMessage({ id: 'CreateDeskFromDeskPool' })}</span>
                      <i className="iconfont icon-arrow" />
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </Spin>

      {poolDetailVisible && checkDeskPoolItem && (
        <DeskPoolModal
          item={checkDeskPoolItem}
          transIcon={transIcon}
          setCheckDeskPoolItem={setCheckDeskPoolItem}
          formatMessage={formatMessage}
          visible={poolDetailVisible}
          setVisible={setPoolDetailVisible}
        />
      )}
      {isLoadingDesk ? <DeskLoading text={loadingDeskText} /> : null}
    </main>
  );
}
