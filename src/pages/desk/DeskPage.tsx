import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { Button, Dropdown, Empty, message, Modal, Popover, Spin, Tooltip } from 'antd';
import { listen } from '@tauri-apps/api/event';
import { get } from 'lodash-es';
import Close from '@/components/Closesvg';
import DeskLoading from '@/components/DeskLoading';
import Deskpool from '@/components/Deskpoolsvg';
import Open from '@/components/Opensvg';
import useRequest from '@/hooks/useRequest';
import { detachVolume } from '@/services/resource';
import { killAllHdpViewers } from '@/services/invoke/shell';
import { useAppSelector } from '@/store';
import { selectFullScreen } from '@/store/feature/config';
import ActionAuth from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { DESK_STATUS, EmptyText, getStatus } from '@/utils/constant';
import { transIcon, transRam } from '@/utils/utils';
import DeskPoolModal from './components/deskPoolDetail';
import InUseLoading from './components/loading';
import useDeskHooks from './useDeskHooks';
import './DeskPage.scss';

const AuthButton = ActionAuth(Button);
const AuthDropDown = ActionAuth(Dropdown);

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
    transStatus,
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
    transType,
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
                  const desktopType = item?.desktopPool?.type || 'EXCLUSIVE';
                  return (
                    <article
                      className={`desk-card desk-card--${item?.desktopPool?.type} desk-card-item-${index} ${
                        isStopped ? 'desk-card--disabled' : ''
                      }`}
                      key={item?.id || `${item?.name}-${index}`}
                    >
                      <button
                        className="desk-card__preview"
                        type="button"
                        onClick={() => enterDesk(item)}
                      >
                        <div className="desk-card__topline">
                          <div
                            className={`desk-card__status desk-card__status--${statusInfo.type}`}
                          >
                            {transStatus(item.status, item.isLock)}
                            {item?.sessionStatus == '1' && <InUseLoading />}
                            <span>{statusInfo.title}</span>
                          </div>
                          <span className="desk-card__type">
                            {transType(item.desktopPool)}
                            {formatMessage({ id: desktopType })}
                          </span>
                        </div>

                        <div className="desk-card__stage">
                          <div className="desk-card__screen">
                            <div className="desk-card__screen-chrome">
                              <span />
                              <span />
                              <span />
                            </div>
                            <div className="desk-card__os">
                              {item.status.toLowerCase() === 'stop' ? (
                                <span className="desk-card__os-shell">
                                  <Close />
                                </span>
                              ) : (
                                <Open />
                              )}
                              {transIcon(item.image?.os || item.os)}
                            </div>
                            <span className="desk-card__screen-tag">{statusInfo.title}</span>
                          </div>
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
                          <p className="desk-card__os-name">{getOsLabel(item)}</p>
                        </div>
                      </button>

                      <div className="desk-card__facts" aria-label={item.name}>
                        <div className="desk-card__fact">
                          <span>{formatMessage({ id: 'DESK_STANDARD' })}</span>
                          <strong>{getDesktopSpec(item)}</strong>
                        </div>
                        <div className="desk-card__fact">
                          <span>{formatMessage({ id: 'DESK_NETWORK' })}</span>
                          <strong>{getPrimaryIp(item?.interfaces)}</strong>
                        </div>
                      </div>

                      <div className="desk-card__actions">
                        <Popover content={connectLabel}>
                          <Button
                            className="desk-card__connect"
                            type="primary"
                            icon={<i className="iconfont icon-boot" />}
                            aria-label={connectLabel}
                            title={connectLabel}
                            onClick={() => enterDesk(item)}
                          >
                            {connectLabel}
                          </Button>
                        </Popover>
                        <div className="desk-card__quick-actions">
                          <Popover content={restartLabel}>
                            <AuthButton
                              actions={[Actions.TerminalRWDesktopForceReboot]}
                              disabled={item.status !== DESK_STATUS.START || item.isLock}
                              type="text"
                              icon={<i className="iconfont icon-reboot" />}
                              aria-label={restartLabel}
                              title={restartLabel}
                              onClick={() => restartDesk(item, false)}
                            />
                          </Popover>
                          <Popover content={shutdownLabel}>
                            <AuthButton
                              actions={[Actions.TerminalRWDesktopShutdown]}
                              disabled={item.status !== DESK_STATUS.START || item.isLock}
                              type="text"
                              icon={<i className="iconfont icon-shutdown" />}
                              aria-label={shutdownLabel}
                              title={shutdownLabel}
                              onClick={() => shutDownDesktop(item)}
                            />
                          </Popover>
                          <Popover content={detailLabel}>
                            <Button
                              type="text"
                              icon={<i className="iconfont icon-info-o" />}
                              disabled={item.status === DESK_STATUS.DELETING}
                              aria-label={detailLabel}
                              title={detailLabel}
                              onClick={() => {
                                navigate('/app/deskDetail', {
                                  state: { id: item.id },
                                });
                              }}
                            />
                          </Popover>
                          <AuthDropDown
                            actions={[
                              Actions.TerminalRWDesktopSetOrUnsetDefault,
                              Actions.TerminalRWDesktopAttachOrDetachPrivateDisk,
                            ]}
                            menu={generateMenus(item, getPersonalDiskMenuActions())}
                            placement="bottomRight"
                            trigger={['click']}
                            classNames={{ root: 'desk-more-menu desk-page__more-menu' }}
                            getPopupContainer={(triggerNode: HTMLElement) =>
                              triggerNode.ownerDocument.body
                            }
                          >
                            <Button
                              type="text"
                              icon={<i className="iconfont icon-more" />}
                              aria-label={moreLabel}
                              title={moreLabel}
                            />
                          </AuthDropDown>
                        </div>
                      </div>
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
                    <button
                      type="button"
                      className="desk-pool__preview"
                      aria-label={`${detailLabel}: ${item.name}`}
                      onClick={() => {
                        getDeskPoolDetail(item.id);
                        setPoolDetailVisible(true);
                      }}
                    >
                      <div className="desk-pool__topline">
                        <span className="desk-card__type">
                          {transType(item)}
                          {formatMessage({ id: item?.type || 'DESK_POOL' })}
                        </span>
                        <span className="desk-pool__label">
                          {formatMessage({ id: 'DESK_POOL' })}
                        </span>
                      </div>

                      <div className="desk-card__stage desk-pool__stage">
                        <div className="desk-card__screen desk-pool__screen">
                          <div className="desk-card__screen-chrome">
                            <span />
                            <span />
                            <span />
                          </div>
                          <div className="desk-pool__os">
                            <span className="desk-pool__os-shell">
                              <Deskpool />
                            </span>
                            {transIcon(item?.os)}
                          </div>
                          <span className="desk-card__screen-tag">
                            {formatMessage({ id: 'DESK_POOL' })}
                          </span>
                        </div>
                      </div>

                      <div className="desk-card__identity">
                        <Tooltip title={item.name}>
                          <h3 className="desk-pool__name">
                            <span>{item.name}</span>
                          </h3>
                        </Tooltip>
                        <p className="desk-card__os-name">
                          {item?.image?.name || item?.os || EmptyText}
                        </p>
                      </div>
                    </button>

                    <div className="desk-card__facts">
                      <div className="desk-card__fact">
                        <span>{formatMessage({ id: 'DESK_STANDARD' })}</span>
                        <strong>{getDesktopSpec(item)}</strong>
                      </div>
                      <div className="desk-card__fact">
                        <span>{formatMessage({ id: 'DESK_NETWORK' })}</span>
                        <strong>{item?.network?.subnets?.[0]?.cidr || EmptyText}</strong>
                      </div>
                    </div>

                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        createDeskFromDeskPool(item);
                      }}
                      className="desk-pool__create"
                    >
                      {formatMessage({ id: 'CreateDeskFromDeskPool' })}
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
