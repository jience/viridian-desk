import { Button } from './button';
import { Empty } from './display';
import { cn } from './lib/cn';
import type { AnyRecord, TableProps } from './types';

export function Table<T extends AnyRecord = AnyRecord>(props: TableProps<T>) {
  const rows = props.dataSource || [];
  const columns = props.columns || [];
  const keyOf = (record: T, index: number) =>
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
  return (
    <div className={cn('vdui-table-wrapper', props.className)}>
      {props.loading && <span className="vd-spinner" />}
      <div className="vdui-table-container">
        <div className="vdui-table-content">
          <table className="vdui-table">
            <thead className="vdui-table-thead">
              <tr>
                {props.rowSelection && <th className="vdui-table-selection-column" />}
                {columns.map((column, index) => (
                  <th
                    key={String(column.key ?? column.dataIndex ?? index)}
                    className={cn('vdui-table-cell', column.ellipsis && 'vdui-table-cell-ellipsis')}
                    scope="col"
                    style={{ width: column.width, textAlign: column.align }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="vdui-table-tbody">
              {rows.length ? (
                rows.map((record, rowIndex) => {
                  const rowProps = props.onRow?.(record, rowIndex) || {};
                  const rowKey = keyOf(record, rowIndex);
                  return (
                    <tr
                      key={rowKey}
                      {...rowProps}
                      className={cn('vdui-table-row', rowProps.className)}
                    >
                      {props.rowSelection && (
                        <td className="vdui-table-cell vdui-table-selection-column">
                          <input
                            type={props.rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                            aria-label={`Select row ${rowIndex + 1}`}
                            checked={selectedKeys.includes(rowKey)}
                            onChange={(event) =>
                              setSelected(record, rowIndex, event.target.checked)
                            }
                            {...props.rowSelection.getCheckboxProps?.(record)}
                          />
                        </td>
                      )}
                      {columns.map((column, colIndex) => {
                        const dataKey = Array.isArray(column.dataIndex)
                          ? column.dataIndex.join('.')
                          : column.dataIndex !== undefined
                            ? String(column.dataIndex)
                            : undefined;
                        const value = dataKey
                          ? dataKey.split('.').reduce((acc: any, key: string) => acc?.[key], record)
                          : undefined;
                        return (
                          <td
                            key={String(column.key ?? dataKey ?? colIndex)}
                            className={cn(
                              'vdui-table-cell',
                              column.ellipsis && 'vdui-table-cell-ellipsis',
                              column.className,
                            )}
                            style={{ textAlign: column.align }}
                          >
                            {column.render
                              ? column.render(value, record, rowIndex)
                              : (value ?? '-')}
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
                    colSpan={columns.length + (props.rowSelection ? 1 : 0)}
                  >
                    <Empty />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {props.pagination && (
        <div className="vdui-pagination">
          <Button
            className="vdui-pagination-prev vdui-pagination-item-link"
            aria-label="Previous page"
            disabled={(props.pagination.current || 1) <= 1}
            onClick={() => {
              const nextPage = (props.pagination as any).current - 1;
              if (props.pagination) {
                props.pagination.onChange?.(nextPage, props.pagination.pageSize || 10);
              }
              props.onChange?.({ ...props.pagination, current: nextPage }, {}, {});
            }}
          >
            ‹
          </Button>
          <span className="vdui-pagination-item vdui-pagination-item-active">
            {props.pagination.current || 1} /{' '}
            {Math.max(
              1,
              Math.ceil(
                (props.pagination.total || rows.length) / (props.pagination.pageSize || 10),
              ),
            )}
          </span>
          <Button
            className="vdui-pagination-next vdui-pagination-item-link"
            aria-label="Next page"
            disabled={
              (props.pagination.current || 1) >=
              Math.max(
                1,
                Math.ceil(
                  (props.pagination.total || rows.length) / (props.pagination.pageSize || 10),
                ),
              )
            }
            onClick={() => {
              const nextPage = (props.pagination as any).current + 1;
              if (props.pagination) {
                props.pagination.onChange?.(nextPage, props.pagination.pageSize || 10);
              }
              props.onChange?.({ ...props.pagination, current: nextPage }, {}, {});
            }}
          >
            ›
          </Button>
        </div>
      )}
    </div>
  );
}
