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
import { DESK_STATUS } from '@/utils/constant';
import { transIcon } from '@/utils/utils';
import DeskPoolModal from '../components/deskPoolDetail';
import InUseLoading from '../components/loading';
import useDeskHooks from '../useDeskHooks';
import './index.scss';

const AuthButton = ActionAuth(Button);
const AuthDropDown = ActionAuth(Dropdown);

export function Component() {
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

  useEffect(() => {
    let unListenConnect: (() => void) | null = null;
    let unListenDesktopList: (() => void) | null = null;
    let unListenDesktopIdleDisconnect: (() => void) | null = null;
    let unListenDesktopIdleClose: (() => void) | null = null;

    const setupListeners = async () => {
      unListenConnect = await listen('desktop-connect', () => {
        setIsLoadingDesk(false);
      });

      unListenDesktopList = await listen('desktop-list', () => {
        listResourceUserRefresh();
        listDesktopPoolRefresh();
      });

      unListenDesktopIdleDisconnect = await listen('desktop-idle-disconnect', async () => {
        await killAllHdpViewers();
        message.warning('用户闲置策略生效，断开桌面连接');
      });
      unListenDesktopIdleClose = await listen('desktop-idle-close', async () => {
        console.log('用户闲置策略生效，关闭桌面');
        // TODO 用户闲置策略生效，关闭桌面 待实现
      });
    };

    setupListeners();

    return () => {
      if (unListenConnect) unListenConnect();
      if (unListenDesktopList) unListenDesktopList();
      if (unListenDesktopIdleDisconnect) unListenDesktopIdleDisconnect();
      if (unListenDesktopIdleClose) unListenDesktopIdleClose();
    };
  }, []);

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
    <main className="redesign-desk-page">
      <header className="redesign-desk-page__toolbar">
        <div>
          <span className="redesign-desk-page__eyebrow">{formatMessage({ id: 'DESK' })}</span>
          <h1>{formatMessage({ id: 'DESK' })}</h1>
        </div>
        <Button
          className="redesign-desk-page__refresh"
          type="primary"
          loading={isRefreshing}
          icon={<i className="iconfont icon-refresh" />}
          aria-label="Refresh"
          title="Refresh"
          onClick={refreshDeskResources}
        />
      </header>

      <Spin spinning={isRefreshing}>
        <div className="redesign-desk-page__scroll">
          {isEmpty && (
            <section className="redesign-desk-page__empty">
              <Empty description={formatMessage({ id: 'DESK' })} />
            </section>
          )}

          {!!deskData?.length && (
            <section className="redesign-desk-page__section">
              <div className="redesign-desk-page__section-header">
                <div>
                  <span>{formatMessage({ id: 'DESK' })}</span>
                  <strong>{deskData.length}</strong>
                </div>
              </div>
              <div className="redesign-desk-page__grid">
                {deskData.map((item: any, index: number) => {
                  const isStopped = ['stop', 'stopretain'].includes(item?.status?.toLowerCase());
                  return (
                    <article
                      className={`redesign-desk-card redesign-desk-card--${item?.desktopPool?.type} redesign-desk-card-item-${index} ${
                        isStopped ? 'redesign-desk-card--disabled' : ''
                      }`}
                      key={item?.id || `${item?.name}-${index}`}
                    >
                      <button
                        className="redesign-desk-card__body"
                        type="button"
                        onClick={() => enterDesk(item)}
                      >
                        <div className="redesign-desk-card__status">
                          <div className="redesign-desk-card__status-left">
                            {transStatus(item.status, item.isLock)}
                            {item?.sessionStatus == '1' && <InUseLoading />}
                          </div>
                          {item.isDefault && (
                            <span className="redesign-desk-card__default">
                              {formatMessage({ id: 'DEFAULT' })}
                            </span>
                          )}
                        </div>
                        <div className="redesign-desk-card__os">
                          {item.status.toLowerCase() === 'stop' ? (
                            <span className="redesign-desk-card__os-shell">
                              <Close />
                            </span>
                          ) : (
                            <Open />
                          )}
                          {transIcon(item.image?.os || item.os)}
                        </div>
                        <Tooltip title={item.name}>
                          <p className="redesign-desk-card__name">
                            <span>{item.name}</span>
                            {transType(item.desktopPool)}
                          </p>
                        </Tooltip>
                      </button>
                      <div className="redesign-desk-card__actions">
                        <Popover content={formatMessage({ id: 'ConnectDesktop' })}>
                          <Button
                            type="text"
                            icon={<i className="iconfont icon-boot" />}
                            onClick={() => enterDesk(item)}
                          />
                        </Popover>
                        <Popover content={formatMessage({ id: 'RESTART' })}>
                          <AuthButton
                            actions={[Actions.TerminalRWDesktopForceReboot]}
                            disabled={item.status !== DESK_STATUS.START || item.isLock}
                            type="text"
                            icon={<i className="iconfont icon-reboot" />}
                            onClick={() => restartDesk(item, false)}
                          />
                        </Popover>
                        <Popover content={formatMessage({ id: 'SHUT_DOWN' })}>
                          <AuthButton
                            actions={[Actions.TerminalRWDesktopShutdown]}
                            disabled={item.status !== DESK_STATUS.START || item.isLock}
                            type="text"
                            icon={<i className="iconfont icon-shutdown" />}
                            onClick={() => shutDownDesktop(item)}
                          />
                        </Popover>
                        <Popover content={formatMessage({ id: 'DETAIL' })}>
                          <Button
                            type="text"
                            icon={<i className="iconfont icon-info-o" />}
                            disabled={item.status === DESK_STATUS.DELETING}
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
                          classNames={{ root: 'desk-more-menu redesign-desk-page__more-menu' }}
                          getPopupContainer={() =>
                            document.querySelector(
                              `.redesign-desk-card-item-${index}`,
                            ) as HTMLElement
                          }
                        >
                          <Button type="text" icon={<i className="iconfont icon-more" />} />
                        </AuthDropDown>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {!!deskPoolData?.length && (
            <section className="redesign-desk-page__section">
              <div className="redesign-desk-page__section-header">
                <div>
                  <span>{formatMessage({ id: 'DESK_POOL' })}</span>
                  <strong>{deskPoolData.length}</strong>
                </div>
              </div>
              <div className="redesign-desk-page__pool-grid">
                {deskPoolData.map((item: any, index: number) => (
                  <article
                    className="redesign-desk-pool"
                    key={item?.id || `${item?.name}-${index}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      getDeskPoolDetail(item.id);
                      setPoolDetailVisible(true);
                    }}
                  >
                    <div className="redesign-desk-pool__os">
                      <span className="redesign-desk-pool__os-shell">
                        <Deskpool />
                      </span>
                      {transIcon(item?.os)}
                    </div>
                    <Tooltip title={item.name}>
                      <p className="redesign-desk-pool__name">
                        <span>{item.name}</span>
                        {transType(item)}
                      </p>
                    </Tooltip>
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        createDeskFromDeskPool(item);
                      }}
                      className="redesign-desk-pool__create"
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
