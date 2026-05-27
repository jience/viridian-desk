import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/shared/ui/lib/cn';
import { showConfirm } from './confirm';
import type {
  AnyRecord,
  ColumnType,
  DefaultOptionType,
  ItemType,
  SelectProps,
  TableProps,
} from './types';
import './styles.scss';

export type {
  AnyRecord,
  ColumnType,
  ColumnsType,
  DefaultOptionType,
  ItemType,
  MenuProps,
  SelectProps,
  TablePaginationConfig,
  TableProps,
} from './types';

export type ModalFunc = (props: ModalProps) => {
  destroy: () => void;
  update: (props?: ModalProps) => void;
};

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'default' | 'text' | 'link' | 'dashed';
  htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  icon?: ReactNode;
  loading?: boolean;
  danger?: boolean;
  block?: boolean;
  shape?: 'circle' | 'round' | 'default';
  size?: 'small' | 'middle' | 'large';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      type = 'default',
      htmlType = 'button',
      icon,
      loading,
      danger,
      block,
      shape,
      size = 'middle',
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={htmlType}
      className={cn(
        'vdui-btn',
        `vdui-btn-${type}`,
        `vdui-btn-${size}`,
        type === 'default' && 'vdui-btn-normal',
        size === 'small' && 'vdui-btn-small',
        size === 'large' && 'vdui-btn-large',
        icon && !children && 'vdui-btn-icon-only',
        loading && 'vdui-btn-loading',
        danger && 'vdui-btn-dangerous',
        block && 'vdui-btn-block',
        shape && `vdui-btn-${shape}`,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="vd-spinner vd-spinner--inline" /> : icon}
      {children && <span>{children}</span>}
    </button>
  ),
);
Button.displayName = 'Button';

export interface ModalProps {
  open?: boolean;
  visible?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  content?: ReactNode;
  onCancel?: () => void;
  onOk?: (close?: () => void) => void | Promise<void>;
  okText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
  width?: number | string;
  centered?: boolean;
  className?: string;
  destroyOnHidden?: boolean;
  destroyOnClose?: boolean;
  keyboard?: boolean;
  maskClosable?: boolean;
  okButtonProps?: AnyRecord;
  cancelButtonProps?: AnyRecord;
  closable?: boolean;
  afterClose?: () => void;
  [key: string]: any;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute('disabled') && element.offsetParent !== null,
  );

export const Modal = Object.assign(
  function ModalComponent(props: ModalProps) {
    const open = props.open ?? props.visible;
    const titleId = useId();
    const dialogRef = useRef<HTMLElement>(null);
    const onCancelRef = useRef(props.onCancel);
    const keyboardRef = useRef(props.keyboard);

    useEffect(() => {
      onCancelRef.current = props.onCancel;
      keyboardRef.current = props.keyboard;
    });

    useEffect(() => {
      if (!open) return;

      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 0);
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && keyboardRef.current !== false) {
          event.stopPropagation();
          onCancelRef.current?.();
        }

        if (event.key !== 'Tab' || !dialogRef.current) return;

        const focusableElements = getFocusableElements(dialogRef.current);
        if (!focusableElements.length) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleKeyDown);
        activeElement?.focus?.();
      };
    }, [open]);

    if (!open && (props.destroyOnHidden || props.destroyOnClose)) return null;
    if (!open) return null;

    const footer =
      props.footer === undefined ? (
        <div className="vdui-modal-footer">
          <Button onClick={props.onCancel} {...props.cancelButtonProps}>
            {props.cancelText ?? 'Cancel'}
          </Button>
          <Button
            type="primary"
            loading={props.confirmLoading}
            onClick={() => props.onOk?.()}
            {...props.okButtonProps}
          >
            {props.okText ?? 'OK'}
          </Button>
        </div>
      ) : (
        props.footer
      );

    return (
      <div className={cn('vdui-modal-root', props.centered && 'vdui-modal-root--centered')}>
        <div
          className="vdui-modal-mask"
          onClick={props.maskClosable ? props.onCancel : undefined}
        />
        <div className={cn('vdui-modal-panel', props.className)} style={{ width: props.width }}>
          <section
            ref={dialogRef}
            className="vdui-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={props.title ? titleId : undefined}
            tabIndex={-1}
          >
            {props.title && (
              <header className="vdui-modal-header">
                <div className="vdui-modal-title" id={titleId}>
                  {props.title}
                </div>
              </header>
            )}
            {props.closable !== false && (
              <button
                aria-label="Close"
                className="vdui-modal-close"
                type="button"
                onClick={props.onCancel}
              >
                <span aria-hidden="true" />
              </button>
            )}
            <div className="vdui-modal-body">{props.children}</div>
            {footer}
          </section>
        </div>
      </div>
    );
  },
  {
    confirm: (props: ModalProps) => {
      return showConfirm(props);
    },
    info: (props: ModalProps) => showConfirm({ ...props, variant: 'info' }),
    success: (props: ModalProps) => showConfirm({ ...props, variant: 'success' }),
    error: (props: ModalProps) => showConfirm({ ...props, variant: 'error' }),
    warning: (props: ModalProps) => showConfirm({ ...props, variant: 'warning' }),
    useModal: () => {
      const confirm = (props: ModalProps) => {
        return showConfirm(props);
      };
      return [
        {
          confirm,
          info: confirm,
          success: confirm,
          error: confirm,
          warning: confirm,
        },
        null,
      ] as const;
    },
  },
);

const readOptions = (options?: DefaultOptionType[], children?: ReactNode): DefaultOptionType[] => {
  if (options) return options;
  const list: DefaultOptionType[] = [];
  (Array.isArray(children) ? children : [children]).forEach((child: any) => {
    if (!isValidElement(child)) return;
    const props = child.props as any;
    list.push({
      value: props.value ?? child.key,
      key: child.key ?? undefined,
      label: props.children,
      disabled: props.disabled,
    });
  });
  return list;
};

type SelectComponentType = {
  <ValueType = any>(props: SelectProps<ValueType>): ReactElement | null;
  Option: (props: any) => ReactElement;
};

export const Select = Object.assign(
  function SelectComponent<ValueType = any>(props: SelectProps<ValueType>) {
    const options = readOptions(props.options, props.children);
    const multiple = props.mode === 'multiple' || props.mode === 'tags';
    const isControlled = props.value !== undefined;
    const [internalValue, setInternalValue] = useState<any>(
      props.defaultValue ?? (multiple ? [] : ''),
    );
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLSpanElement>(null);
    const value = isControlled ? props.value : internalValue;
    const currentValues = multiple ? (Array.isArray(value) ? value : []) : [];
    const selectedValues = multiple
      ? currentValues.map(String)
      : value === undefined || value === null || value === ''
        ? []
        : [String(value)];
    const selectedOptions = options.filter((option) =>
      selectedValues.includes(String(option.value)),
    );
    const selectedLabel = multiple
      ? selectedOptions.map((option) => option.label).join(', ')
      : selectedOptions[0]?.label;
    const disabled = props.disabled || props.loading;

    useEffect(() => {
      if (!open) return;

      const handlePointerDown = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener('pointerdown', handlePointerDown);
      return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open]);

    const commitValue = (nextValue: any, option?: DefaultOptionType) => {
      if (!isControlled) setInternalValue(nextValue);
      props.onChange?.(nextValue as ValueType, option);
      props.onSelect?.(nextValue as ValueType, option);
    };

    const handleOptionClick = (option: DefaultOptionType) => {
      if (option.disabled) return;
      if (multiple) {
        const optionValue = String(option.value);
        const nextValues = selectedValues.includes(optionValue)
          ? currentValues.filter((item) => String(item) !== optionValue)
          : [...currentValues, option.value];
        commitValue(nextValues, option);
        return;
      }

      commitValue(option.value, option);
      setOpen(false);
    };

    return (
      <span
        ref={rootRef}
        className={cn(
          'vdui-select',
          `vdui-select-${props.size ?? 'middle'}`,
          open && 'vdui-select-open',
          props.disabled && 'vdui-select-disabled',
          props.className,
          props.classNames?.root,
        )}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        style={props.style}
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            event.currentTarget.contains(event.relatedTarget)
          ) {
            return;
          }
          setOpen(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((value) => !value);
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            window.setTimeout(() => {
              rootRef.current
                ?.querySelector<HTMLButtonElement>('.vdui-select-option:not(:disabled)')
                ?.focus();
            }, 0);
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
        }}
      >
        <span className="vdui-select-selection-item">{selectedLabel ?? props.placeholder}</span>
        {props.placeholder && selectedValues.length === 0 ? (
          <span className="vdui-select-placeholder">{props.placeholder}</span>
        ) : null}
        {props.suffixIcon === null ? null : (
          <span className="vdui-select-arrow" aria-hidden="true">
            {props.suffixIcon ?? '▾'}
          </span>
        )}
        {open && (
          <div
            className={cn(
              'vdui-select-dropdown',
              props.placement && `vdui-select-dropdown--${props.placement}`,
              props.popupClassName,
              props.classNames?.popup,
            )}
            role="listbox"
            aria-multiselectable={multiple || undefined}
          >
            {options.map((option) => {
              const selected = selectedValues.includes(String(option.value));

              return (
                <button
                  key={String(option.key ?? option.value)}
                  className={cn('vdui-select-option', selected && 'is-selected')}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOptionClick(option);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      setOpen(false);
                      rootRef.current?.focus();
                    }
                  }}
                >
                  <span className="vdui-select-option-label">{option.label}</span>
                  {selected && <span className="vdui-select-option-check">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </span>
    );
  } as SelectComponentType,
  {
    Option: ({ children }: any) => <>{children}</>,
  },
);

export function Dropdown({ menu, children, classNames, placement = 'bottomRight' }: any) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const shouldFocusMenuRef = useRef(false);

  useEffect(() => {
    if (!open || !shouldFocusMenuRef.current) return;
    shouldFocusMenuRef.current = false;
    window.setTimeout(() => {
      const firstItem = rootRef.current?.querySelector<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)',
      );
      firstItem?.focus();
    }, 0);
  }, [open]);

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
  };

  const focusMenuItem = (current: HTMLElement, direction: 'next' | 'prev' | 'first' | 'last') => {
    const menuRoot = current.closest('[role="menu"]');
    if (!menuRoot) return;

    const items = Array.from(
      menuRoot.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
    );
    if (!items.length) return;

    const currentIndex = items.indexOf(current as HTMLButtonElement);
    const lastIndex = items.length - 1;
    const nextIndex =
      direction === 'first'
        ? 0
        : direction === 'last'
          ? lastIndex
          : direction === 'next'
            ? currentIndex >= lastIndex
              ? 0
              : currentIndex + 1
            : currentIndex <= 0
              ? lastIndex
              : currentIndex - 1;

    items[nextIndex]?.focus();
  };

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        onClick: (event: any) => {
          event.stopPropagation();
          setOpen((value) => !value);
          (children as ReactElement<any>).props.onClick?.(event);
        },
        onKeyDown: (event: ReactKeyboardEvent) => {
          (children as ReactElement<any>).props.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            shouldFocusMenuRef.current = !open;
            setOpen((value) => !value);
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            shouldFocusMenuRef.current = true;
            setOpen(true);
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
        },
      })
    : children;

  return (
    <span
      ref={rootRef}
      className="vd-dropdown"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
        window.setTimeout(() => {
          if (!rootRef.current?.contains(document.activeElement)) {
            setOpen(false);
          }
        }, 120);
      }}
      tabIndex={-1}
    >
      {child}
      {open && (
        <div
          className={cn(
            'vdui-dropdown',
            `vdui-dropdown--${placement}`,
            classNames?.root,
            menu?.className,
          )}
          role="menu"
        >
          {(menu?.items || []).map((item: ItemType) => (
            <button
              key={String(item.key)}
              className={cn('vdui-dropdown-menu-item', item.danger && 'is-danger')}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(event) => {
                const info = { key: item.key, domEvent: event };
                item.onClick?.(info);
                menu?.onClick?.(info);
                setOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setOpen(false);
                  focusTrigger();
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'next');
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'prev');
                }
                if (event.key === 'Home') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'first');
                }
                if (event.key === 'End') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'last');
                }
                if (event.key === 'Tab') {
                  setOpen(false);
                }
              }}
            >
              {item.icon}
              <span className="vdui-dropdown-menu-title-content">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

export function Tooltip({ title, children }: any) {
  return isValidElement(children)
    ? cloneElement(children, { title: typeof title === 'string' ? title : undefined } as any)
    : children;
}

type PopoverProps = {
  content?: ReactNode;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  getPopupContainer?: (node: HTMLElement) => any;
  [key: string]: any;
};

export function Popover({ content, children, open, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const visible = open ?? internalOpen;
  return (
    <span className="vd-popover vdui-popover">
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            onClick: (event: any) => {
              (children as ReactElement<any>).props.onClick?.(event);
              setInternalOpen(!visible);
              onOpenChange?.(!visible);
            },
          })
        : children}
      {visible && (
        <div className="vdui-popover-inner-content">
          <span className="vdui-popover-arrow" />
          {content}
        </div>
      )}
    </span>
  );
}

export function EmptyComponent({ description }: any) {
  return (
    <div className="vdui-empty">
      <div className="vdui-empty-image" />
      <div className="vdui-empty-description">{description ?? '-'}</div>
    </div>
  );
}

export const Empty = Object.assign(EmptyComponent, {
  PRESENTED_IMAGE_SIMPLE: 'simple',
});

const getRowKey = <T extends AnyRecord>(
  rowKey: TableProps<T>['rowKey'],
  record: T,
  index: number,
) =>
  typeof rowKey === 'function'
    ? rowKey(record)
    : String(record[rowKey || 'key'] ?? record.id ?? index);

const getCellValue = <T extends AnyRecord>(record: T, dataIndex?: ColumnType<T>['dataIndex']) => {
  if (dataIndex === undefined) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex.map(String) : String(dataIndex).split('.');
  return path.reduce((acc: any, key: string) => acc?.[key], record);
};

export function Table<T extends AnyRecord = AnyRecord>(props: TableProps<T>) {
  const rows = props.dataSource || [];
  const columns = props.columns || [];
  const selectedKeys = props.rowSelection?.selectedRowKeys || [];
  const pagination = props.pagination;
  const setSelected = (record: T, index: number, checked: boolean) => {
    const key = getRowKey(props.rowKey, record, index);
    const nextKeys =
      props.rowSelection?.type === 'radio'
        ? [key]
        : checked
          ? [...selectedKeys, key]
          : selectedKeys.filter((item) => item !== key);
    const selectedRows = rows.filter((row, rowIndex) =>
      nextKeys.includes(getRowKey(props.rowKey, row, rowIndex)),
    );
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
                  const rowKey = getRowKey(props.rowKey, record, rowIndex);
                  const rowClassName =
                    typeof props.rowClassName === 'function'
                      ? props.rowClassName(record, rowIndex)
                      : props.rowClassName;

                  return (
                    <tr
                      key={rowKey}
                      {...rowProps}
                      className={cn('vdui-table-row', rowClassName, rowProps.className)}
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
                        const value = getCellValue(record, column.dataIndex);
                        return (
                          <td
                            key={String(column.key ?? column.dataIndex ?? colIndex)}
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
                    {props.locale?.emptyText ?? <Empty />}
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

export function Spin({ spinning, children }: any) {
  return (
    <span className={cn('vdui-spin-nested-loading', spinning && 'is-spinning')}>
      {spinning && <span className="vd-spinner" />}
      <span className="vdui-spin-container">{children}</span>
    </span>
  );
}

export function Tag({ children, color, className }: any) {
  return (
    <span className={cn('vdui-tag', color && `vdui-tag-${color}`, className)}>{children}</span>
  );
}

function SpaceComponent({ children, className, size = 8, direction = 'horizontal', wrap }: any) {
  return (
    <span
      className={cn('vdui-space', `vdui-space-${direction}`, wrap && 'vdui-space-wrap', className)}
      style={{ gap: size }}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <span className="vdui-space-item" key={index}>
              {child}
            </span>
          ))
        : children}
    </span>
  );
}

export const Space = Object.assign(SpaceComponent, {
  Compact: ({ children, className }: any) => (
    <span className={cn('vdui-space vdui-space-compact', className)}>{children}</span>
  ),
});
