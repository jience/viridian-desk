import type { CSSProperties, HTMLAttributes, Key, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

export type AnyRecord = Record<string, any>;
export type UiValue = any;
export type MenuClickInfo = {
  key: string | number | undefined;
  domEvent: ReactMouseEvent<HTMLElement> | KeyboardEvent | MouseEvent;
};

export type DefaultOptionType = {
  label?: ReactNode;
  value?: UiValue;
  key?: string | number;
  disabled?: boolean;
  children?: DefaultOptionType[];
  [key: string]: unknown;
};

export type CheckboxOptionType = DefaultOptionType;

export type SelectProps<ValueType = UiValue> = {
  value?: ValueType;
  defaultValue?: ValueType;
  options?: DefaultOptionType[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  mode?: 'multiple' | 'tags';
  size?: 'small' | 'middle' | 'large';
  className?: string;
  classNames?: {
    root?: string;
    popup?: string;
  };
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  suffixIcon?: ReactNode | null;
  style?: CSSProperties;
  onChange?: (value: ValueType, option?: DefaultOptionType) => void;
  onSelect?: (value: ValueType, option?: DefaultOptionType) => void;
  maxLength?: number;
  [key: string]: unknown;
};

export type ItemType = {
  key?: string | number;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: ItemType[];
  onClick?: (info: MenuClickInfo) => void;
  [key: string]: unknown;
};

export type MenuProps = {
  items?: ItemType[];
  onClick?: (info: MenuClickInfo) => void;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

export type TablePaginationConfig = {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  [key: string]: unknown;
};

export type ColumnType<T = AnyRecord> = {
  title?: ReactNode;
  dataIndex?: keyof T | string | Array<string | number>;
  key?: string | number;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  fixed?: boolean | 'left' | 'right';
  ellipsis?: boolean;
  filters?: Array<{ text?: ReactNode; value?: UiValue }>;
  filterMultiple?: boolean;
  render?: (value: UiValue, record: T, index: number) => ReactNode;
  [key: string]: unknown;
};

export type ColumnsType<T = AnyRecord> = ColumnType<T>[];

export type TableProps<T = AnyRecord> = {
  columns?: ColumnsType<T>;
  dataSource?: T[];
  rowKey?: string | ((record: T) => string);
  loading?: boolean;
  pagination?: false | TablePaginationConfig;
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: Key[];
    onChange?: (selectedRowKeys: Key[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => AnyRecord;
    [key: string]: unknown;
  };
  onChange?: (pagination: TablePaginationConfig, filters: AnyRecord, sorter: UiValue) => void;
  onRow?: (record: T, index?: number) => HTMLAttributes<HTMLTableRowElement>;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  size?: 'small' | 'middle' | 'large';
  scroll?: AnyRecord;
  locale?: { emptyText?: ReactNode };
  [key: string]: unknown;
};

export type ThemeConfig = AnyRecord;
