import type { CSSProperties, HTMLAttributes, Key, ReactNode } from 'react';

export type AnyRecord = Record<string, any>;

export type DefaultOptionType = {
  label?: ReactNode;
  value?: any;
  key?: string | number;
  disabled?: boolean;
  children?: DefaultOptionType[];
  [key: string]: any;
};

export type CheckboxOptionType = DefaultOptionType;

export type SelectProps<ValueType = any> = {
  value?: ValueType;
  defaultValue?: ValueType;
  options?: DefaultOptionType[];
  children?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  mode?: 'multiple' | 'tags';
  size?: 'small' | 'middle' | 'large';
  className?: string;
  popupClassName?: string;
  style?: CSSProperties;
  onChange?: (value: ValueType, option?: any) => void;
  onSelect?: (value: ValueType, option?: any) => void;
  getPopupContainer?: (node: HTMLElement) => any;
  showSearch?: boolean | { onSearch?: (value: string) => void };
  filterOption?: boolean | ((input: string, option?: DefaultOptionType) => boolean);
  maxLength?: number;
  [key: string]: any;
};

export type ItemType = {
  key?: string | number;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: ItemType[];
  onClick?: (info?: any) => void;
  [key: string]: any;
};

export type MenuProps = {
  items?: ItemType[];
  onClick?: (info: any) => void;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

export type TablePaginationConfig = {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  [key: string]: any;
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
  filters?: Array<{ text?: ReactNode; value?: any }>;
  filterMultiple?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  [key: string]: any;
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
    [key: string]: any;
  };
  onChange?: (pagination: TablePaginationConfig, filters: AnyRecord, sorter: any) => void;
  onRow?: (record: T, index?: number) => HTMLAttributes<HTMLTableRowElement>;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  size?: 'small' | 'middle' | 'large';
  scroll?: AnyRecord;
  [key: string]: any;
};

export type ThemeConfig = AnyRecord;
