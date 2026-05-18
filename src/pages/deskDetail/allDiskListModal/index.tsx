import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import './index.scss';
import { Modal, Empty } from '@/ui';
import TableCommon from '@/components/TableCommon';
import useDeskDetail from '../useDeskDetail';

const AllDiskListModal = (props: any) => {
  const { formatMessage } = useIntl();

  const { title, visiable, setVisiable, transitionName = 'ant-zoom-big-fast', desktopId } = props;

  const { loading, totalDiskCount, diskList, diskListParams, setDiskListParams, refreshDiskList } =
    useDeskDetail({
      id: desktopId,
      formatMessage,
      history,
    });

  // other
  const statusAdepter = (statue: string) => {
    const statuMap: {
      [key: string]: any;
    } = {
      Attached: <i className="iconfontColor icon-binding-green selfIcon" />,
      Updating: <i className="iconfontColor icon-ongoing-yellow selfIcon" />,
      Error: <i className="iconfontColor icon-alarm-red selfIcon" />,
    };
    return statuMap[statue];
  };

  const columns = [
    {
      title: formatMessage({ id: 'NAME' }),
      dataIndex: 'name',
      key: 'name',
      width: '150px',
    },
    {
      title: formatMessage({ id: 'STATUS' }),
      dataIndex: 'status',
      key: 'status',
      width: '150px',
      render: (value: string) => {
        return (
          <div className="statuBox">
            {statusAdepter(value)}
            {formatMessage({ id: value })}
          </div>
        );
      },
    },
    {
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 120,
      title: formatMessage({ id: 'Purpose' }),
      render(value: any) {
        return (
          <span>
            {value ? formatMessage({ id: 'SystemDisk' }) : formatMessage({ id: 'DataDisk' })}
          </span>
        );
      },
    },
    {
      title: formatMessage({ id: 'Size' }) + '（GB）',
      dataIndex: 'size',
      key: 'size',
      width: '150px',
    },
  ];

  useEffect(() => {
    if (visiable) {
      refreshDiskList();
    }
  }, [visiable, diskListParams]);

  const titleSlot = (
    <div className="titleSlot-box">
      <i className="iconfont icon-hardisk icon" />
      <div className="title">{title}</div>
    </div>
  );

  return (
    <Modal
      title={titleSlot}
      open={visiable}
      keyboard={false}
      transitionName={transitionName}
      // showCancelButton={false}
      okText={formatMessage({ id: 'IKnow' })}
      cancelText={formatMessage({ id: 'Cancel' })}
      onCancel={() => {
        setVisiable(false);
      }}
      afterClose={() => {
        setDiskListParams({
          pageNumber: 1,
          pageSize: 10,
        });
      }}
      onOk={() => {
        setVisiable(false);
      }}
      closable
      centered
      className="AllDiskListModal"
      width={'70%'}
      destroyOnHidden
    >
      <TableCommon
        onRefresh={() => refreshDiskList()}
        total={totalDiskCount}
        columns={columns}
        loading={loading}
        rowKey="id"
        dataSource={diskList}
        params={diskListParams}
        onTableChange={(param: any) => setDiskListParams({ ...param })}
        emptyText={<Empty />}
        checkable={false}
        scroll={{
          scrollToFirstRowOnChange: true,
          y: '250px',
        }}
        extraParams={['desktopId', 'statusList', 'attribute']}
        showColumnsSetting={false}
      />
    </Modal>
  );
};

export default AllDiskListModal;
