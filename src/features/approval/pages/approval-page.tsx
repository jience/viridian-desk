import { Button, Dropdown, Empty, Select, Space, Table, Tooltip } from '@/shared/ui/fast';
import type { ColumnsType, ItemType, TablePaginationConfig } from '@/shared/ui/fast';
import type { Key, ReactNode } from 'react';
import type { MessageFormatterShape } from '@/utils/message-format';
import {
  getWorkflowTypeLabel,
  isWorkflowStatus,
  type ApprovalWorkflowItem,
  type ViewWorkflowStatus,
  type WorkflowStatus,
  type WorkflowStatusOption,
} from '../model/approval-utils';
import './approval-page.scss';

const statusToneMap: Record<WorkflowStatus, string> = {
  pending: 'processing',
  processing: 'warning',
  success: 'success',
  reject: 'danger',
  error: 'danger',
  revoke: 'default',
};

const isCancelable = (row: ApprovalWorkflowItem) => row.status === 'pending';
const toText = (value: ReactNode) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const toOptionKey = (value: unknown) => String(value ?? '');

export interface ApprovalPageProps {
  currentStatus: ViewWorkflowStatus;
  statusOptions: WorkflowStatusOption[];
  statusLabels: Record<WorkflowStatus, string>;
  rows: ApprovalWorkflowItem[];
  total: number;
  pendingCount: number;
  loading: boolean;
  selectedRowKeys: string[];
  selectedRows: ApprovalWorkflowItem[];
  pagination: false | TablePaginationConfig;
  canCancel: boolean;
  canCreate: boolean;
  canRead: boolean;
  onRefresh: () => void;
  onStatusChange: (value: ViewWorkflowStatus) => void;
  onCreate: () => void;
  onCancel: (row?: ApprovalWorkflowItem) => void;
  onDetail: (row: ApprovalWorkflowItem) => void;
  onSelectionChange: (keys: string[], rows: ApprovalWorkflowItem[]) => void;
  formatMessage: MessageFormatterShape['formatMessage'];
}

export function ApprovalPage(props: ApprovalPageProps) {
  const refreshLabel = props.formatMessage({ id: 'REFRESH', defaultMessage: 'Refresh' });
  const activeStatusLabel =
    toText(props.statusOptions.find((option) => option.value === props.currentStatus)?.label) ||
    props.formatMessage({ id: 'AllStatus' });
  const batchCancelDisabled =
    props.loading ||
    props.selectedRowKeys.length === 0 ||
    props.selectedRows.some((row) => !isCancelable(row));

  const renderStatus = (status?: ApprovalWorkflowItem['status']) => {
    if (!isWorkflowStatus(status)) {
      return '-';
    }

    const label = props.statusLabels[status];
    if (!label) {
      return '-';
    }

    return (
      <span className={`approval-status approval-status--${statusToneMap[status]}`}>{label}</span>
    );
  };

  const getRowActions = (row: ApprovalWorkflowItem): ItemType[] => {
    const items: ItemType[] = [];

    if (props.canRead) {
      items.push({
        key: 'detail',
        label: props.formatMessage({ id: 'DetailInfo' }),
        onClick: () => props.onDetail(row),
      });
    }

    if (props.canCancel) {
      items.push({
        key: 'cancel',
        label: props.formatMessage({ id: 'CancelWorkflow' }),
        disabled: !isCancelable(row),
        onClick: () => props.onCancel(row),
      });
    }

    return items;
  };

  const columns: ColumnsType<ApprovalWorkflowItem> = [
    {
      title: props.formatMessage({ id: 'WorkflowTemplate' }),
      dataIndex: 'workflowType',
      key: 'workflowType',
      render: (workflowType: ApprovalWorkflowItem['workflowType']) =>
        getWorkflowTypeLabel(props.formatMessage, workflowType),
    },
    {
      title: props.formatMessage({ id: 'Approver' }),
      dataIndex: 'approveUser',
      key: 'approveUser',
      width: 170,
      render: (approveUser: ApprovalWorkflowItem['approveUser']) =>
        approveUser ? (
          <span className="approval-page__name" title={approveUser}>
            {approveUser}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: props.formatMessage({ id: 'STATUS' }),
      dataIndex: 'status',
      key: 'status',
      width: 132,
      render: renderStatus,
    },
    {
      title: props.formatMessage({ id: 'ApplyTime' }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 190,
      render: (createTime: ApprovalWorkflowItem['createTime']) => createTime || '-',
    },
    ...(props.canRead || props.canCancel
      ? ([
          {
            title: props.formatMessage({ id: 'ACTION' }),
            dataIndex: 'action',
            key: 'action',
            width: 112,
            render: (_value, row) => (
              <Dropdown menu={{ items: getRowActions(row) }} trigger={['click']}>
                <Button
                  aria-label={props.formatMessage({ id: 'ACTION' })}
                  icon={<i className="iconfont icon-more" />}
                  type="text"
                />
              </Dropdown>
            ),
          },
        ] satisfies ColumnsType<ApprovalWorkflowItem>)
      : []),
  ];

  const rowSelection = {
    selectedRowKeys: props.selectedRowKeys,
    onChange: (keys: Key[], rows: ApprovalWorkflowItem[]) => {
      props.onSelectionChange(
        keys.map((key) => String(key)),
        rows,
      );
    },
  };

  return (
    <main className="approval-page">
      <header className="approval-page__header">
        <div className="approval-page__heading">
          <span>{props.formatMessage({ id: 'ApprovalWorkbenchEyebrow' })}</span>
          <h1>{props.formatMessage({ id: 'ApprovalWorkbenchTitle' })}</h1>
          <p>
            {props.formatMessage(
              { id: 'ApprovalWorkbenchSummary' },
              {
                count: props.total,
                pending: props.pendingCount,
                status: activeStatusLabel,
              },
            )}
          </p>
        </div>

        <Space className="approval-page__actions" wrap>
          {props.canCancel && (
            <Tooltip title={props.formatMessage({ id: 'CancelWorkflow' })}>
              <Button
                icon={<i className="iconfont icon-file-cancel" />}
                disabled={batchCancelDisabled}
                onClick={() => props.onCancel()}
              >
                {props.formatMessage({ id: 'CancelWorkflow' })}
              </Button>
            </Tooltip>
          )}
          <Button
            loading={props.loading}
            icon={<i className="iconfont icon-refresh" />}
            onClick={props.onRefresh}
          >
            {refreshLabel}
          </Button>
          {props.canCreate && (
            <Button
              type="primary"
              icon={<i className="iconfont icon-add" />}
              onClick={props.onCreate}
            >
              {props.formatMessage({ id: 'CreateWorkflow' })}
            </Button>
          )}
        </Space>
      </header>

      <section className="approval-page__filters">
        <div
          aria-label={props.formatMessage({ id: 'STATUS' })}
          className="approval-page__segmented"
          role="group"
        >
          {props.statusOptions.map((option) => {
            const active = option.value === props.currentStatus;

            return (
              <button
                aria-pressed={active}
                className={active ? 'is-active' : ''}
                key={toOptionKey(option.value)}
                type="button"
                onClick={() => props.onStatusChange(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="approval-page__compact-filters">
        <Select<ViewWorkflowStatus>
          aria-label={props.formatMessage({ id: 'STATUS' })}
          value={props.currentStatus}
          options={props.statusOptions}
          onChange={props.onStatusChange}
        />
      </div>

      <Table<ApprovalWorkflowItem>
        rowKey="id"
        rowSelection={props.canCancel ? rowSelection : undefined}
        className="approval-page__table"
        columns={columns}
        dataSource={props.rows}
        pagination={props.pagination}
        loading={props.loading}
        locale={{
          emptyText: (
            <section className="approval-page__empty">
              <Empty description={props.formatMessage({ id: 'ApprovalWorkbenchEmptyTitle' })} />
              <p>{props.formatMessage({ id: 'ApprovalWorkbenchEmptyDescription' })}</p>
              {props.canCreate && (
                <Button
                  type="primary"
                  icon={<i className="iconfont icon-add" />}
                  onClick={props.onCreate}
                >
                  {props.formatMessage({ id: 'CreateWorkflow' })}
                </Button>
              )}
            </section>
          ),
        }}
      />
    </main>
  );
}
