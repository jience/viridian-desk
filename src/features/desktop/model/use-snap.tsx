import '@/assets/iconfontColor/iconfont-color.css';
import { useState } from 'react';
import type { MenuProps } from '@/shared/ui';
import { Modal } from '@/shared/ui';
import { DESK_STATUS } from '@/utils/constant';
import Actions from '@/utils/actions';
import { getSnapshot, deleteSnapshot, applySnapshot } from '@/services/resource';
import useRequest from '@/hooks/useRequest';
import { authActionShow } from '@/utils/actionAuth';

const useSnap = ({ id, formatMessage, desk }: any) => {
  const [snapList, setSnapList] = useState([]);
  const [visible, setVisible] = useState(false);

  const { run: getSnapshotRun, loading: snapLoading } = useRequest(getSnapshot, {
    manual: true,
    onSuccess: (res: any) => {
      setSnapList(res?.results);
    },
  });

  const { run: deleteSnapshotRun } = useRequest(deleteSnapshot, {
    manual: true,
  });

  const { run: applySnapshotRun } = useRequest(applySnapshot, {
    manual: true,
  });
  // 获取桌面快照数据
  const getDeskSnapshotList = () => {
    const queryData = {
      pageSize: 9999,
      pageNumber: 1,
      desktopId: id,
    };
    getSnapshotRun(queryData);
  };

  //处理桌面列表状态
  const handleDiskStatus = (status: string) => {
    if (['AVAILABLE'].includes(status)) {
      return <i className="iconfontColor icon-correct-green" />;
    } else if (['CREATING', 'ROLLBACK', 'DELETING'].includes(status)) {
      return <i className="iconfontColor icon-ongoing-blue" />;
    } else if (['ERROR', 'ERRORROLLBACKING', 'ERRORDELETING', 'ERRORCREATING'].includes(status)) {
      return <i className="iconfontColor icon-error-red" />;
    } else {
      return <i className="iconfontColor icon-ongoing-blue" />;
    }
  };

  /**
   * @author houruoyang
   * @description 回滚
   */
  const rollback = (data: any) => {
    Modal.confirm({
      icon: null,
      title: (
        <span>
          <i className="iconfont icon-malfunction1 modal-confirm-icon" />
          {formatMessage({ id: 'ROLLBACK_SNAP' })}
        </span>
      ),
      content: formatMessage({ id: 'ROLLBACK_SNAP_MSG' }, { name: data.name }),
      okText: formatMessage({ id: 'SnapRollback' }),
      cancelText: formatMessage({ id: 'CANCEL' }),
      centered: true,
      className: 'desk-detail-snap-confirm-modal',
      width: 500,
      onOk: (close: any) => {
        applySnapshotRun({
          desktopId: id,
          snapshotId: data.id,
        });
        close();
      },
    });
  };

  /**
   * @author houruoyang
   * @description 删除
   */
  const deleteSnap = (data: any) => {
    Modal.confirm({
      icon: null,
      title: (
        <span>
          <i className="iconfont icon-malfunction1 modal-confirm-icon" />
          {formatMessage({ id: 'DELETE_SNAP' })}
        </span>
      ),
      content: formatMessage({ id: 'DELETE_SNAP_MSG' }, { name: data.name }),
      okText: formatMessage({ id: 'DELETE' }),
      cancelText: formatMessage({ id: 'CANCEL' }),
      centered: true,
      className: 'desk-detail-snap-confirm-modal',
      width: 500,
      onOk: (close: any) => {
        deleteSnapshotRun({
          desktopId: id,
          snapshotIds: [data.id],
        });
        close();
      },
    });
  };

  const menu = (row: any): MenuProps => {
    const items: MenuProps['items'] = [];

    if (authActionShow([Actions.TerminalRWSnapshotRollback])) {
      items.push({
        key: 'rollback',
        label: formatMessage({ id: 'SnapRollback' }),
        disabled:
          !(desk?.status === DESK_STATUS.STOP && row.status === 'AVAILABLE') || desk?.isLock,
        onClick: () => {
          rollback(row);
        },
      });
    }

    if (authActionShow([Actions.TerminalRWSnapshotCreateOrDelete])) {
      items.push({
        key: 'delete',
        label: formatMessage({ id: 'DELETE' }),
        disabled:
          !['ERROR', 'UNKNOWN', 'AVAILABLE'].includes(row?.status) ||
          ![DESK_STATUS.STOP, DESK_STATUS.START].includes(desk?.status) ||
          desk?.isLock,
        onClick: () => {
          deleteSnap(row);
        },
      });
    }

    return { items };
  };

  return {
    snapList,
    snapLoading,
    menu,
    handleDiskStatus,
    getDeskSnapshotList,
    visible,
    setVisible,
  };
};

export default useSnap;
