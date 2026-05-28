import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  useMemo,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type Key,
  type ReactNode,
} from 'react';

import { Button } from './button';
import { Empty } from './display';
import { cn } from './lib/cn';
import type { AnyRecord, ColumnType, TableProps, UiValue } from './types';

type TableColumnMeta<T extends AnyRecord> = Pick<
  ColumnType<T>,
  'align' | 'className' | 'ellipsis' | 'width'
>;

const getDataPath = <T extends AnyRecord>(dataIndex: ColumnType<T>['dataIndex']) => {
  if (Array.isArray(dataIndex)) return dataIndex.map(String);
  if (dataIndex !== undefined) return [String(dataIndex)];
  return [];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readRecordValue = <T extends AnyRecord>(record: T, dataIndex: ColumnType<T>['dataIndex']) =>
  getDataPath(dataIndex).reduce<unknown>(
    (value, key) => (isRecord(value) ? value[key] : undefined),
    record,
  );

export function Table<T extends AnyRecord = AnyRecord>(props: TableProps<T>) {
  const rows = props.dataSource || [];
  const columns = props.columns || [];
  const pagination = props.pagination || undefined;
  const keyOf = (record: T, index: number): Key =>
    typeof props.rowKey === 'function'
      ? props.rowKey(record)
      : String(record[props.rowKey || 'key'] ?? record.id ?? index);
  const selectedKeys = props.rowSelection?.selectedRowKeys || [];
  const setSelected = (record: T, index: number, checked: boolean) => {
    const key = keyOf(record, index);
    const nextKeys =
      props.rowSelection?.type === 'radio'
        ? [key]
        : checked
          ? [...selectedKeys, key]
          : selectedKeys.filter((item) => item !== key);
    const selectedRows = rows.filter((row, rowIndex) => nextKeys.includes(keyOf(row, rowIndex)));
    props.rowSelection?.onChange?.(nextKeys, selectedRows);
  };
  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(
    () =>
      columns.map((column, index) => {
        const dataPath = getDataPath(column.dataIndex).join('.');
        const id = String(column.key ?? (dataPath || index));
        const columnDef: ColumnDef<T, unknown> = {
          id,
          header: () => column.title,
          cell: ({ getValue, row }) =>
            column.render
              ? column.render(getValue() as UiValue, row.original, row.index)
              : ((getValue() as ReactNode) ?? '-'),
          meta: {
            align: column.align,
            className: column.className,
            ellipsis: column.ellipsis,
            width: column.width,
          },
        };

        if (column.dataIndex === undefined) return columnDef;

        return {
          ...columnDef,
          accessorFn: (record) => readRecordValue(record, column.dataIndex),
        };
      }),
    [columns],
  );
  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (record, index) => String(keyOf(record, index)),
  });

  return (
    <div className={cn('vdui-table-wrapper', props.className)}>
      {props.loading && <span className="vd-spinner" />}
      <div className="vdui-table-container">
        <div className="vdui-table-content">
          <table className="vdui-table">
            <thead className="vdui-table-thead">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {props.rowSelection && <th className="vdui-table-selection-column" />}
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as TableColumnMeta<T> | undefined;
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'vdui-table-cell',
                          meta?.ellipsis && 'vdui-table-cell-ellipsis',
                        )}
                        scope="col"
                        style={{ width: meta?.width, textAlign: meta?.align }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="vdui-table-tbody">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const rowProps = props.onRow?.(row.original, row.index) || {};
                  const {
                    className: rowPropsClassName,
                    key: _rowPropsKey,
                    ...safeRowProps
                  } = rowProps as HTMLAttributes<HTMLTableRowElement> & { key?: Key };
                  const customRowClassName =
                    typeof props.rowClassName === 'function'
                      ? props.rowClassName(row.original, row.index)
                      : props.rowClassName;

                  return (
                    <tr
                      key={row.id}
                      {...safeRowProps}
                      className={cn(
                        'vdui-table-row',
                        customRowClassName,
                        rowPropsClassName,
                      )}
                    >
                      {props.rowSelection && (
                        <td className="vdui-table-cell vdui-table-selection-column">
                          <input
                            type={props.rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                            aria-label={`Select row ${row.index + 1}`}
                            checked={selectedKeys.includes(keyOf(row.original, row.index))}
                            onChange={(event) =>
                              setSelected(row.original, row.index, event.target.checked)
                            }
                            {...(props.rowSelection.getCheckboxProps?.(
                              row.original,
                            ) as InputHTMLAttributes<HTMLInputElement> | undefined)}
                          />
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as TableColumnMeta<T> | undefined;
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              'vdui-table-cell',
                              meta?.ellipsis && 'vdui-table-cell-ellipsis',
                              meta?.className,
                            )}
                            style={{ textAlign: meta?.align }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr className="vdui-table-placeholder">
                  <td
                    className="vdui-table-cell"
                    colSpan={Math.max(1, columns.length + (props.rowSelection ? 1 : 0))}
                  >
                    <Empty />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && (
        <div className="vdui-pagination">
          <Button
            className="vdui-pagination-prev vdui-pagination-item-link"
            aria-label="Previous page"
            disabled={(pagination.current || 1) <= 1}
            onClick={() => {
              const nextPage = (pagination.current || 1) - 1;
              pagination.onChange?.(nextPage, pagination.pageSize || 10);
              props.onChange?.({ ...pagination, current: nextPage }, {}, {});
            }}
          >
            ‹
          </Button>
          <span className="vdui-pagination-item vdui-pagination-item-active">
            {pagination.current || 1} /{' '}
            {Math.max(
              1,
              Math.ceil((pagination.total || rows.length) / (pagination.pageSize || 10)),
            )}
          </span>
          <Button
            className="vdui-pagination-next vdui-pagination-item-link"
            aria-label="Next page"
            disabled={
              (pagination.current || 1) >=
              Math.max(
                1,
                Math.ceil((pagination.total || rows.length) / (pagination.pageSize || 10)),
              )
            }
            onClick={() => {
              const nextPage = (pagination.current || 1) + 1;
              pagination.onChange?.(nextPage, pagination.pageSize || 10);
              props.onChange?.({ ...pagination, current: nextPage }, {}, {});
            }}
          >
            ›
          </Button>
        </div>
      )}
    </div>
  );
}
