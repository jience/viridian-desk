import { FaultStatus, FaultType, type FaultItem } from '@/services/api/fault/types';
import type { SelectProps, TablePaginationConfig } from '@/shared/ui';
import { Button, Empty, Popover, Select, Space, Table, Tag, Tooltip } from '@/shared/ui';
import type { ColumnsType } from '@/shared/ui';
import type { Key, ReactNode } from 'react';
import type { MessageFormatterShape } from '@/utils/message-format';
import type { ViewFaultStatus, ViewFaultType } from '../model/types';
import './malfunction-page.scss';

type FaultOptions = NonNullable<SelectProps['options']>;

export interface MalfunctionPageProps {
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
  formatMessage: MessageFormatterShape['formatMessage'];
}

const blockedStatuses = [FaultStatus.SOLVED, FaultStatus.REJECT, FaultStatus.REVOKE];
const isRevocable = (row: FaultItem) => !blockedStatuses.includes(row.status);
const toText = (value: ReactNode) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const toOptionKey = (value: unknown) => String(value ?? '');

const findOptionLabel = (options: FaultOptions, value: unknown) =>
  toText(options.find((option) => toOptionKey(option.value) === toOptionKey(value))?.label);

export function MalfunctionPage(props: MalfunctionPageProps) {
  const refreshLabel = props.formatMessage({ id: 'REFRESH', defaultMessage: 'Refresh' });
  const selectedContainsBlocked = props.selectedRows.some((row) => !isRevocable(row));
  const batchCancelDisabled =
    props.selectedRowKeys.length === 0 || selectedContainsBlocked || props.loading;
  const activeTypeLabel =
    findOptionLabel(props.faultTypeOptions, props.currentType) ||
    (props.currentType === 'all'
      ? findOptionLabel(props.faultTypeOptions, 'all')
      : props.faultTypeLabels[props.currentType]);
  const activeStatusLabel =
    findOptionLabel(props.faultStatusOptions, props.currentStatus) ||
    (props.currentStatus === 'all'
      ? findOptionLabel(props.faultStatusOptions, 'all')
      : props.faultStatusLabels[props.currentStatus]);

  const renderStatus = (status: FaultStatus, row: FaultItem) => {
    const tag = (
      <Tag color={props.faultStatusColors[status]}>{props.faultStatusLabels[status]}</Tag>
    );

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
        getPopupContainer={(node) => node.parentNode as HTMLElement}
        trigger={['hover', 'focus']}
      >
        <span className="malfunction-table__status-trigger" tabIndex={0}>
          {tag}
        </span>
      </Popover>
    );
  };

  const columns: ColumnsType<FaultItem> = [
    {
      title: props.formatMessage({ id: 'FaultContent' }),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value: FaultItem['description']) => value || '-',
    },
    {
      title: props.formatMessage({ id: 'FaultType' }),
      dataIndex: 'faultType',
      key: 'faultType',
      width: 148,
      render: (value: FaultType, row) => {
        const label = props.faultTypeLabels[value] || '-';

        if (value !== FaultType.DESKTOP) {
          return label;
        }

        return (
          <Tooltip
            placement="right"
            title={`${props.formatMessage({ id: 'FaultDesktop' })}: ${row.desktop?.name || '-'}`}
            trigger={['hover', 'focus']}
          >
            <span className="malfunction-page__desktop-type" tabIndex={0}>
              {label}
              <i className="iconfont icon-more" />
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: props.formatMessage({ id: 'STATUS' }),
      dataIndex: 'status',
      key: 'status',
      width: 132,
      render: renderStatus,
    },
    {
      title: props.formatMessage({ id: 'FaultProcessor' }),
      key: 'processor',
      width: 150,
      render: (_, row) => {
        const processor = row.approveUsername || row.approveRealName;

        return processor ? (
          <span className="malfunction-name-text" title={processor}>
            {processor}
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      title: props.formatMessage({ id: 'FaultReportTime' }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 190,
      render: (value: FaultItem['createTime']) => value || '-',
    },
    ...(props.canCancel
      ? ([
          {
            title: props.formatMessage({ id: 'ACTION' }),
            dataIndex: 'action',
            key: 'action',
            width: 116,
            render: (_value, row) => (
              <Button type="text" disabled={!isRevocable(row)} onClick={() => props.onCancel(row)}>
                {props.formatMessage({ id: 'FaultCancel' })}
              </Button>
            ),
          },
        ] satisfies ColumnsType<FaultItem>)
      : []),
  ];

  const rowSelection = {
    selectedRowKeys: props.selectedRowKeys,
    onChange: (keys: Key[], rows: FaultItem[]) => {
      props.onSelectionChange(
        keys.map((key) => String(key)),
        rows,
      );
    },
  };

  return (
    <main className="malfunction-page">
      <header className="malfunction-page__header">
        <div className="malfunction-page__heading">
          <span>{props.formatMessage({ id: 'MalfunctionWorkbenchEyebrow' })}</span>
          <h1>{props.formatMessage({ id: 'MalfunctionWorkbenchTitle' })}</h1>
          <p>
            {props.formatMessage(
              { id: 'MalfunctionWorkbenchSummary' },
              {
                count: props.total,
                type: activeTypeLabel,
                status: activeStatusLabel,
              },
            )}
          </p>
        </div>

        <Space className="malfunction-page__actions" wrap>
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
              {props.formatMessage({ id: 'FaultCreate' })}
            </Button>
          )}
        </Space>
      </header>

      <section className="malfunction-page__filters">
        <div
          aria-label={props.formatMessage({ id: 'FaultType' })}
          className="malfunction-page__segmented"
          role="group"
        >
          {props.faultTypeOptions.map((option) => {
            const value = toOptionKey(option.value) as ViewFaultType;
            const active = option.value === props.currentType;

            return (
              <button
                aria-pressed={option.value === props.currentType}
                className={active ? 'is-active' : ''}
                key={toOptionKey(option.value)}
                type="button"
                onClick={() => props.onTypeChange(value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div
          aria-label={props.formatMessage({ id: 'STATUS' })}
          className="malfunction-page__segmented"
          role="group"
        >
          {props.faultStatusOptions.map((option) => {
            const value = toOptionKey(option.value) as ViewFaultStatus;
            const active = option.value === props.currentStatus;

            return (
              <button
                aria-pressed={option.value === props.currentStatus}
                className={active ? 'is-active' : ''}
                key={toOptionKey(option.value)}
                type="button"
                onClick={() => props.onStatusChange(value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="malfunction-page__compact-filters">
        <Select
          aria-label={props.formatMessage({ id: 'FaultType' })}
          value={props.currentType}
          options={props.faultTypeOptions}
          onChange={(value) => props.onTypeChange(value as ViewFaultType)}
        />
        <Select
          aria-label={props.formatMessage({ id: 'STATUS' })}
          value={props.currentStatus}
          options={props.faultStatusOptions}
          onChange={(value) => props.onStatusChange(value as ViewFaultStatus)}
        />
      </div>

      <Table<FaultItem>
        rowKey="id"
        rowSelection={rowSelection}
        className="malfunction-page__table"
        columns={columns}
        dataSource={props.rows}
        pagination={props.pagination}
        loading={props.loading}
        locale={{
          emptyText: (
            <section className="malfunction-page__empty">
              <Empty description={props.formatMessage({ id: 'MalfunctionEmptyTitle' })} />
              <p>{props.formatMessage({ id: 'MalfunctionEmptyDescription' })}</p>
              {props.canCreate && (
                <Button
                  type="primary"
                  icon={<i className="iconfont icon-add" />}
                  onClick={props.onCreate}
                >
                  {props.formatMessage({ id: 'FaultCreate' })}
                </Button>
              )}
            </section>
          ),
        }}
      />
    </main>
  );
}
