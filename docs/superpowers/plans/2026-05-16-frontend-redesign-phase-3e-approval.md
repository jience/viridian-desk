# Frontend Redesign Phase 3E Approval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/app/approval` with the approved approval workbench while preserving current workflow list, create, cancel, detail, pagination, permission, and modal behavior.

**Architecture:** Keep `src/pages/approval/index.tsx` as the data controller and API boundary. Add `src/pages/approval/redesign/` as a focused presentation layer for the header, status filters, table, empty state, and responsive styling. Reuse existing `Create`, `CancelWorkflow`, `ApprovalDetailModal`, `listWorkflow`, and permission helpers.

**Tech Stack:** React, TypeScript, SCSS, Ant Design primitives already in the app, `react-intl` legacy locale files, existing Tauri/Vite build pipeline.

---

## File Map

- Create `src/pages/approval/redesign/index.tsx`: presentational approval workbench, status filters, workflow table columns, row actions, empty state, and workflow/status label helpers.
- Create `src/pages/approval/redesign/index.scss`: scoped workbench styling for dark/light themes, responsive filters, table scrolling, status tokens, and focus states.
- Modify `src/pages/approval/index.tsx`: keep data and modal state, add status filter and request ordering guard, clear invalid selections, render `RedesignApprovalPage`.
- Modify `src/locales/zh-CN.js`, `src/locales/en-US.js`, `src/locales/zh-TW.js`: add new approval workbench strings and status labels where missing.

## Execution Order

Run Task 1, Task 2, and Task 3 before Task 4 so the `RedesignApprovalPage` module, imported stylesheet, and new locale keys all exist before the controller imports the redesigned page. Run Task 5 last.

## Task 1: Add Redesigned Approval Presentation Component

**Files:**
- Create: `src/pages/approval/redesign/index.tsx`

- [ ] **Step 1: Create imports, exported types, constants, and helpers**

Create `src/pages/approval/redesign/index.tsx` with these imports and helper exports:

```tsx
import type { SelectProps, TablePaginationConfig } from 'antd';
import { Button, Dropdown, Empty, Select, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ItemType } from 'antd/es/menu/interface';
import type { Key, ReactNode } from 'react';
import type { IntlShape } from 'react-intl';
import './index.scss';

export type WorkflowStatus = 'pending' | 'processing' | 'success' | 'reject' | 'error' | 'revoke';
export type ViewWorkflowStatus = WorkflowStatus | 'all';

export interface ApprovalWorkflowItem {
  id: string;
  workflowType?: string;
  approveUser?: string;
  status?: WorkflowStatus;
  createTime?: string;
  createUser?: string;
}

export type WorkflowStatusOption = {
  label: ReactNode;
  value: ViewWorkflowStatus;
};

type WorkflowStatusOptions = NonNullable<SelectProps['options']>;

export const workflowStatusOrder: WorkflowStatus[] = [
  'pending',
  'processing',
  'success',
  'reject',
  'error',
  'revoke',
];

export const workflowTypeMessageIds: Record<string, string> = {
  createDesktop: 'ApplyForDesk',
  extendDisk: 'ResizeDisk',
  addDisk: 'ApplyDataDisk',
  resizeDesktop: 'ChangeConfig',
  updateApps: 'UpdateApps',
  addSoftware: 'ApplySoftware',
  applyUsb: 'ApplyUSB',
};

export const getWorkflowTypeLabel = (
  formatMessage: IntlShape['formatMessage'],
  workflowType?: string,
) => {
  if (!workflowType) {
    return '-';
  }

  const messageId = workflowTypeMessageIds[workflowType];
  return messageId ? formatMessage({ id: messageId, defaultMessage: workflowType }) : workflowType;
};

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
```

- [ ] **Step 2: Add props interface**

Add this props interface after the helpers:

```tsx
export interface RedesignApprovalPageProps {
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
  formatMessage: IntlShape['formatMessage'];
}
```

- [ ] **Step 3: Add component derived state and render helpers**

Start `RedesignApprovalPage` with status summary and helper renderers:

```tsx
export function RedesignApprovalPage(props: RedesignApprovalPageProps) {
  const refreshLabel = props.formatMessage({ id: 'REFRESH', defaultMessage: 'Refresh' });
  const activeStatusLabel =
    toText(props.statusOptions.find((option) => option.value === props.currentStatus)?.label) ||
    props.formatMessage({ id: 'AllStatus' });
  const selectedContainsBlocked = props.selectedRows.some((row) => !isCancelable(row));
  const batchCancelDisabled =
    props.loading || props.selectedRowKeys.length === 0 || selectedContainsBlocked;

  const renderStatus = (status?: WorkflowStatus) => {
    if (!status) {
      return '-';
    }

    return (
      <span className={`redesign-approval-status redesign-approval-status--${statusToneMap[status]}`}>
        {props.statusLabels[status] || status}
      </span>
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
```

- [ ] **Step 4: Add table columns**

Add these columns inside the component:

```tsx
  const columns: ColumnsType<ApprovalWorkflowItem> = [
    {
      title: props.formatMessage({ id: 'WorkflowTemplate' }),
      dataIndex: 'workflowType',
      key: 'workflowType',
      ellipsis: true,
      render: (value: string) => getWorkflowTypeLabel(props.formatMessage, value),
    },
    {
      title: props.formatMessage({ id: 'Approver' }),
      dataIndex: 'approveUser',
      key: 'approveUser',
      width: 170,
      render: (value: string) => (
        <span className="redesign-approval-page__name" title={value || '-'}>
          {value || '-'}
        </span>
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
      render: (value: string) => value || '-',
    },
  ];

  if (props.canRead || props.canCancel) {
    columns.push({
      title: props.formatMessage({ id: 'ACTION' }),
      dataIndex: 'action',
      key: 'action',
      width: 112,
      render: (_value, row) => {
        const items = getRowActions(row);
        if (items.length === 0) {
          return '-';
        }
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              aria-label={props.formatMessage({ id: 'ACTION' })}
              icon={<i className="iconfont icon-more" />}
            />
          </Dropdown>
        );
      },
    });
  }
```

- [ ] **Step 5: Add row selection and JSX**

Return the workbench JSX:

```tsx
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
    <main className="redesign-approval-page">
      <header className="redesign-approval-page__header">
        <div className="redesign-approval-page__heading">
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

        <Space className="redesign-approval-page__actions" wrap>
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
            <Button type="primary" icon={<i className="iconfont icon-add" />} onClick={props.onCreate}>
              {props.formatMessage({ id: 'CreateWorkflow' })}
            </Button>
          )}
        </Space>
      </header>

      <section className="redesign-approval-page__filters">
        <div
          aria-label={props.formatMessage({ id: 'STATUS' })}
          className="redesign-approval-page__segmented"
          role="group"
        >
          {props.statusOptions.map((option) => (
            <button
              aria-pressed={option.value === props.currentStatus}
              className={option.value === props.currentStatus ? 'is-active' : ''}
              key={toOptionKey(option.value)}
              type="button"
              onClick={() => props.onStatusChange(option.value as ViewWorkflowStatus)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="redesign-approval-page__compact-filters">
        <Select
          aria-label={props.formatMessage({ id: 'STATUS' })}
          value={props.currentStatus}
          options={props.statusOptions as WorkflowStatusOptions}
          onChange={(value) => props.onStatusChange(value as ViewWorkflowStatus)}
        />
      </div>

      <Table<ApprovalWorkflowItem>
        rowKey="id"
        rowSelection={rowSelection}
        className="redesign-approval-page__table"
        columns={columns}
        dataSource={props.rows}
        pagination={props.pagination}
        loading={props.loading}
        locale={{
          emptyText: (
            <section className="redesign-approval-page__empty">
              <Empty description={props.formatMessage({ id: 'ApprovalWorkbenchEmptyTitle' })} />
              <p>{props.formatMessage({ id: 'ApprovalWorkbenchEmptyDescription' })}</p>
              {props.canCreate && (
                <Button type="primary" icon={<i className="iconfont icon-add" />} onClick={props.onCreate}>
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
```

- [ ] **Step 6: Run lint after adding the component**

Run: `pnpm run lint`

Expected: command exits with code 0. This component is not imported by the controller until Task 4, so missing runtime locale values are resolved by Task 3 before user-facing integration.

- [ ] **Step 7: Commit the component**

Run:

```bash
git add src/pages/approval/redesign/index.tsx
git commit -m "Add redesigned approval workbench"
```

## Task 2: Style The Approval Workbench

**Files:**
- Create: `src/pages/approval/redesign/index.scss`

- [ ] **Step 1: Add page variables and base layout**

Create `src/pages/approval/redesign/index.scss` with:

```scss
.redesign-approval-page {
  --approval-page-text: #14221c;
  --approval-page-muted: #62746b;
  --approval-page-accent: #127454;
  --approval-page-accent-strong: #0b5f43;
  --approval-page-accent-soft: rgba(18, 116, 84, 0.1);
  --approval-page-border: rgba(61, 91, 78, 0.18);
  --approval-page-surface: rgba(255, 255, 255, 0.92);
  --approval-page-surface-subtle: rgba(245, 249, 247, 0.86);
  --approval-page-shadow: 0 16px 38px rgba(27, 55, 44, 0.1);
  --approval-page-focus: rgba(18, 116, 84, 0.46);
  --approval-page-button-bg: rgba(255, 255, 255, 0.82);
  --approval-page-header-bg: rgba(255, 255, 255, 0.9);
  --approval-page-table-head: var(--approval-page-surface-subtle);
  --approval-page-row-hover: rgba(18, 116, 84, 0.08);

  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 14px;
  color: var(--approval-page-text);
  container-type: inline-size;

  .ant-spin-nested-loading,
  .ant-spin-container {
    min-height: 0;
  }
}

:root.dark .redesign-approval-page,
:root[data-ui-theme='dark'] .redesign-approval-page {
  --approval-page-text: #edf8f3;
  --approval-page-muted: #9fb3aa;
  --approval-page-accent: #70e3c2;
  --approval-page-accent-strong: #9af4d5;
  --approval-page-accent-soft: rgba(112, 227, 194, 0.12);
  --approval-page-border: rgba(185, 245, 225, 0.14);
  --approval-page-surface: rgba(12, 19, 18, 0.72);
  --approval-page-surface-subtle: rgba(255, 255, 255, 0.045);
  --approval-page-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
  --approval-page-focus: rgba(112, 227, 194, 0.68);
  --approval-page-button-bg: rgba(255, 255, 255, 0.045);
  --approval-page-header-bg: rgba(12, 19, 18, 0.68);
  --approval-page-table-head: var(--approval-page-surface-subtle);
  --approval-page-row-hover: rgba(112, 227, 194, 0.09);
}
```

- [ ] **Step 2: Add header, actions, and filter styles**

Add these blocks:

```scss
.redesign-approval-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--approval-page-border);
  border-radius: 10px;
  background: var(--approval-page-header-bg);
  box-shadow: var(--approval-page-shadow);
}

.redesign-approval-page__heading {
  min-width: 0;
  flex: 1 1 auto;

  > span {
    color: var(--approval-page-accent);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0;
  }

  h1 {
    margin: 4px 0;
    color: var(--approval-page-text);
    font-size: 22px;
    font-weight: 650;
    line-height: 1.2;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: var(--approval-page-muted);
    font-size: 13px;
    line-height: 1.45;
  }
}

.redesign-approval-page__actions {
  min-width: 0;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 1 auto;
  flex-wrap: wrap;
  gap: 8px;

  .ant-space-item {
    max-width: 100%;
  }

  .ant-btn {
    max-width: 100%;
    min-height: 34px;
    border-color: var(--approval-page-border);
    border-radius: 7px;
    color: var(--approval-page-text);
    background: var(--approval-page-button-bg);
    font-weight: 550;

    &:hover,
    &:focus-visible {
      border-color: var(--approval-page-accent);
      color: var(--approval-page-accent-strong);
      background: var(--approval-page-accent-soft);
    }

    &:focus-visible {
      outline: 2px solid var(--approval-page-focus);
      outline-offset: 2px;
    }
  }

  .ant-btn-primary {
    border-color: var(--approval-page-accent);
    color: #ffffff;
    background: var(--approval-page-accent);
  }
}

:root.dark .redesign-approval-page__actions .ant-btn-primary,
:root[data-ui-theme='dark'] .redesign-approval-page__actions .ant-btn-primary {
  color: #06120e;
}
```

- [ ] **Step 3: Add segmented filters, table, status, and responsive styles**

Add these remaining styles:

```scss
.redesign-approval-page__filters {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow-x: auto;
  padding: 2px;
}

.redesign-approval-page__segmented {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: max-content;
  padding: 4px;
  border: 1px solid var(--approval-page-border);
  border-radius: 10px;
  background: var(--approval-page-surface-subtle);

  button {
    min-height: 32px;
    border: 1px solid transparent;
    border-radius: 7px;
    padding: 0 12px;
    color: var(--approval-page-muted);
    background: transparent;
    font-weight: 550;
    cursor: pointer;
    transition:
      border-color 160ms ease,
      color 160ms ease,
      background-color 160ms ease;

    &:hover,
    &:focus-visible,
    &.is-active {
      border-color: var(--approval-page-border);
      color: var(--approval-page-accent-strong);
      background: var(--approval-page-accent-soft);
    }

    &:focus-visible {
      outline: 2px solid var(--approval-page-focus);
      outline-offset: 2px;
    }
  }
}

.redesign-approval-page__compact-filters {
  display: none;
  align-items: center;
  gap: 8px;

  .ant-select {
    min-width: 150px;
  }
}

.redesign-approval-page__table {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--approval-page-border);
  border-radius: 10px;
  overflow: hidden;
  color: var(--approval-page-text);
  background: var(--approval-page-surface);
  box-shadow: var(--approval-page-shadow);

  .ant-spin-nested-loading,
  .ant-spin-container {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
  }

  .ant-spin-container,
  .ant-table {
    display: flex;
    flex-direction: column;
  }

  .ant-table {
    flex: 1 1 auto;
    min-height: 0;
    color: var(--approval-page-text);
    background: transparent;
  }

  .ant-table-container {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }

  .ant-table-thead > tr > th {
    border-bottom: 1px solid var(--approval-page-border);
    color: var(--approval-page-muted);
    background: var(--approval-page-table-head);
    font-size: 12px;
    font-weight: 650;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid var(--approval-page-border);
    color: var(--approval-page-text);
    background: transparent;
  }

  .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background: var(--approval-page-row-hover);
  }

  .ant-pagination {
    margin: 12px 16px;
    color: var(--approval-page-muted);
  }
}

.redesign-approval-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 650;
}

.redesign-approval-status--processing {
  color: #2374b7;
  background: rgba(72, 147, 215, 0.14);
}

.redesign-approval-status--warning {
  color: #a56b18;
  background: rgba(225, 170, 70, 0.18);
}

.redesign-approval-status--success {
  color: var(--approval-page-accent-strong);
  background: var(--approval-page-accent-soft);
}

.redesign-approval-status--danger {
  color: #c84d4d;
  background: rgba(216, 82, 82, 0.14);
}

.redesign-approval-status--default {
  color: var(--approval-page-muted);
  background: var(--approval-page-surface-subtle);
}

.redesign-approval-page {
  .redesign-approval-page__name {
    display: block;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-btn-text:focus-visible {
    outline: 2px solid var(--approval-page-focus);
    outline-offset: 2px;
  }
}

.redesign-approval-page__empty {
  max-width: 360px;
  margin: 0 auto;
  padding: 38px 16px;
  text-align: center;
  color: var(--approval-page-muted);

  .ant-empty-description {
    color: var(--approval-page-text);
    font-weight: 600;
  }

  p {
    margin: 6px 0 16px;
    color: var(--approval-page-muted);
    font-size: 13px;
    line-height: 1.5;
  }
}

@container (max-width: 760px) {
  .redesign-approval-page__header {
    flex-direction: column;
  }

  .redesign-approval-page__actions {
    justify-content: flex-start;
  }

  .redesign-approval-page__filters {
    display: none;
  }

  .redesign-approval-page__compact-filters {
    display: flex;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 4: Run lint and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/pages/approval/redesign/index.scss
git commit -m "Style redesigned approval workbench"
```

## Task 3: Add Approval Workbench Locale Strings

**Files:**
- Modify: `src/locales/zh-CN.js`
- Modify: `src/locales/en-US.js`
- Modify: `src/locales/zh-TW.js`

- [ ] **Step 1: Add Simplified Chinese strings**

Insert these keys near the existing approval strings in `src/locales/zh-CN.js`:

```js
  ApprovalWorkbenchEyebrow: '流程审批',
  ApprovalWorkbenchTitle: '审批工作台',
  ApprovalWorkbenchSummary: '共 {count} 条申请，待审批 {pending} 条，当前筛选：{status}',
  ApprovalWorkbenchEmptyTitle: '暂无审批申请',
  ApprovalWorkbenchEmptyDescription: '当前筛选条件下没有申请，可以刷新列表或创建新的流程申请。',
  ApprovalStatusPending: '待审批',
  ApprovalStatusProcessing: '执行中',
  ApprovalStatusSuccess: '成功',
  ApprovalStatusReject: '驳回',
  ApprovalStatusError: '失败',
  ApprovalStatusRevoke: '撤回',
  UpdateApps: '更新软件',
```

- [ ] **Step 2: Add English strings**

Insert these keys near the existing approval strings in `src/locales/en-US.js`:

```js
  ApprovalWorkbenchEyebrow: 'Workflow approvals',
  ApprovalWorkbenchTitle: 'Approval workbench',
  ApprovalWorkbenchSummary: '{count} requests, {pending} pending, filtered by {status}',
  ApprovalWorkbenchEmptyTitle: 'No approval requests',
  ApprovalWorkbenchEmptyDescription: 'No requests match the current filters. Refresh the list or create a new workflow request.',
  ApprovalStatusPending: 'Pending',
  ApprovalStatusProcessing: 'Processing',
  ApprovalStatusSuccess: 'Success',
  ApprovalStatusReject: 'Rejected',
  ApprovalStatusError: 'Failed',
  ApprovalStatusRevoke: 'Withdrawn',
  UpdateApps: 'Update apps',
```

- [ ] **Step 3: Add Traditional Chinese strings**

Insert these keys near the existing approval strings in `src/locales/zh-TW.js`:

```js
  ApprovalWorkbenchEyebrow: '流程審批',
  ApprovalWorkbenchTitle: '審批工作台',
  ApprovalWorkbenchSummary: '共 {count} 條申請，待審批 {pending} 條，當前篩選：{status}',
  ApprovalWorkbenchEmptyTitle: '暫無審批申請',
  ApprovalWorkbenchEmptyDescription: '當前篩選條件下沒有申請，可以刷新列表或創建新的流程申請。',
  ApprovalStatusPending: '待審批',
  ApprovalStatusProcessing: '執行中',
  ApprovalStatusSuccess: '成功',
  ApprovalStatusReject: '駁回',
  ApprovalStatusError: '失敗',
  ApprovalStatusRevoke: '撤回',
  UpdateApps: '更新軟件',
```

- [ ] **Step 4: Run lint and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/locales/zh-CN.js src/locales/en-US.js src/locales/zh-TW.js
git commit -m "Add approval workbench locale strings"
```

## Task 4: Wire The Approval Controller

**Files:**
- Modify: `src/pages/approval/index.tsx`

- [ ] **Step 1: Replace imports**

Replace the current UI-heavy imports with controller-focused imports:

```tsx
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
```

- [ ] **Step 2: Add typed state and request sequence**

Update list and filter state:

```tsx
const [approvalList, setApprovalList] = useState<ApprovalWorkflowItem[]>([]);
const [queryParams, setQueryParams] = useState({
  pageNumber: 1,
  pageSize: 10,
});
const [total, setTotal] = useState(0);
const [curWorkflowStatus, setCurWorkflowStatus] = useState<ViewWorkflowStatus>('all');
const [tableChecked, setTableChecked] = useState<ApprovalWorkflowItem[]>([]);
const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
const listRequestSeqRef = useRef(0);
```

- [ ] **Step 3: Update `useRequest` and fetch helper**

Replace the current `useRequest(listWorkflow)` setup and `fetchWorkflow` with:

```tsx
const { run: listWorkflowRun, loading: listWorkflowLoading } = useRequest(listWorkflow, {
  manual: true,
  onSuccess: (res: any, _params: any, requestSeq: number) => {
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
```

- [ ] **Step 4: Add options, label maps, pending count, and handlers**

Add these helpers before the return:

```tsx
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

const cancelDisable = useMemo(() => {
  return tableChecked.length === 0 || tableChecked.some((item) => item.status !== 'pending');
}, [tableChecked]);

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
```

- [ ] **Step 5: Update cancel label construction to use i18n workflow labels**

In `handleCancel`, replace `workflowTempList_zh_Cn[...]` usage with `getWorkflowTypeLabel(formatMessage, row.workflowType)`:

```tsx
const handleCancel = (it?: ApprovalWorkflowItem) => {
  let label = '';
  if (it) {
    label = `${formatMessage({ id: 'ConfirmCancel' })}${formatMessage({ id: 'Approval' })} ${getWorkflowTypeLabel(
      formatMessage,
      it.workflowType,
    )}？`;
  } else {
    label = `${formatMessage({ id: 'ConfirmCancel' })}${formatMessage({ id: 'Below' })}${formatMessage({
      id: 'Approval',
    })}${formatMessage({ id: 'S_LBracket' })}${formatMessage({ id: 'Quantity' })}${formatMessage({
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
```

- [ ] **Step 6: Add pagination props**

Add typed pagination props:

```tsx
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
}, [listWorkflowLoading, queryParams.pageNumber, total]);
```

- [ ] **Step 7: Replace old JSX with redesigned page and existing modals**

Replace the old header/table JSX with:

```tsx
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
```

- [ ] **Step 8: Run lint and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/pages/approval/index.tsx
git commit -m "Wire redesigned approval page"
```

## Task 5: Final Verification

**Files:**
- Verify: `src/pages/approval/index.tsx`
- Verify: `src/pages/approval/redesign/index.tsx`
- Verify: `src/pages/approval/redesign/index.scss`
- Verify: `src/locales/zh-CN.js`
- Verify: `src/locales/en-US.js`
- Verify: `src/locales/zh-TW.js`

- [ ] **Step 1: Run full frontend checks**

Run: `pnpm run lint`

Expected: command exits with code 0.

- [ ] **Step 2: Run production build**

Run: `pnpm run build`

Expected: command exits with code 0. Existing Vite dynamic import and chunk-size warnings may remain, but no new TypeScript, ESLint, or Sass errors should appear.

- [ ] **Step 3: Browser smoke test `/app/approval`**

Run the app with `pnpm run dev` or `pnpm run tauri dev`, then open `/app/approval`.

Verify these user-visible behaviors:
- page renders the redesigned approval workbench inside the logged-in shell
- refresh reloads the current query
- status filters reset to page 1 and clear selected rows
- batch cancel is disabled when no rows are selected
- batch cancel is disabled when any selected row is not pending
- single cancel is disabled for non-pending rows
- create opens the existing `Create` modal
- detail opens the existing `ApprovalDetailModal`
- pagination stays aligned with `Actions.TerminalROApplyManageRead`
- Simplified Chinese, English, and Traditional Chinese labels render without raw message IDs
- light and dark themes keep table text, status tokens, and action buttons readable

- [ ] **Step 4: Check whitespace and final diff**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` exits with code 0. `git status --short` shows only intended files before the final commit.

- [ ] **Step 5: Commit final verification fixes**

If Task 5 required changes, commit only those changes:

```bash
git add src/pages/approval/index.tsx src/pages/approval/redesign/index.tsx src/pages/approval/redesign/index.scss src/locales/zh-CN.js src/locales/en-US.js src/locales/zh-TW.js
git commit -m "Fix approval workbench verification issues"
```
