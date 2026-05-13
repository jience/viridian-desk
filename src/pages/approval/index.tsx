import { DropdownBtn } from '@/components/Dropdown';
import useRequest from '@/hooks/useRequest';
import { listWorkflow } from '@/services/resource';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/feature/app';
import ActionAuth, { authActionShow } from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { hasPermission } from '@/utils/permission';
import { Button, Space, Table, Tooltip } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { ApprovalDetailModal, type ApprovalDetailModalRef } from './ApprovalDetailModal';
import CancelWorkflow from './component/cancel';
import Create from './component/create';
import './index.scss';
import { getWorkflowStatus, workflowStatus, workflowTempList_zh_Cn } from './utils';

const ActionDropdown = ActionAuth(DropdownBtn);

export function Component() {
  const intl = useIntl();
  const { formatMessage } = intl;
  const cancelWorkflowRef = useRef<any>(null);
  const approvalDetailModalRef = useRef<ApprovalDetailModalRef>(null);
  const currentUser = useAppSelector(selectCurrentUser);

  const [approvalList, setApprovalList] = useState([]);
  const [queryParams, setQueryParams] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [tips, setTips] = useState<any>({
    label: '',
    selectedItemIds: [],
    selectedItemName: [],
  });

  const [tableChecked, setTableChecked] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // 获取流程列表
  const {
    run: listWorkflowRun,
    loading: listWorkflowLoading,
    refresh: listWorkflowRefresh,
  } = useRequest(listWorkflow, {
    manual: true,
    onSuccess: (res: any) => {
      setApprovalList(res?.results);
      setTotal(res?.totalCount);
    },
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setTableChecked(selectedRows);
    },
  };

  const fetchWorkflow = (pageNumber = queryParams.pageNumber) => {
    listWorkflowRun({
      pageNumber: pageNumber,
      pageSize: queryParams.pageSize,
      createUserId: currentUser?.userId,
    });
  };

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const handleCancel = (it?: any) => {
    let label = '';
    if (it) {
      label = `${formatMessage({
        id: 'ConfirmCancel',
      })}${formatMessage({ id: 'Approval' })} ${it.name}？`;
    } else {
      label = `${formatMessage({
        id: 'ConfirmCancel',
      })}${formatMessage({
        id: 'Below',
      })}${formatMessage({
        id: 'Approval',
      })}${formatMessage({ id: 'S_LBracket' })}${formatMessage({
        id: 'Quantity',
      })}${formatMessage({
        id: 'S_Colon',
      })}${selectedRowKeys.length}${formatMessage({
        id: 'S_RBracket',
      })}？`;
    }
    setTips({
      label,
      selectedItemIds: it ? [it?.id] : selectedRowKeys,
      selectedItemName: it
        ? []
        : tableChecked.map((row: any) => {
            const workflowType = row?.workflowType as keyof typeof workflowTempList_zh_Cn;
            return {
              name: `${workflowTempList_zh_Cn[workflowType]}(${row.createUser})`,
              id: row.id,
            };
          }),
    });
    setCancelModalVisible(true);
  };

  const handlePageChange = (page: any, _pageSize: any) => {
    setQueryParams({ ...queryParams, pageNumber: page });
    fetchWorkflow(page);
  };

  const cancelDisable = useMemo(() => {
    let checkNum = 0;
    let cancelDisabled = true;

    if (tableChecked?.length > 0) {
      for (const it of tableChecked) {
        if (it?.status === 'pending') {
          checkNum++;
        }
      }
      if (checkNum === tableChecked.length) {
        cancelDisabled = false;
      }
    }

    return cancelDisabled;
  }, [tableChecked]);

  const columns: ColumnsType = [
    {
      title: formatMessage({ id: 'WorkflowTemplate' }),
      dataIndex: 'workflowType',
      key: 'workflowType',
      render: (row: any) => {
        const rowTemp = row as keyof typeof workflowTempList_zh_Cn;
        return workflowTempList_zh_Cn[rowTemp] || '-';
      },
    },
    {
      title: formatMessage({ id: 'Approver' }),
      dataIndex: 'approveUser',
      key: 'approveUser',
      render: (text: any) => {
        return (
          <span title={text || '-'} className="approveUser-name">
            {text || '-'}
          </span>
        );
      },
    },
    {
      title: formatMessage({ id: 'STATUS' }),
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof workflowStatus, _row: any) => {
        return (
          <span className={`approval-status ${getWorkflowStatus(status).type}-status`}>
            {workflowStatus[status]}
          </span>
        );
      },
    },
    {
      title: formatMessage({ id: 'ApplyTime' }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: '1.6rem',
    },
    ...(authActionShow([Actions.TerminalRWApplyManageCreateOrCancel])
      ? [
          {
            title: formatMessage({ id: 'ACTION' }),
            dataIndex: 'action',
            key: 'action',
            width: '1rem',
            render: (_value: any, row: any) => {
              const options = [
                {
                  key: 'CancelWorkflow',
                  label: formatMessage({ id: 'CancelWorkflow' }),
                  action: Actions.TerminalRWApplyManageCreateOrCancel,
                  disabled: row.status !== 'pending',
                  onClick: () => {
                    const workflowType = row?.workflowType as keyof typeof workflowTempList_zh_Cn;
                    handleCancel({
                      id: row?.id,
                      name: `${workflowTempList_zh_Cn[workflowType]}(${row.createUser})`,
                    });
                  },
                },
                {
                  key: 'ApproveDetail',
                  label: formatMessage({ id: 'DetailInfo' }),
                  action: Actions.TerminalROApplyManageRead,
                  onClick: () => {
                    approvalDetailModalRef.current?.openModal({ initData: { id: row.id } });
                  },
                },
              ]
                .filter((item) => {
                  return hasPermission(item.action);
                })
                .map((i) => {
                  const res: ItemType = {
                    key: i.key,
                    label: i.label,
                    disabled: i.disabled,
                    onClick: i.onClick,
                  };
                  return res;
                });
              return (
                <ActionDropdown
                  title=""
                  icon="more"
                  btnSize="small"
                  options={options}
                  btnType="text"
                  placement="bottom"
                />
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="panel approval-list">
      <div className="panel-header approval-header">
        <Space>
          <Tooltip title={intl.formatMessage({ id: 'CancelWorkflow' })}>
            {hasPermission(
              Actions.TerminalRWApplyManageCreateOrCancel,
              <Button
                icon={<i className="iconfont icon-file-cancel"></i>}
                disabled={cancelDisable || listWorkflowLoading}
                onClick={() => handleCancel()}
              />,
            )}
          </Tooltip>
          <Button
            icon={<i className="iconfont icon-refresh"></i>}
            onClick={() => listWorkflowRefresh()}
          />
        </Space>
        {hasPermission(
          Actions.TerminalRWApplyManageCreateOrCancel,
          <Button
            type="primary"
            icon={<i className="iconfont icon-add"></i>}
            onClick={() => setCreateModalVisible(true)}
          ></Button>,
        )}
      </div>
      <Table
        rowKey="id"
        rowSelection={rowSelection}
        className="pretty-large-table"
        columns={columns}
        dataSource={approvalList}
        pagination={
          hasPermission(Actions.TerminalROApplyManageRead)
            ? {
                showSizeChanger: false,
                showQuickJumper: false,
                simple: true,
                size: 'small',
                pageSize: 7,
                total,
                onChange: handlePageChange,
                current: queryParams.pageNumber,
              }
            : false
        }
        loading={listWorkflowLoading}
      />
      <Create
        visible={createModalVisible}
        setVisible={() => setCreateModalVisible(false)}
        refresh={() => {
          setQueryParams({ ...queryParams, pageNumber: 1 });
          fetchWorkflow(1);
        }}
        formatMessage={formatMessage}
      ></Create>
      <CancelWorkflow
        visible={cancelModalVisible}
        setVisible={() => setCancelModalVisible(false)}
        ref={cancelWorkflowRef}
        refresh={() => {
          fetchWorkflow();
        }}
        intl={intl}
        formatMessage={formatMessage}
        tips={tips}
      ></CancelWorkflow>
      <ApprovalDetailModal ref={approvalDetailModalRef} />
    </div>
  );
}
