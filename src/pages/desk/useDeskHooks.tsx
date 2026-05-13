import useRequest from '@/hooks/useRequest';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/feature/app';
import { selectAutoGateway, selectConnected, selectNetwork } from '@/store/feature/gateway';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { authActionShow } from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { DESK_STATUS, getStatus } from '@/utils/constant';
import { formatI18NKey } from '@/utils/utils';
import { invoke } from '@tauri-apps/api/core';
import type { MenuProps } from 'antd';
import { message, Modal, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  createDesktopFromPool,
  listDesktopPool,
  listResourceUser,
  rebootDesktop,
  setAutoDesktop,
  shutdownDesktop,
  stopDesktop,
} from '../../services/resource';

//转义桌面状态
export const transStatus = (status: string = '', locked: boolean = false) => {
  if (locked) {
    return (
      <Tooltip title={formatI18NKey('Lock')}>
        <i
          className="iconfontColor icon-alarm-yellow"
          // placeholder={undefined}
          // onPointerEnterCapture={undefined}
          // onPointerLeaveCapture={undefined}
        />
      </Tooltip>
    );
  }
  const { title, type } = getStatus(status);
  if (type === 'success') {
    return (
      <Tooltip title={title}>
        <div className="desk-status-outBox">
          <i
            className="iconfontColor icon-operation-green"
            // placeholder={undefined}
            // onPointerEnterCapture={undefined}
            // onPointerLeaveCapture={undefined}
          />
        </div>
      </Tooltip>
    );
  } else if (type === 'default') {
    return (
      <Tooltip title={title}>
        <div className="desk-status-outBox">
          <i
            className="iconfontColor icon-close-grey"
            // placeholder={undefined}
            // onPointerEnterCapture={undefined}
            // onPointerLeaveCapture={undefined}
          />
        </div>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title={title}>
        <div className="desk-status-outBox">
          <i
            className="iconfontColor icon-alarm-yellow"
            // placeholder={undefined}
            // onPointerEnterCapture={undefined}
            // onPointerLeaveCapture={undefined}
          />
        </div>
      </Tooltip>
    );
  }
};

const useDeskHooks = (props: any) => {
  const intl = useIntl();
  const { isFullScreen } = props;
  const isThin = useAppSelector(selectIsThin);

  const [appKeys, _setAppKeys] = useState('');
  const [deskData, setDeskData] = useState([]);
  const [deskPoolData, setDeskPoolData] = useState([]);
  const [isLoadingDesk, setIsLoadingDesk] = useState(false); //是否正在进入桌面
  const [checkDeskPoolItem, setCheckDeskPoolItem] = useState();
  // 进入桌面文案
  const [loadingDeskText, _setLoadingDeskText] = useState('开启桌面中...');

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const autoGateway = useAppSelector(selectAutoGateway);
  const currentUser = useAppSelector(selectCurrentUser);

  const [modalWidth, setModalWidth] = useState(500);

  // 查桌面列表
  const {
    run: listResourceUserRun,
    loading: deskLoading,
    refresh: listResourceUserRefresh,
  } = useRequest(listResourceUser, {
    manual: true,
    onSuccess: (res: any) => {
      setDeskData(res?.results);
    },
  });

  // 查桌面池列表
  const {
    run: listDesktopPoolRun,
    loading: deskPoolLoading,
    refresh: listDesktopPoolRefresh,
  } = useRequest(listDesktopPool, {
    manual: true,
    onSuccess: (res: any) => {
      setDeskPoolData(res?.results);
    },
  });

  // 设置默认桌面
  const { run: setAutoDesktopRun } = useRequest(setAutoDesktop, {
    manual: true,
    onSuccess: (res: any) => {
      const messageId = res?.isDefault ? 'SUCCESS_DESKTOP_SET_AUTO' : 'SUCCESS_DESKTOP_CANCEL_AUTO';
      message.success(intl.formatMessage({ id: messageId }, { name: res?.name }));
      listResourceUserRefresh();
    },
  });

  // 重启
  const { run: rebootDesktopRun } = useRequest(rebootDesktop, {
    manual: true,
    onSuccess: () => {
      listResourceUserRefresh();
    },
  });

  // 关机
  const { run: stopDesktopRun } = useRequest(stopDesktop, {
    manual: true,
    onSuccess: () => {
      listResourceUserRefresh();
    },
  });

  // 关闭电源
  const { run: shutdownDesktopRun } = useRequest(shutdownDesktop, {
    manual: true,
    onSuccess: () => {
      listResourceUserRefresh();
    },
  });

  // 池创桌面
  const { run: createDesktopFromPoolRun } = useRequest(createDesktopFromPool, {
    manual: true,
    onSuccess: () => {
      listResourceUserRefresh();
      listDesktopPoolRefresh();
    },
  });

  const resize = () => {
    const docEl = document.documentElement;

    // set 1rem = viewWidth / 10
    function setRemUnit() {
      const remWidth = docEl.clientWidth / 3;

      if (!isFullScreen && !isThin) {
        setModalWidth(500);
      } else {
        setModalWidth(remWidth);
      }
    }

    setRemUnit();
  };

  //网络连接情况
  function getNetworkClass() {
    if (!autoGateway) return '';
    if (!network) return 'info';
    if (!connected) return 'danger';
    return 'success';
  }

  // 获取桌面数据
  const getDeskList = () => {
    const queryData = {
      pageSize: 9999,
      pageNumber: 1,
    };
    listResourceUserRun(queryData);
  };

  //获取桌面池
  const getDeskPoolList = () => {
    const queryData = {
      pageSize: 9999,
      pageNumber: 1,
      returnDetail: true,
    };
    listDesktopPoolRun(queryData);
  };

  const getDeskPoolDetail = (detId: any) => {
    setCheckDeskPoolItem(deskPoolData?.find((i: any) => i?.id == detId));
  };

  //设为默认、取消默认桌面
  const setAutoDesktopFun = (desktopId: string, _name: string) => {
    setAutoDesktopRun({
      desktopId,
    });
  };

  //桌面重启/强制重启
  const restartDesk = (data: any, force: any) => {
    Modal.confirm({
      icon: null,
      title: intl.formatMessage({
        id: `${force ? 'DESK_FORCERESTART' : 'DESK_RESTART'}`,
      }),
      content: (
        <div>
          {force ? intl.formatMessage({ id: 'FORCERESTART_DESK_TIPS' }) : ''}
          {intl.formatMessage({ id: `SURE_TO` })}
          <Tag color="blue">{data.name}</Tag>
          {intl.formatMessage({
            id: `${force ? 'FORCERESTART_DESK_MSG' : 'RESTART_DESK_MSG'}`,
          })}
        </div>
      ),

      okText: intl.formatMessage({
        id: `${force ? 'FORCERESTART' : 'RESTART'}`,
      }),
      cancelText: intl.formatMessage({ id: 'CANCEL' }),
      centered: true,
      onOk: (close: any) => {
        rebootDesktopRun({
          ids: [data.id],
          force,
        });
        close();
      },
    });
  };
  // 关机
  const shutDownDesktop = (data: any) => {
    Modal.confirm({
      icon: null,
      title: (
        <span>
          <i
            className="iconfont icon-malfunction1"
            style={{
              color: '#F0A332',
              marginRight: '5px',
            }}
          />
          {intl.formatMessage({ id: `DESK_SHUT_DOWN` })}
        </span>
      ),
      content: (
        <div>
          {intl.formatMessage({ id: `SURE_TO` })}
          <Tag color="blue">{data.name}</Tag>
          {intl.formatMessage({ id: 'SHUT_DOWN_DESKTOP_MSG' })}
        </div>
      ),
      okText: intl.formatMessage({ id: `SHUT_DOWN` }),
      cancelText: intl.formatMessage({ id: 'CANCEL' }),
      centered: true,
      width: modalWidth,
      onOk: (close: any) => {
        stopDesktopRun({
          ids: [data.id],
          isReleaseResource: data?.desktopPool?.isKeepData || false,
        });
        close();
      },
    });
  };

  // 关闭电源
  const shutDownDesktopForce = (data: any) => {
    Modal.confirm({
      icon: null,
      title: intl.formatMessage({ id: `DESK_SHUTDOWNDESTOP` }),
      content: (
        <div>
          {intl.formatMessage({ id: 'SHUT_DOWN_DESKTOP_TIPS' })}
          {intl.formatMessage({ id: `SURE_TO` })}
          <Tag color="blue">{data.name}</Tag>
          {intl.formatMessage({ id: 'SHUT_DOWN_DESKTOP_STOP_MSG' })}
        </div>
      ),
      okText: intl.formatMessage({ id: `SHUTDOWNDESTOP` }),
      cancelText: intl.formatMessage({ id: 'CANCEL' }),
      centered: true,
      width: modalWidth,
      onOk: (close: any) => {
        shutdownDesktopRun({
          ids: [data.id],
          isReleaseResource: data?.desktopPool?.isKeepData || false,
        });
        close();
      },
    });
  };

  const distribute = (data: any, key: any, clickActions?: any) => {
    switch (key) {
      case 'cancelDefaultItem':
        setAutoDesktopFun('', data.name);
        break;
      case 'setDefayltItem':
        setAutoDesktopFun(data.id, data.name);
        break;
      case 'forcerRestart':
        restartDesk(data, true);
        break;
      case 'forcerShutdown':
        shutDownDesktopForce(data);
        break;
      case 'unmountItem':
        clickActions.map((clickAction: any) => {
          if (clickAction.actionId === 'PersonalDiskManagement') {
            clickAction.action('unmount', data);
          }
        });
        break;
      case 'mountItem':
        clickActions.map((clickAction: any) => {
          if (clickAction.actionId === 'PersonalDiskManagement') {
            clickAction.action('mount', data);
          }
        });
        break;
    }
  };
  //生成操作菜单
  function generateMenus(data: any, clickActions: Array<any>): MenuProps {
    const personalDisk = data.disks
      ? data.disks.filter((disk: any) => disk.attribute === 'personal')
      : [];

    const items: MenuProps['items'] = [];

    // 取消/设置默认
    if (authActionShow([Actions.TerminalRWDesktopSetOrUnsetDefault])) {
      items.push({
        key: data.isDefault ? 'cancelDefaultItem' : 'setDefayltItem',
        label: (
          <p>
            {intl.formatMessage({
              id: data.isDefault ? 'CANCEL_DEFAULT' : 'SET_DEFAULT',
            })}
          </p>
        ),
      });
    }

    // 强制重启
    if (authActionShow([Actions.TerminalRWDesktopForceReboot])) {
      items.push({
        key: 'forcerRestart',
        label: <p>{intl.formatMessage({ id: 'FORCERESTART' })}</p>,
        disabled: ![DESK_STATUS.START, DESK_STATUS.REBOOTING].includes(data.status) || data.isLock,
      });
    }

    // 强制关机
    if (authActionShow([Actions.TerminalRWDesktopShutdown])) {
      items.push({
        key: 'forcerShutdown',
        label: <p>{intl.formatMessage({ id: 'SHUTDOWNDESTOP' })}</p>,
        disabled: ![DESK_STATUS.START, DESK_STATUS.STOPPING].includes(data.status) || data.isLock,
      });
    }

    // 个人盘挂载/卸载
    if (authActionShow([Actions.TerminalRWDesktopAttachOrDetachPrivateDisk])) {
      items.push({
        key: personalDisk.length ? 'unmountItem' : 'mountItem',
        label: (
          <p>
            {intl.formatMessage({
              id: personalDisk.length ? 'PersonalDiskUnmounted' : 'PersonalDiskMounted',
            })}
          </p>
        ),
        disabled:
          data.locked ||
          (personalDisk.length
            ? ![DESK_STATUS.STOP].includes(data.status)
            : ![DESK_STATUS.START, DESK_STATUS.STOP].includes(data.status)) ||
          data.desktopPool.type === 'SHARE',
      });
    }

    return {
      items,
      className: 'deskAcitonMenu',
      onClick: ({ domEvent, key }) => {
        domEvent.stopPropagation();
        distribute(data, key, clickActions);
      },
    };
  }

  const transType = (item: any) => {
    if (item.type === 'SHARE') {
      return <i className="iconfont icon-shared-desktop"></i>;
    } else if (item.type === 'RESTORE') {
      return <i className="iconfont icon-reductive"></i>;
    } else {
      return <i className="iconfont icon-exclusive1"></i>;
    }
  };

  //进入桌面
  const enterDesk = async (data: any) => {
    const activeStatus = [
      DESK_STATUS.START,
      DESK_STATUS.STOP,
      DESK_STATUS.STOPRETAIN,
      DESK_STATUS.PAUSED,
    ];

    if (activeStatus.includes(data.status) && !data.isLock) {
      if (data?.sessionStatus == '1') {
        message.warning(intl.formatMessage({ id: 'DESK_INUSING' }));
        return;
      }

      if (getNetworkClass() === 'success') {
        setIsLoadingDesk(true);
      } else {
        message.warning(intl.formatMessage({ id: 'NewWorkFail' }));
        return false;
      }
      try {
        const req = {
          desktopId: data.id,
          desktopIp: '127.0.0.1',
          macAddress: 'FF:FF:FF:FF',
        };
        if (data.interfaces && data.interfaces.length > 0) {
          req.desktopIp = data.interfaces[0].ip;
          req.macAddress = data.interfaces[0].macAddress;
        }
        console.log('req:', req);
        await invoke('connect_desktop', req);
      } catch (error) {
        console.error('Error connecting to desktop:', error);
        message.error(intl.formatMessage({ id: 'DESK_CONNECT_ERROR' }));
      }
    } else {
      message.warning(intl.formatMessage({ id: 'DesktopConnectionTimeout' }));
      return false;
    }
  };

  const createDeskFromDeskPool = (item: any) => {
    Modal.confirm({
      icon: null,
      title: intl.formatMessage({ id: 'CreatDesk' }),
      content: intl.formatMessage({ id: 'SureCreateDeskFromDeskPool' }, { name: item.name }),
      okText: intl.formatMessage({ id: 'SURE' }),
      cancelText: intl.formatMessage({ id: 'CANCEL' }),
      centered: true,
      width: modalWidth,
      onOk: (close: any) => {
        createDesktopFromPoolRun({
          poolId: item.id,
          count: 1,
          userId: currentUser?.userId,
        });
        close();
      },
    });
  };

  useEffect(() => {
    //获取桌面
    getDeskList();
    //获取桌面池
    getDeskPoolList();
    resize();
  }, []);

  return {
    transStatus,
    appKeys,
    deskData,
    deskPoolData,
    deskLoading,
    deskPoolLoading,
    generateMenus,
    shutDownDesktop,
    shutDownDesktopForce,
    restartDesk,
    isLoadingDesk,
    enterDesk,
    createDeskFromDeskPool,
    checkDeskPoolItem,
    setCheckDeskPoolItem,
    getDeskPoolDetail,
    getDeskList,
    getDeskPoolList,
    transType,
    loadingDeskText,
    listResourceUserRefresh,
    listDesktopPoolRefresh,
    setIsLoadingDesk,
  };
};

export default useDeskHooks;
