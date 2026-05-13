import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import TableBtn from '@/components/TableBtn';
import useDeskHooks from './useDeskHooks';
import { Button, Col, Popover, Row, Spin, Tooltip, Dropdown, Modal, message } from 'antd';
import InUseLoading from './components/loading';
import Open from '@/components/Opensvg';
import Close from '@/components/Closesvg';
import Deskpool from '@/components/Deskpoolsvg';
import ActionAuth from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { transIcon } from '@/utils/utils';
import { DESK_STATUS } from '@/utils/constant';
import DeskLoading from '@/components/DeskLoading';
import { detachVolume } from '@/services/resource';
import useRequest from '@/hooks/useRequest';
import DeskPoolModal from './components/deskPoolDetail';
import './index.scss';
import { listen } from '@tauri-apps/api/event';
import { get } from 'lodash-es';
import { killAllHdpViewers } from '@/services/invoke/shell';
import { useAppSelector } from '@/store';
import { selectFullScreen } from '@/store/feature/config';

const AuthButton = ActionAuth(Button);
const AuthDropDown = ActionAuth(Dropdown);

export function Component() {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  const [_attachIds, setAttachIds] = useState({
    desktopId: '',
    iaasId: '',
    storageType: '',
    hostName: '',
    encrypt: false,
  });
  const [poolDetailVisible, setPoolDetailVisible] = useState(false);
  const isFullScreen = useAppSelector(selectFullScreen);

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

  return (
    <div className="deskContent">
      <TableBtn
        icon="icon-refresh"
        loading={deskLoading || deskPoolLoading}
        onClick={() => {
          listResourceUserRefresh();
          listDesktopPoolRefresh();
        }}
      />
      <Spin spinning={deskLoading || deskPoolLoading}>
        <Row gutter={[12, 12]} className="deskList">
          {deskData?.map((item: any, index: number) => {
            return (
              <Col span={6} key={index + item?.id}>
                <div
                  className={`deskItem desk-item-${index} deskItem-${item?.desktopPool?.type} ${
                    ['stop', 'stopretain'].includes(item?.status?.toLowerCase())
                      ? 'deskItem-disabled'
                      : ''
                  }`}
                >
                  <div
                    className="deskItemBody"
                    onClick={() => {
                      enterDesk(item);
                    }}
                  >
                    <div className="status">
                      <div className="status-icon-use">
                        {transStatus(item.status, item.isLock)}
                        {item?.sessionStatus == '1' && <InUseLoading />}
                      </div>
                      {item.isDefault && (
                        <div className="default">{formatMessage({ id: 'DEFAULT' })}</div>
                      )}
                    </div>
                    <div className="os">
                      {item.status.toLowerCase() === 'stop' ? (
                        <div className="stop-bg">
                          <Close />
                        </div>
                      ) : (
                        <Open />
                      )}
                      {transIcon(item.image?.os || item.os)}
                    </div>
                    <Tooltip title={item.name}>
                      <p className="name">
                        <span className="name-text">{item.name}</span>
                        {transType(item.desktopPool)}
                      </p>
                    </Tooltip>
                  </div>
                  <div className="operate">
                    <Popover content={formatMessage({ id: 'ConnectDesktop' })}>
                      <Button
                        type="text"
                        icon={<i className="iconfont icon-boot" />}
                        onClick={() => enterDesk(item)}
                      ></Button>
                    </Popover>
                    <Popover content={formatMessage({ id: 'RESTART' })}>
                      <AuthButton
                        actions={[Actions.TerminalRWDesktopForceReboot]}
                        disabled={item.status !== DESK_STATUS.START || item.isLock}
                        type="text"
                        icon={<i className="iconfont icon-reboot" />}
                        onClick={() => {
                          restartDesk(item, false);
                        }}
                      ></AuthButton>
                    </Popover>
                    <Popover content={formatMessage({ id: 'SHUT_DOWN' })}>
                      <AuthButton
                        actions={[Actions.TerminalRWDesktopShutdown]}
                        disabled={item.status !== DESK_STATUS.START || item.isLock}
                        type="text"
                        icon={<i className="iconfont icon-shutdown" />}
                        onClick={() => {
                          shutDownDesktop(item);
                        }}
                      ></AuthButton>
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
                      ></Button>
                    </Popover>
                    <AuthDropDown
                      actions={[
                        Actions.TerminalRWDesktopSetOrUnsetDefault,
                        Actions.TerminalRWDesktopAttachOrDetachPrivateDisk,
                      ]}
                      menu={generateMenus(item, [
                        {
                          actionId: 'PersonalDiskManagement',
                          action: (type: any, item: any) => {
                            switch (type) {
                              case 'mount': {
                                const dataDisk = get(item, 'disks', []).filter(
                                  (it: any) => it.isSystem == false,
                                ).length;
                                if (dataDisk >= 2 && item?.os?.includes('Windows Server 2000')) {
                                  message.error({
                                    content:
                                      'Windows Server 2000 已挂满2个数据盘无法继续挂载个人盘',
                                  });
                                  break;
                                }

                                if (
                                  item?.os?.includes('Windows Server 2000') &&
                                  item.status !== DESK_STATUS.STOP
                                ) {
                                  message.error({
                                    content:
                                      'Windows Server 2000 未关机，请先执行关机后再操作挂载个人盘',
                                  });
                                  break;
                                }

                                setAttachIds({
                                  desktopId: item.id,
                                  iaasId: item.iaas.id,
                                  storageType: item.storageType,
                                  hostName: item.hostName ? item.hostName : '',
                                  encrypt: item.encrypt,
                                });
                                break;
                              }
                              case 'unmount':
                                if (
                                  item?.os?.includes('Windows Server 2000') &&
                                  item.status !== DESK_STATUS.STOP
                                ) {
                                  message.error({
                                    content:
                                      'Windows Server 2000 未关机，请先执行关机后再操作卸载个人盘',
                                  });
                                  break;
                                }
                                handleDetach(item);
                                break;
                            }
                          },
                        },
                      ])}
                      placement="bottomRight"
                      trigger={['click']}
                      classNames={{ root: 'desk-more-menu' }}
                      getPopupContainer={() =>
                        document.querySelector(`.desk-item-${index}`) as HTMLElement
                      }
                    >
                      <Button type="text" icon={<i className="iconfont icon-more" />}></Button>
                    </AuthDropDown>
                  </div>
                </div>
              </Col>
            );
          })}
          {deskPoolData?.map((item: any, _index: number) => {
            return (
              <Col span={6}>
                <div
                  className={`deskPool`}
                  onClick={(e) => {
                    e.stopPropagation();
                    getDeskPoolDetail(item.id);
                    setPoolDetailVisible(true);
                  }}
                >
                  <div className="os">
                    <div className="stop-bg">
                      <Deskpool />
                    </div>
                    {transIcon(item?.os)}
                  </div>
                  <Tooltip title={item.name}>
                    <p className="name">
                      <span className="name-text">{item.name}</span>
                      {transType(item)}
                    </p>
                  </Tooltip>
                  <Button
                    onClick={(e: any) => {
                      e.stopPropagation();
                      createDeskFromDeskPool(item);
                    }}
                    className="deskPool-create"
                  >
                    {formatMessage({ id: 'CreateDeskFromDeskPool' })}
                  </Button>
                </div>
              </Col>
            );
          })}
        </Row>
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
    </div>
  );
}
