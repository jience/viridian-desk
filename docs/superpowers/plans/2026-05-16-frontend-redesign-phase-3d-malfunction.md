# Frontend Redesign Phase 3D Malfunction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/app/malfunction` with the approved fault workbench while preserving current list, filter, revoke, create, pagination, permission, and popover behavior.

**Architecture:** Keep `src/pages/malfunction/index.tsx` as the data controller and API boundary. Add `src/pages/malfunction/redesign/` as a focused presentation layer for the header, segmented filters, table frame, empty state, and responsive styling. Reuse `CreatedModal`, `BaseForm`, `useFaultStatus`, `useFaultType`, `listFault`, `revokeFault`, `createFault`, and `listResourceUser`.

**Tech Stack:** React, TypeScript, SCSS, Ant Design primitives already in the app, `react-intl` legacy locale files, existing Tauri/Vite build pipeline.

---

## File Map

- Create `src/pages/malfunction/redesign/index.tsx`: presentational fault workbench, table columns, status tokens, filters, empty/loading layout, and action controls.
- Create `src/pages/malfunction/redesign/index.scss`: scoped dark/light workbench variables, Ant Table polish, responsive header and filters.
- Modify `src/pages/malfunction/index.tsx`: keep data and modal state, add request ordering guard, clear invalid selections, render `RedesignMalfunctionPage`.
- Modify `src/locales/zh-CN.js`, `src/locales/en-US.js`, `src/locales/zh-TW.js`: add only the new workbench labels used by the redesigned page.

## Task 1: Prepare The Malfunction Controller

**Files:**
- Modify: `src/pages/malfunction/index.tsx`

- [ ] **Step 1: Update imports**

Replace the UI-heavy imports with controller-focused imports and the redesigned page import:

```tsx
import { useLoading } from '@/hooks/useLoading';
import useRequest from '@/hooks/useRequest';
import { FaultApi, listFault, revokeFault } from '@/services/api/fault';
import type { FaultItem, FaultListRequest } from '@/services/api/fault/types';
import { createFault, listResourceUser } from '@/services/resource';
import Actions from '@/utils/actions';
import { hasPermission } from '@/utils/permission';
import type { TablePaginationConfig } from 'antd';
import { Modal } from 'antd';
import { isEmpty } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import CreatedModal from './create';
import { initQueryParams, useFaultStatus, useFaultType } from './initData';
import { RedesignMalfunctionPage } from './redesign';
import type { ViewFaultStatus, ViewFaultType } from './types';
```

- [ ] **Step 2: Add request sequencing state**

Add the request sequence ref next to the list state:

```tsx
const [queryParams, setQueryParams] = useState(initQueryParams);
const [faultList, setFaultList] = useState<FaultItem[]>([]);
const [total, setTotal] = useState(0);
const [tableChecked, setTableChecked] = useState<FaultItem[]>([]);
const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
const listRequestSeqRef = useRef(0);
```

- [ ] **Step 3: Add selection reset helper**

Place this helper before `handleCancel`:

```tsx
const clearSelection = () => {
  setSelectedRowKeys([]);
  setTableChecked([]);
};
```

- [ ] **Step 4: Keep revoke behavior and refresh after success**

Keep `handleCancel` in the controller. The body should continue building the same single and batch confirmation copy, then clear selection after a successful revoke:

```tsx
if (res) {
  await revokeFault({ ids: rows });
  clearSelection();
  await fetchFaultList();
}
```

- [ ] **Step 5: Guard list responses against stale writes**

Replace `fetchFaultList` with this controller-owned request function:

```tsx
const fetchFaultList = async (params?: Partial<FaultListRequest>) => {
  const req: FaultListRequest = {
    sortKey: queryParams.sortKey,
    sortOrder: queryParams.sortOrder,
    pageNumber: queryParams.pageNumber,
    pageSize: queryParams.pageSize,
    faultType: curFaultType === 'all' ? '' : curFaultType,
    status: curFaultStatus === 'all' ? '' : curFaultStatus,
    ...params,
  };
  const requestSeq = ++listRequestSeqRef.current;
  const resp = await listFault(req);
  if (requestSeq !== listRequestSeqRef.current) {
    return;
  }
  setQueryParams(req);
  setFaultList(resp.data.results || []);
  setTotal(resp.data.totalCount || 0);
};
```

- [ ] **Step 6: Clear selection on reset and filter changes**

Update reset and filter handlers so stale selected rows cannot be revoked after the result set changes:

```tsx
const resetFaultList = async () => {
  clearSelection();
  await fetchFaultList(initQueryParams);
};

const handleFaultTypeChange = async (value: ViewFaultType) => {
  setCurFaultType(value);
  clearSelection();
  await fetchFaultList({
    pageNumber: 1,
    faultType: value === 'all' ? '' : value,
  });
};

const handleFaultStatusChange = async (value: ViewFaultStatus) => {
  setCurFaultStatus(value);
  clearSelection();
  await fetchFaultList({
    pageNumber: 1,
    status: value === 'all' ? '' : value,
  });
};
```

- [ ] **Step 7: Replace the old JSX with the redesigned page**

Keep `CreatedModal` and `contextHolder`, but render the new presentation component before the modal:

```tsx
return (
  <>
    <RedesignMalfunctionPage
      currentType={curFaultType}
      currentStatus={curFaultStatus}
      faultTypeOptions={faultTypeOptions || []}
      faultStatusOptions={faultStatusOptions || []}
      faultTypeLabels={faultTypeKv}
      faultStatusLabels={faultStatusKv}
      faultStatusColors={faultStatusStatusKv}
      rows={faultList}
      total={total}
      loading={listFaultLoading}
      selectedRowKeys={selectedRowKeys}
      selectedRows={tableChecked}
      pagination={paginationProps}
      canCancel={hasPermission([Actions.TerminalRWMalfunctionCancel])}
      canCreate={hasPermission(Actions.TerminalRWMalfunctionReport)}
      onRefresh={() => fetchFaultList()}
      onTypeChange={handleFaultTypeChange}
      onStatusChange={handleFaultStatusChange}
      onCancel={handleCancel}
      onCreate={() => {
        getDeskList();
        setCreateModalVisible(true);
      }}
      onSelectionChange={(keys, rows) => {
        setSelectedRowKeys(keys);
        setTableChecked(rows);
      }}
      formatMessage={formatMessage}
    />
    <CreatedModal
      title={formatMessage({ id: 'FaultCreate' })}
      visiable={createModalVisible}
      setVisiable={setCreateModalVisible}
      formFeatures={formFeatures}
      defaultFormValues={defaultFormValues}
      setDefaultFormValues={setDefaultFormValues}
      initialValues={initialValues}
      onOkRun={submitDistributor}
      createFaultLoading={createFaultLoading}
      formatMessage={formatMessage}
    />
    {contextHolder}
  </>
);
```

- [ ] **Step 8: Run lint after controller changes**

Run: `pnpm run lint`

Expected: command exits with code 0.

- [ ] **Step 9: Commit controller wiring**

Run:

```bash
git add src/pages/malfunction/index.tsx
git commit -m "Wire redesigned malfunction controller"
```

## Task 2: Add The Redesigned Presentation Component

**Files:**
- Create: `src/pages/malfunction/redesign/index.tsx`

- [ ] **Step 1: Create imports, props, and helpers**

Create `src/pages/malfunction/redesign/index.tsx` with these imports and types:

```tsx
import { FaultStatus, FaultType, type FaultItem } from '@/services/api/fault/types';
import type { SelectProps, TablePaginationConfig } from 'antd';
import { Button, Empty, Popover, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key, ReactNode } from 'react';
import type { IntlShape } from 'react-intl';
import type { ViewFaultStatus, ViewFaultType } from '../types';
import './index.scss';

type FaultOptions = NonNullable<SelectProps['options']>;

export interface RedesignMalfunctionPageProps {
  currentType: ViewFaultType;
  currentStatus: ViewFaultStatus;
  faultTypeOptions: FaultOptions;
  faultStatusOptions: FaultOptions;
  faultTypeLabels: Record<FaultType, string>;
  faultStatusLabels: Record<FaultStatus, string>;
  faultStatusColors: Record<FaultStatus, string>;
  rows: FaultItem[];
  total: number;
  loading: boolean;
  selectedRowKeys: string[];
  selectedRows: FaultItem[];
  pagination: false | TablePaginationConfig;
  canCancel: boolean;
  canCreate: boolean;
  onRefresh: () => void;
  onTypeChange: (value: ViewFaultType) => void;
  onStatusChange: (value: ViewFaultStatus) => void;
  onCancel: (row?: FaultItem) => void;
  onCreate: () => void;
  onSelectionChange: (keys: string[], rows: FaultItem[]) => void;
  formatMessage: IntlShape['formatMessage'];
}

const blockedStatuses = [FaultStatus.SOLVED, FaultStatus.REJECT, FaultStatus.REVOKE];

const isRevocable = (row: FaultItem) => !blockedStatuses.includes(row.status);

const toText = (value: ReactNode) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';

const toOptionKey = (value: unknown) => String(value ?? '');
```

- [ ] **Step 2: Add the component and derived state**

Add the component skeleton with derived counts and cancel state:

```tsx
export function RedesignMalfunctionPage(props: RedesignMalfunctionPageProps) {
  const selectedContainsBlocked = props.selectedRows.some((row) => !isRevocable(row));
  const batchCancelDisabled =
    props.loading || props.selectedRows.length === 0 || selectedContainsBlocked;

  const activeTypeLabel =
    props.faultTypeOptions.find((option) => option.value === props.currentType)?.label ||
    props.formatMessage({ id: 'AllTypes' });
  const activeStatusLabel =
    props.faultStatusOptions.find((option) => option.value === props.currentStatus)?.label ||
    props.formatMessage({ id: 'AllStatus' });
```

- [ ] **Step 3: Add status rendering with existing solved and rejected popovers**

Add this function inside the component before the columns:

```tsx
  const renderStatus = (status: FaultStatus, row: FaultItem) => {
    const tag = <Tag color={props.faultStatusColors[status]}>{props.faultStatusLabels[status]}</Tag>;
    if (![FaultStatus.SOLVED, FaultStatus.REJECT].includes(status)) {
      return tag;
    }

    const title = (
      <div className="poptitle">
        {props.formatMessage({
          id: status === FaultStatus.SOLVED ? 'SolveFaultSuggest' : 'RejectFaultReason',
        })}
      </div>
    );
    const content = (
      <div className="contentbox">
        <div className="popreply popoverStatic">{row.reply}</div>
        <div className="poptime">{row.updateTime}</div>
      </div>
    );

    return (
      <Popover
        placement="right"
        title={title}
        content={content}
        getPopupContainer={(node) => node.parentElement || document.body}
        trigger="hover"
      >
        {tag}
      </Popover>
    );
  };
```

- [ ] **Step 4: Add table columns**

Add typed columns that preserve all existing row behavior:

```tsx
  const columns: ColumnsType<FaultItem> = [
    {
      title: props.formatMessage({ id: 'FaultContent' }),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value: string) => (
        <span className="redesign-malfunction-table__description" title={value || '-'}>
          {value || '-'}
        </span>
      ),
    },
    {
      title: props.formatMessage({ id: 'FaultType' }),
      dataIndex: 'faultType',
      key: 'faultType',
      width: 150,
      render: (value: FaultType, row) => {
        const label = props.faultTypeLabels[value] || '-';
        if (value !== FaultType.DESKTOP) {
          return <span>{label}</span>;
        }
        return (
          <Tooltip placement="right" title={`${props.formatMessage({ id: 'FaultDesktop' })}: ${row.desktop?.name || '-'}`}>
            <span className="redesign-malfunction-table__type">{label}</span>
          </Tooltip>
        );
      },
    },
    {
      title: props.formatMessage({ id: 'STATUS' }),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: renderStatus,
    },
    {
      title: props.formatMessage({ id: 'FaultProcessor' }),
      dataIndex: ['approveUser', 'loginName'],
      key: 'userName',
      width: 150,
      render: (value: string | null) => (
        <span className="redesign-malfunction-table__name" title={value || '-'}>
          {value || '-'}
        </span>
      ),
    },
    {
      title: props.formatMessage({ id: 'FaultReportTime' }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 190,
      render: (value: string) => value || '-',
    },
  ];

  if (props.canCancel) {
    columns.push({
      title: props.formatMessage({ id: 'ACTION' }),
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (_value, row) => (
        <Button type="text" disabled={!isRevocable(row)} onClick={() => props.onCancel(row)}>
          {props.formatMessage({ id: 'FaultCancel' })}
        </Button>
      ),
    });
  }
```

- [ ] **Step 5: Add the workbench JSX**

Return the approved workbench layout:

```tsx
  return (
    <main className="redesign-malfunction-page">
      <header className="redesign-malfunction-page__toolbar">
        <div className="redesign-malfunction-page__heading">
          <span>{props.formatMessage({ id: 'MalfunctionWorkbenchEyebrow' })}</span>
          <h1>{props.formatMessage({ id: 'MalfunctionWorkbenchTitle' })}</h1>
          <p>
            {props.formatMessage(
              { id: 'MalfunctionWorkbenchSummary' },
              {
                count: props.total,
                type: toText(activeTypeLabel),
                status: toText(activeStatusLabel),
              },
            )}
          </p>
        </div>
        <div className="redesign-malfunction-page__actions">
          {props.canCancel && (
            <Tooltip title={props.formatMessage({ id: 'FaultCancel' })}>
              <Button
                icon={<i className="iconfont icon-file-cancel" />}
                disabled={batchCancelDisabled}
                onClick={() => props.onCancel()}
              >
                {props.formatMessage({ id: 'FaultCancel' })}
              </Button>
            </Tooltip>
          )}
          <Button
            icon={<i className="iconfont icon-refresh" />}
            loading={props.loading}
            onClick={props.onRefresh}
          >
            {props.formatMessage({ id: 'Refresh' })}
          </Button>
          {props.canCreate && (
            <Button type="primary" icon={<i className="iconfont icon-add" />} onClick={props.onCreate}>
              {props.formatMessage({ id: 'FaultCreate' })}
            </Button>
          )}
        </div>
      </header>

      <section
        className="redesign-malfunction-page__filters"
        aria-label={props.formatMessage({ id: 'MalfunctionFilters' })}
      >
        <div className="redesign-malfunction-page__segments">
          <div className="redesign-malfunction-page__segment-group">
            <span>{props.formatMessage({ id: 'FaultType' })}</span>
            <div>
              {props.faultTypeOptions.map((option) => (
                <button
                  key={toOptionKey(option.value)}
                  type="button"
                  className={option.value === props.currentType ? 'is-active' : ''}
                  onClick={() => props.onTypeChange(option.value as ViewFaultType)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="redesign-malfunction-page__segment-group">
            <span>{props.formatMessage({ id: 'STATUS' })}</span>
            <div>
              {props.faultStatusOptions.map((option) => (
                <button
                  key={toOptionKey(option.value)}
                  type="button"
                  className={option.value === props.currentStatus ? 'is-active' : ''}
                  onClick={() => props.onStatusChange(option.value as ViewFaultStatus)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Space className="redesign-malfunction-page__compact-filters" size={8} wrap>
          <Select
            className="redesign-malfunction-page__select"
            value={props.currentType}
            options={props.faultTypeOptions}
            onChange={(value) => props.onTypeChange(value as ViewFaultType)}
          />
          <Select
            className="redesign-malfunction-page__select"
            value={props.currentStatus}
            options={props.faultStatusOptions}
            onChange={(value) => props.onStatusChange(value as ViewFaultStatus)}
          />
        </Space>
      </section>

      <section className="redesign-malfunction-page__table-frame">
        <Table<FaultItem>
          rowKey="id"
          rowSelection={{
            selectedRowKeys: props.selectedRowKeys,
            onChange: (keys: Key[], rows: FaultItem[]) => props.onSelectionChange(keys.map(String), rows),
          }}
          className="redesign-malfunction-table"
          columns={columns}
          dataSource={props.rows}
          pagination={props.pagination}
          loading={props.loading}
          locale={{
            emptyText: (
              <div className="redesign-malfunction-page__empty">
                <Empty description={props.formatMessage({ id: 'MalfunctionEmptyTitle' })} />
                <p>{props.formatMessage({ id: 'MalfunctionEmptyDescription' })}</p>
                {props.canCreate && (
                  <Button type="primary" onClick={props.onCreate}>
                    {props.formatMessage({ id: 'FaultCreate' })}
                  </Button>
                )}
              </div>
            ),
          }}
          scroll={{ x: 920 }}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Run lint after adding the component**

Run: `pnpm run lint`

Expected: command exits with code 0.

- [ ] **Step 7: Commit the presentation component**

Run:

```bash
git add src/pages/malfunction/redesign/index.tsx
git commit -m "Add redesigned malfunction workbench"
```

## Task 3: Style The Fault Workbench

**Files:**
- Create: `src/pages/malfunction/redesign/index.scss`

- [ ] **Step 1: Add page variables and layout**

Create `src/pages/malfunction/redesign/index.scss` with scoped light and dark variables:

```scss
.redesign-malfunction-page {
  --malfunction-page-text: #17211c;
  --malfunction-page-muted: #5b6961;
  --malfunction-page-accent: #1a7153;
  --malfunction-page-accent-strong: #11593f;
  --malfunction-page-accent-soft: rgba(26, 113, 83, 0.1);
  --malfunction-page-border: rgba(63, 91, 79, 0.18);
  --malfunction-page-surface: rgba(255, 255, 255, 0.92);
  --malfunction-page-surface-subtle: rgba(245, 249, 247, 0.88);
  --malfunction-page-shadow: 0 16px 38px rgba(30, 54, 44, 0.1);

  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
  color: var(--malfunction-page-text);
  container-type: inline-size;
}

:root.dark .redesign-malfunction-page,
:root[data-ui-theme='dark'] .redesign-malfunction-page {
  --malfunction-page-text: #eef5f0;
  --malfunction-page-muted: #9aa79f;
  --malfunction-page-accent: #8ef2bd;
  --malfunction-page-accent-strong: #a7f7cc;
  --malfunction-page-accent-soft: rgba(142, 242, 189, 0.12);
  --malfunction-page-border: rgba(209, 255, 229, 0.12);
  --malfunction-page-surface: rgba(10, 14, 13, 0.58);
  --malfunction-page-surface-subtle: rgba(255, 255, 255, 0.04);
  --malfunction-page-shadow: 0 18px 44px rgba(0, 0, 0, 0.2);
}
```

- [ ] **Step 2: Add toolbar, actions, and filters styles**

Add these blocks below the variables:

```scss
.redesign-malfunction-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--malfunction-page-border);
  border-radius: 10px;
  background: var(--malfunction-page-surface);
  box-shadow: var(--malfunction-page-shadow);
}

.redesign-malfunction-page__heading {
  min-width: 0;

  > span {
    color: var(--malfunction-page-accent);
    font-size: 11px;
    font-weight: 700;
  }

  h1 {
    margin: 4px 0;
    color: var(--malfunction-page-text);
    font-size: 22px;
    font-weight: 650;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: var(--malfunction-page-muted);
    font-size: 13px;
  }
}

.redesign-malfunction-page__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;

  .ant-btn {
    border-radius: 7px;
    font-weight: 550;
  }
}

.redesign-malfunction-page__filters {
  padding: 12px;
  border: 1px solid var(--malfunction-page-border);
  border-radius: 10px;
  background: var(--malfunction-page-surface-subtle);
}

.redesign-malfunction-page__segments {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.redesign-malfunction-page__segment-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  > span {
    flex: 0 0 auto;
    color: var(--malfunction-page-muted);
    font-size: 12px;
    font-weight: 650;
  }

  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  button {
    min-height: 32px;
    border: 1px solid var(--malfunction-page-border);
    border-radius: 7px;
    padding: 0 10px;
    color: var(--malfunction-page-muted);
    background: transparent;
    cursor: pointer;
    transition:
      border-color 160ms ease,
      color 160ms ease,
      background-color 160ms ease;
  }

  button:hover,
  button:focus-visible,
  button.is-active {
    border-color: var(--malfunction-page-accent);
    color: var(--malfunction-page-accent-strong);
    background: var(--malfunction-page-accent-soft);
  }
}

.redesign-malfunction-page__compact-filters {
  display: none;
}

.redesign-malfunction-page__select {
  min-width: 150px;
}
```

- [ ] **Step 3: Add table frame, text, empty, and responsive styles**

Add the remaining styles:

```scss
.redesign-malfunction-page__table-frame {
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--malfunction-page-border);
  border-radius: 10px;
  background: var(--malfunction-page-surface);

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
    min-height: 0;
  }
}

.redesign-malfunction-table {
  .ant-table {
    background: transparent;
  }

  .ant-table-thead > tr > th {
    color: var(--malfunction-page-muted);
    background: var(--malfunction-page-surface-subtle);
    font-size: 12px;
    font-weight: 650;
  }

  .ant-table-tbody > tr > td {
    color: var(--malfunction-page-text);
  }

  .ant-table-tbody > tr:hover > td {
    background: var(--malfunction-page-accent-soft);
  }
}

.redesign-malfunction-table__description,
.redesign-malfunction-table__name {
  display: block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redesign-malfunction-table__type {
  color: var(--malfunction-page-accent-strong);
  font-weight: 600;
}

.redesign-malfunction-page__empty {
  padding: 36px 16px;
  text-align: center;

  p {
    margin: 8px auto 14px;
    max-width: 360px;
    color: var(--malfunction-page-muted);
  }
}

@container (max-width: 760px) {
  .redesign-malfunction-page__toolbar {
    flex-direction: column;
  }

  .redesign-malfunction-page__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .redesign-malfunction-page__segments {
    display: none;
  }

  .redesign-malfunction-page__compact-filters {
    display: flex;
  }
}
```

- [ ] **Step 4: Run lint and visual smoke after styles**

Run: `pnpm run lint`

Expected: command exits with code 0.

Open `/app/malfunction` in `pnpm run dev` or `pnpm run tauri dev` and verify:
- header actions wrap instead of clipping
- table is readable in light and dark theme
- filter selects fit Chinese and English labels
- empty state action appears only when create permission is available

- [ ] **Step 5: Commit styling**

Run:

```bash
git add src/pages/malfunction/redesign/index.scss
git commit -m "Style redesigned malfunction workbench"
```

## Task 4: Add New Legacy Locale Strings

**Files:**
- Modify: `src/locales/zh-CN.js`
- Modify: `src/locales/en-US.js`
- Modify: `src/locales/zh-TW.js`

- [ ] **Step 1: Add Simplified Chinese strings**

Insert these keys near the existing fault strings in `src/locales/zh-CN.js`:

```js
  MalfunctionWorkbenchEyebrow: '故障工单',
  MalfunctionWorkbenchTitle: '故障工作台',
  MalfunctionWorkbenchSummary: '共 {count} 条记录，当前筛选：{type} / {status}',
  MalfunctionFilters: '故障筛选',
  MalfunctionEmptyTitle: '暂无故障工单',
  MalfunctionEmptyDescription: '当前筛选条件下没有工单，可以刷新列表或创建新的故障工单。',
```

- [ ] **Step 2: Add English strings**

Insert these keys near the existing fault strings in `src/locales/en-US.js`:

```js
  MalfunctionWorkbenchEyebrow: 'Fault tickets',
  MalfunctionWorkbenchTitle: 'Fault workbench',
  MalfunctionWorkbenchSummary: '{count} records, filtered by {type} / {status}',
  MalfunctionFilters: 'Fault filters',
  MalfunctionEmptyTitle: 'No fault tickets',
  MalfunctionEmptyDescription: 'No tickets match the current filters. Refresh the list or create a new fault ticket.',
```

- [ ] **Step 3: Add Traditional Chinese strings**

Insert these keys near the existing fault strings in `src/locales/zh-TW.js`:

```js
  MalfunctionWorkbenchEyebrow: '故障工單',
  MalfunctionWorkbenchTitle: '故障工作台',
  MalfunctionWorkbenchSummary: '共 {count} 條記錄，當前篩選：{type} / {status}',
  MalfunctionFilters: '故障篩選',
  MalfunctionEmptyTitle: '暫無故障工單',
  MalfunctionEmptyDescription: '當前篩選條件下沒有工單，可以刷新列表或創建新的故障工單。',
```

- [ ] **Step 4: Run i18n type generation and lint**

Run: `pnpm run lint`

Expected: command exits with code 0 and generated i18n types remain consistent.

- [ ] **Step 5: Commit locale strings**

Run:

```bash
git add src/locales/zh-CN.js src/locales/en-US.js src/locales/zh-TW.js
git commit -m "Add malfunction workbench locale strings"
```

## Task 5: Final Verification

**Files:**
- Verify: `src/pages/malfunction/index.tsx`
- Verify: `src/pages/malfunction/redesign/index.tsx`
- Verify: `src/pages/malfunction/redesign/index.scss`
- Verify: `src/locales/zh-CN.js`
- Verify: `src/locales/en-US.js`
- Verify: `src/locales/zh-TW.js`

- [ ] **Step 1: Run full frontend checks**

Run: `pnpm run lint`

Expected: command exits with code 0.

- [ ] **Step 2: Run production build**

Run: `pnpm run build`

Expected: command exits with code 0. Existing Vite chunk-size warnings may remain, but no new TypeScript, ESLint, or Sass errors should appear.

- [ ] **Step 3: Browser smoke test the route**

Run the app with `pnpm run dev` or `pnpm run tauri dev`, then open `/app/malfunction`.

Verify these user-visible behaviors:
- page renders the redesigned fault workbench inside the logged-in shell
- refresh reloads the current query
- type and status filters reset to page 1 and clear selected rows
- solved and rejected status tags still show reply popovers
- single revoke opens the existing confirmation and refreshes after success
- batch revoke is disabled when no rows are selected
- batch revoke is disabled when any selected row is solved, rejected, or revoked
- create opens the existing `CreatedModal` and keeps the desktop field behavior
- pagination still appears only when read permission and total count allow it
- Simplified Chinese, English, and Traditional Chinese labels render without toolbar clipping
- light and dark themes keep table text, status tags, and action buttons readable

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
git add src/pages/malfunction/index.tsx src/pages/malfunction/redesign/index.tsx src/pages/malfunction/redesign/index.scss src/locales/zh-CN.js src/locales/en-US.js src/locales/zh-TW.js
git commit -m "Fix malfunction workbench verification issues"
```
