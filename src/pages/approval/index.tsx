import useRequest from '@/hooks/useRequest';
import { listWorkflow } from '@/services/resource';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/feature/app';
import Actions from '@/utils/actions';
import { hasPermission } from '@/utils/permission';
import type { TablePaginationConfig } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { ApprovalDetailModal, type ApprovalDetailModalRef } from './ApprovalDetailModal';
import CancelWorkflow from './component/cancel';
import Create from './component/create';
import './index.scss';
import {
  getWorkflowTypeLabel,
  RedesignApprovalPage,
  type ApprovalWorkflowItem,
  type ViewWorkflowStatus,
  type WorkflowStatus,
  workflowStatusOrder,
  type WorkflowStatusOption,
} from './redesign';

export function Component() {
  const intl = useIntl();
  const { formatMessage } = intl;
  const cancelWorkflowRef = useRef<any>(null);
  const approvalDetailModalRef = useRef<ApprovalDetailModalRef>(null);
  const currentUser = useAppSelector(selectCurrentUser);

  const [approvalList, setApprovalList] = useState<ApprovalWorkflowItem[]>([]);
  const [queryParams, setQueryParams] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [curWorkflowStatus, setCurWorkflowStatus] = useState<ViewWorkflowStatus>('all');
  const [tips, setTips] = useState<any>({
    label: '',
    selectedItemIds: [],
    selectedItemName: [],
  });
  const [tableChecked, setTableChecked] = useState<ApprovalWorkflowItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const listRequestSeqRef = useRef(0);

  const { run: listWorkflowRun, loading: listWorkflowLoading } = useRequest(listWorkflow, {
    manual: true,
    onSuccess: (res: any, params?: unknown[], requestSeqParam?: number) => {
      const requestSeq =
        typeof requestSeqParam === 'number'
          ? requestSeqParam
          : Array.isArray(params) && typeof params[1] === 'number'
            ? params[1]
            : undefined;

      if (requestSeq !== listRequestSeqRef.current) {
        return;
      }
      setApprovalList(res?.results || []);
      setTotal(res?.totalCount || 0);
    },
  });

  const clearSelection = () => {
    setSelectedRowKeys([]);
    setTableChecked([]);
  };

  const fetchWorkflow = (
    pageNumber = queryParams.pageNumber,
    status: ViewWorkflowStatus = curWorkflowStatus,
  ) => {
    const nextQueryParams = {
      pageNumber,
      pageSize: queryParams.pageSize,
    };
    const requestSeq = ++listRequestSeqRef.current;
    setQueryParams(nextQueryParams);
    listWorkflowRun(
      {
        ...nextQueryParams,
        createUserId: currentUser?.userId,
        status: status === 'all' ? undefined : status,
      },
      requestSeq,
    );
  };

  useEffect(() => {
    if (!currentUser?.userId) {
      return;
    }

    fetchWorkflow(1, curWorkflowStatus);
  }, [currentUser?.userId]);

  const statusLabels = useMemo<Record<WorkflowStatus, string>>(
    () => ({
      pending: formatMessage({ id: 'ApprovalStatusPending' }),
      processing: formatMessage({ id: 'ApprovalStatusProcessing' }),
      success: formatMessage({ id: 'ApprovalStatusSuccess' }),
      reject: formatMessage({ id: 'ApprovalStatusReject' }),
      error: formatMessage({ id: 'ApprovalStatusError' }),
      revoke: formatMessage({ id: 'ApprovalStatusRevoke' }),
    }),
    [formatMessage],
  );

  const statusOptions = useMemo<WorkflowStatusOption[]>(
    () => [
      { label: formatMessage({ id: 'AllStatus' }), value: 'all' },
      ...workflowStatusOrder.map((status) => ({
        label: statusLabels[status],
        value: status,
      })),
    ],
    [formatMessage, statusLabels],
  );

  const pendingCount = useMemo(
    () => approvalList.filter((item) => item.status === 'pending').length,
    [approvalList],
  );

  const handleStatusChange = (status: ViewWorkflowStatus) => {
    setCurWorkflowStatus(status);
    clearSelection();
    fetchWorkflow(1, status);
  };

  const handleRefresh = () => {
    fetchWorkflow(queryParams.pageNumber, curWorkflowStatus);
  };

  const handlePageChange = (page: number) => {
    clearSelection();
    fetchWorkflow(page, curWorkflowStatus);
  };

  const handleDetail = (row: ApprovalWorkflowItem) => {
    approvalDetailModalRef.current?.openModal({ initData: { id: row.id } });
  };

  const handleCancel = (it?: ApprovalWorkflowItem) => {
    let label = '';
    if (it) {
      label = `${formatMessage({ id: 'ConfirmCancel' })}${formatMessage({
        id: 'Approval',
      })} ${getWorkflowTypeLabel(formatMessage, it.workflowType)}？`;
    } else {
      label = `${formatMessage({ id: 'ConfirmCancel' })}${formatMessage({
        id: 'Below',
      })}${formatMessage({ id: 'Approval' })}${formatMessage({
        id: 'S_LBracket',
      })}${formatMessage({ id: 'Quantity' })}${formatMessage({
        id: 'S_Colon',
      })}${selectedRowKeys.length}${formatMessage({ id: 'S_RBracket' })}？`;
    }
    setTips({
      label,
      selectedItemIds: it ? [it.id] : selectedRowKeys,
      selectedItemName: it
        ? []
        : tableChecked.map((row) => ({
            name: `${getWorkflowTypeLabel(formatMessage, row.workflowType)}(${row.createUser || '-'})`,
            id: row.id,
          })),
    });
    setCancelModalVisible(true);
  };

  const paginationProps = useMemo<false | TablePaginationConfig>(() => {
    if (!hasPermission(Actions.TerminalROApplyManageRead)) {
      return false;
    }

    return {
      showSizeChanger: false,
      showQuickJumper: false,
      simple: true,
      size: 'small',
      pageSize: 7,
      total,
      onChange: handlePageChange,
      current: queryParams.pageNumber,
      disabled: listWorkflowLoading,
    };
  }, [
    curWorkflowStatus,
    currentUser?.userId,
    listWorkflowLoading,
    queryParams.pageNumber,
    queryParams.pageSize,
    total,
  ]);

  return (
    <>
      <RedesignApprovalPage
        currentStatus={curWorkflowStatus}
        statusOptions={statusOptions}
        statusLabels={statusLabels}
        rows={approvalList}
        total={total}
        pendingCount={pendingCount}
        loading={listWorkflowLoading}
        selectedRowKeys={selectedRowKeys}
        selectedRows={tableChecked}
        pagination={paginationProps}
        canCancel={hasPermission(Actions.TerminalRWApplyManageCreateOrCancel)}
        canCreate={hasPermission(Actions.TerminalRWApplyManageCreateOrCancel)}
        canRead={hasPermission(Actions.TerminalROApplyManageRead)}
        onRefresh={handleRefresh}
        onStatusChange={handleStatusChange}
        onCreate={() => setCreateModalVisible(true)}
        onCancel={handleCancel}
        onDetail={handleDetail}
        onSelectionChange={(keys, rows) => {
          setSelectedRowKeys(keys);
          setTableChecked(rows);
        }}
        formatMessage={formatMessage}
      />
      <Create
        visible={createModalVisible}
        setVisible={() => setCreateModalVisible(false)}
        refresh={() => {
          setCurWorkflowStatus('all');
          clearSelection();
          fetchWorkflow(1, 'all');
        }}
        formatMessage={formatMessage}
      />
      <CancelWorkflow
        visible={cancelModalVisible}
        setVisible={() => setCancelModalVisible(false)}
        ref={cancelWorkflowRef}
        refresh={() => {
          clearSelection();
          fetchWorkflow(queryParams.pageNumber, curWorkflowStatus);
        }}
        intl={intl}
        formatMessage={formatMessage}
        tips={tips}
      />
      <ApprovalDetailModal ref={approvalDetailModalRef} />
    </>
  );
}
