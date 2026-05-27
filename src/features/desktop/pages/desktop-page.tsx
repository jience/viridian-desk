import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useMessageFormatter } from '@/utils/message-format';
import { useNavigate } from 'react-router';
import { Button, Empty, Modal, Spin } from '@/shared/ui/fast';
import { message } from '@/shared/ui/message';
import useRequest from '@/hooks/useRequest';
import { useProgressiveItems } from '@/hooks/useProgressiveItems';
import { detachVolume } from '@/services/api/desktop';
import { bridge } from '@/native';
import { useAppSelector } from '@/store';
import { selectFullScreen } from '@/store/feature/config';
import { authActionShow } from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { DESK_STATUS, EmptyText, getStatus } from '@/utils/constant';
import { logger } from '@/utils/logger';
import { transIcon, transRam } from '@/utils/utils';
import { DeskPoolCard, DesktopCard } from '../components/desktop-resource-cards';
import useDeskHooks from '../model/use-desk-hooks';
import './desktop-page.scss';

const DeskPoolModal = lazy(() => import('../components/desk-pool-detail'));
const DeskLoading = lazy(() => import('@/features/desktop/components/desk-loading'));

export function DeskPage() {
  const { formatMessage } = useMessageFormatter();
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
  const defaultLabel = formatMessage({ id: 'DEFAULT' });
  const poolLabel = formatMessage({ id: 'DESK_POOL' });
  const createPoolDesktopLabel = formatMessage({ id: 'CreateDeskFromDeskPool' });

  const getDesktopStatusInfo = useCallback(
    (item: any) => {
      if (item?.isLock) {
        return {
          title: formatMessage({ id: 'Lock' }),
          type: 'warning',
        };
      }
      return getStatus(item?.status || DESK_STATUS.UNKNOWN);
    },
    [formatMessage],
  );

  const getPrimaryIp = useCallback((interfaces: any[] = []) => {
    const current = interfaces.find((interfaceItem) => interfaceItem?.ip || interfaceItem?.ip2);
    return current?.ip || current?.ip2 || EmptyText;
  }, []);

  const getDesktopSpec = useCallback(
    (item: any) => {
      const cpu = Number.parseInt(item?.flavor?.cpu);
      const cpuText = Number.isNaN(cpu)
        ? item?.flavor?.cpu || EmptyText
        : `${cpu}${formatMessage({ id: 'DESK_CPU_UNIT' })}`;
      const { num, unit } = transRam(item?.flavor?.memory);
      const memoryText = num ? `${num}${unit}` : EmptyText;
      return `${cpuText} / ${memoryText}`;
    },
    [formatMessage],
  );

  const getOsLabel = useCallback(
    (item: any) => item?.image?.name || item?.image?.os || item?.os || EmptyText,
    [],
  );

  const getDesktopMetaLine = useCallback(
    (item: any) =>
      [getOsLabel(item), getDesktopSpec(item), getPrimaryIp(item?.interfaces)]
        .filter(Boolean)
        .join('  ·  '),
    [getDesktopSpec, getOsLabel, getPrimaryIp],
  );

  const getPoolMetaLine = useCallback(
    (item: any) =>
      [
        item?.image?.name || item?.os || EmptyText,
        getDesktopSpec(item),
        item?.network?.subnets?.[0]?.cidr || EmptyText,
      ]
        .filter(Boolean)
        .join('  ·  '),
    [getDesktopSpec],
  );

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
          logger.debug('desktop event listener unavailable', error);
        });
    };

    registerListener(
      bridge.onEvent('desktop-connect', () => {
        setIsLoadingDesk(false);
      }),
    );

    registerListener(
      bridge.onEvent('desktop-list', () => {
        listResourceUserRefresh();
        listDesktopPoolRefresh();
      }),
    );

    registerListener(
      bridge.onEvent('desktop-idle-disconnect', async () => {
        const { killAllHdpViewers } = await import('@/services/invoke/shell');
        await killAllHdpViewers();
        message.warning('用户闲置策略生效，断开桌面连接');
      }),
    );

    registerListener(
      bridge.onEvent('desktop-idle-close', async () => {
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

  const refreshDeskResources = useCallback(() => {
    listResourceUserRefresh();
    listDesktopPoolRefresh();
  }, [listDesktopPoolRefresh, listResourceUserRefresh]);

  const handleDetach = useCallback(
    (desk: any) => {
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
    },
    [detachVolumeRun, formatMessage],
  );

  const personalDiskMenuActions = useMemo(
    () => [
      {
        actionId: 'PersonalDiskManagement',
        action: (type: any, desktop: any) => {
          switch (type) {
            case 'mount': {
              const dataDisk = (desktop?.disks ?? []).filter(
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
    ],
    [handleDetach],
  );

  const getDesktopMenu = useCallback(
    (item: any) => {
      const originalMenu = generateMenus(item, personalDiskMenuActions);
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
        defaultLabel,
        dropdown: {
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
        },
      };
    },
    [
      defaultLabel,
      detailLabel,
      generateMenus,
      navigate,
      personalDiskMenuActions,
      restartDesk,
      restartLabel,
      shutDownDesktop,
      shutdownLabel,
    ],
  );

  const handleEnterDesk = useCallback((item: any) => enterDesk(item), [enterDesk]);

  const showDeskPoolDetail = useCallback(
    (id: string) => {
      getDeskPoolDetail(id);
      setPoolDetailVisible(true);
    },
    [getDeskPoolDetail],
  );

  const handleCreateDeskFromDeskPool = useCallback(
    (item: any) => {
      createDeskFromDeskPool(item);
    },
    [createDeskFromDeskPool],
  );

  const desktopCardItems = useMemo(
    () =>
      (deskData || []).map((item: any, index: number) => ({
        item,
        index,
        key: item?.id || `${item?.name}-${index}`,
        metaLine: getDesktopMetaLine(item),
        menu: getDesktopMenu(item),
        statusInfo: getDesktopStatusInfo(item),
      })),
    [deskData, getDesktopMenu, getDesktopMetaLine, getDesktopStatusInfo],
  );

  const deskPoolCardItems = useMemo(
    () =>
      (deskPoolData || []).map((item: any, index: number) => ({
        item,
        key: item?.id || `${item?.name}-${index}`,
        metaLine: getPoolMetaLine(item),
      })),
    [deskPoolData, getPoolMetaLine],
  );
  const visibleDesktopCardItems = useProgressiveItems(desktopCardItems, {
    initialCount: 18,
    chunkSize: 18,
  });
  const visibleDeskPoolCardItems = useProgressiveItems(deskPoolCardItems, {
    initialCount: 12,
    chunkSize: 12,
  });

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
                {visibleDesktopCardItems.map((card) => (
                  <DesktopCard
                    key={card.key}
                    item={card.item}
                    index={card.index}
                    connectLabel={connectLabel}
                    moreLabel={moreLabel}
                    metaLine={card.metaLine}
                    menu={card.menu}
                    statusInfo={card.statusInfo}
                    onEnterDesk={handleEnterDesk}
                  />
                ))}
              </div>
            </section>
          )}

          {!!deskPoolData?.length && (
            <section className="desk-page__section desk-page__section--pools">
              <div className="desk-page__pool-grid">
                {visibleDeskPoolCardItems.map((card) => (
                  <DeskPoolCard
                    key={card.key}
                    item={card.item}
                    detailLabel={detailLabel}
                    metaLine={card.metaLine}
                    poolLabel={poolLabel}
                    createLabel={createPoolDesktopLabel}
                    onCreate={handleCreateDeskFromDeskPool}
                    onShowDetail={showDeskPoolDetail}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </Spin>

      {poolDetailVisible && checkDeskPoolItem && (
        <Suspense fallback={null}>
          <DeskPoolModal
            item={checkDeskPoolItem}
            transIcon={transIcon}
            setCheckDeskPoolItem={setCheckDeskPoolItem}
            formatMessage={formatMessage}
            visible={poolDetailVisible}
            setVisible={setPoolDetailVisible}
          />
        </Suspense>
      )}
      {isLoadingDesk ? (
        <Suspense fallback={null}>
          <DeskLoading text={loadingDeskText} />
        </Suspense>
      ) : null}
    </main>
  );
}
