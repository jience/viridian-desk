/* eslint-disable react-refresh/only-export-components */
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/ui/lib/cn';
import './styles.scss';

type AnyRecord = Record<string, any>;

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
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
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
export type ModalFunc = (props: ModalProps) => {
  destroy: () => void;
  update: (props?: ModalProps) => void;
};

const normalizeContent = (content: any) =>
  typeof content === 'object' && content?.content ? content.content : content;

const toast = (type: string, content: any) => {
  const container = document.createElement('div');
  container.className = `vd-toast vd-toast--${type}`;
  container.textContent = String(normalizeContent(content) ?? '');
  document.body.appendChild(container);
  window.setTimeout(() => {
    container.classList.add('vd-toast--leaving');
    window.setTimeout(() => container.remove(), 180);
  }, 2600);
  return { destroy: () => container.remove() };
};

export const message = {
  success: (content: any) => toast('success', content),
  error: (content: any) => toast('error', content),
  warning: (content: any) => toast('warning', content),
  info: (content: any) => toast('info', content),
  loading: (content: any) => toast('loading', content),
  destroy: () => document.querySelectorAll('.vd-toast').forEach((node) => node.remove()),
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
        'archer-btn',
        `archer-btn-${type}`,
        `archer-btn-${size}`,
        danger && 'archer-btn-dangerous',
        block && 'archer-btn-block',
        shape && `archer-btn-${shape}`,
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
  afterClose?: () => void;
  [key: string]: any;
}

const runConfirm = async (props: ModalProps) => {
  const title = typeof props.title === 'string' ? props.title : 'Confirm';
  const content = typeof props.content === 'string' ? `\n${props.content}` : '';
  const confirmed = window.confirm(`${title}${content}`);
  if (confirmed) await props.onOk?.(() => {});
  return confirmed;
};

export const Modal = Object.assign(
  function ModalComponent(props: ModalProps) {
    const open = props.open ?? props.visible;
    if (!open && (props.destroyOnHidden || props.destroyOnClose)) return null;
    if (!open) return null;
    const footer =
      props.footer === undefined ? (
        <div className="archer-modal-footer">
          <Button onClick={props.onCancel} {...props.cancelButtonProps}>
            {props.cancelText ?? 'Cancel'}
          </Button>
          <Button type="primary" loading={props.confirmLoading} onClick={() => props.onOk?.()}>
            {props.okText ?? 'OK'}
          </Button>
        </div>
      ) : (
        props.footer
      );

    return (
      <div className={cn('archer-modal-root', props.centered && 'archer-modal-root--centered')}>
        <div
          className="archer-modal-mask"
          onClick={props.maskClosable ? props.onCancel : undefined}
        />
        <section
          className={cn('archer-modal-content', props.className)}
          style={{ width: props.width }}
          role="dialog"
          aria-modal="true"
        >
          {props.title && <header className="archer-modal-header">{props.title}</header>}
          <button className="archer-modal-close" type="button" onClick={props.onCancel}>
            ×
          </button>
          <div className="archer-modal-body">{props.children}</div>
          {footer}
        </section>
      </div>
    );
  },
  {
    confirm: (props: ModalProps) => {
      runConfirm(props);
      return { destroy: () => {}, update: () => {} };
    },
    info: (props: ModalProps) => Modal.confirm(props),
    success: (props: ModalProps) => Modal.confirm(props),
    error: (props: ModalProps) => Modal.confirm(props),
    warning: (props: ModalProps) => Modal.confirm(props),
    useModal: () => {
      const confirm = (props: ModalProps) => {
        runConfirm(props);
        return { destroy: () => {}, update: (_props?: ModalProps) => {} };
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

type FormRule = {
  required?: boolean;
  message?: ReactNode;
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  validator?: (rule: any, value: any, callback?: (error?: any) => void) => Promise<any> | void;
  [key: string]: any;
};
type RuleInput = FormRule | ((form: FormInstance) => FormRule);
export type FormInstance<T = AnyRecord> = {
  getFieldValue: (name: keyof T | string) => any;
  getFieldsValue: () => T;
  setFieldsValue: (values: Partial<T>) => void;
  setFieldValue: (name: keyof T | string, value: any) => void;
  resetFields: (names?: Array<keyof T | string>) => void;
  validateFields: (names?: Array<keyof T | string>) => Promise<T>;
  _register?: (name: string, rules?: RuleInput[]) => () => void;
  _subscribe?: (listener: () => void) => () => void;
};

const createForm = <T extends AnyRecord = AnyRecord>(): FormInstance<T> => {
  const values: AnyRecord = {};
  const initial: AnyRecord = {};
  const rules = new Map<string, RuleInput[]>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const api: FormInstance<T> = {
    getFieldValue: (name) => values[String(name)],
    getFieldsValue: () => ({ ...values }) as T,
    setFieldsValue: (next) => {
      Object.assign(values, next);
      notify();
    },
    setFieldValue: (name, value) => {
      values[String(name)] = value;
      notify();
    },
    resetFields: (names) => {
      if (!names) {
        Object.keys(values).forEach((key) => delete values[key]);
        Object.assign(values, initial);
      } else {
        names.forEach((name) => {
          const key = String(name);
          if (key in initial) values[key] = initial[key];
          else delete values[key];
        });
      }
      notify();
    },
    validateFields: async (names) => {
      const keys = names?.map(String) ?? Array.from(rules.keys());
      for (const key of keys) {
        const value = values[key];
        for (const ruleInput of rules.get(key) || []) {
          const rule = typeof ruleInput === 'function' ? ruleInput(api as any) : ruleInput;
          if (rule.required && (value === undefined || value === null || value === '')) {
            throw { errorFields: [{ name: key, errors: [rule.message] }] };
          }
          if (rule.min && String(value ?? '').length < rule.min) {
            throw { errorFields: [{ name: key, errors: [rule.message] }] };
          }
          if (rule.pattern && value && !rule.pattern.test(String(value))) {
            throw { errorFields: [{ name: key, errors: [rule.message] }] };
          }
          if (rule.validator) {
            const validator = rule.validator;
            await new Promise<void>((resolve, reject) => {
              const result = validator(rule, value, (error?: any) =>
                error ? reject(error) : resolve(),
              );
              if (result && typeof (result as Promise<any>).then === 'function') {
                (result as Promise<any>).then(() => resolve()).catch(reject);
              } else if (validator.length < 3) {
                resolve();
              }
            });
          }
        }
      }
      return { ...values } as T;
    },
    _register: (name, nextRules = []) => {
      rules.set(name, nextRules);
      return () => rules.delete(name);
    },
    _subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  (api as any)._initial = initial;
  return api;
};

const FormContext = createContext<FormInstance | null>(null);

interface FormProps extends Omit<HTMLAttributes<HTMLFormElement>, 'onChange'> {
  form?: FormInstance;
  initialValues?: AnyRecord;
  onFinish?: (values: AnyRecord) => void;
  onValuesChange?: (changed: AnyRecord, values: AnyRecord) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  colon?: boolean;
  labelCol?: AnyRecord;
  wrapperCol?: AnyRecord;
  requiredMark?: boolean;
}

interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  name?: string | number | Array<string | number>;
  label?: ReactNode;
  rules?: RuleInput[];
  valuePropName?: string;
  children?: ReactNode;
  [key: string]: any;
}

function FormItem({
  name,
  label,
  rules,
  valuePropName = 'value',
  children,
  className,
}: FormItemProps) {
  const form = useContext(FormContext);
  const [, force] = useState(0);
  const key = Array.isArray(name) ? name.join('.') : name !== undefined ? String(name) : undefined;
  useEffect(() => {
    if (!form || !key) return;
    const unreg = form._register?.(key, rules);
    const unsub = form._subscribe?.(() => force((value) => value + 1));
    return () => {
      unreg?.();
      unsub?.();
    };
  }, [form, key, rules]);

  const child =
    key && form && isValidElement(children)
      ? cloneElement(children as ReactElement<any>, {
          [valuePropName]: form.getFieldValue(key) ?? (valuePropName === 'checked' ? false : ''),
          onChange: (...args: any[]) => {
            const event = args[0];
            const value =
              valuePropName === 'checked'
                ? !!event?.target?.checked || !!event
                : event?.target
                  ? event.target.value
                  : event;
            form.setFieldValue(key, value);
            (children as ReactElement<any>).props.onChange?.(...args);
          },
        })
      : children;

  return (
    <div className={cn('archer-form-item', className)}>
      {label && <label className="archer-form-item-label">{label}</label>}
      <div className="archer-form-item-control">{child}</div>
    </div>
  );
}

type FormComponentType = {
  <_Values = AnyRecord>(props: FormProps): ReactElement;
  Item: typeof FormItem;
  useForm: <T extends AnyRecord = AnyRecord>() => [FormInstance<T>];
  useWatch: (name: string | number, form?: FormInstance) => any;
};

export const Form = Object.assign(
  function FormComponent<_Values = AnyRecord>({
    form,
    initialValues,
    children,
    className,
    onFinish,
    onSubmit,
    ...props
  }: FormProps) {
    const ownFormRef = useRef<FormInstance | null>(null);
    if (!ownFormRef.current) ownFormRef.current = createForm();
    const formInstance = form ?? ownFormRef.current;
    useEffect(() => {
      if (initialValues) {
        Object.assign((formInstance as any)._initial, initialValues);
        formInstance.setFieldsValue(initialValues);
      }
    }, [formInstance, initialValues]);
    return (
      <FormContext.Provider value={formInstance}>
        <form
          className={cn('archer-form', className)}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.(event);
            formInstance
              .validateFields()
              .then(onFinish)
              .catch(() => {});
          }}
          {...props}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  } as FormComponentType,
  {
    Item: FormItem,
    useForm: <T extends AnyRecord = AnyRecord>() => {
      const ref = useRef<FormInstance<T> | null>(null);
      if (!ref.current) ref.current = createForm<T>();
      return [ref.current] as [FormInstance<T>];
    },
    useWatch: (name: string | number, form?: FormInstance) => {
      const [, force] = useState(0);
      useEffect(() => form?._subscribe?.(() => force((value) => value + 1)), [form]);
      return form?.getFieldValue(String(name));
    },
  },
);

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  allowClear?: boolean;
  onSearch?: (value: string) => void;
  onPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  loading?: boolean;
  size?: 'small' | 'middle' | 'large';
  variant?: string;
  addonAfter?: ReactNode;
  iconRender?: (visible: boolean) => ReactNode;
  [key: string]: any;
}

type InputComponent = React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<HTMLInputElement>
> & {
  Password: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
  TextArea: React.ForwardRefExoticComponent<any>;
  Search: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
  Group: (props: any) => ReactElement;
};

const InputBase = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      prefix,
      suffix,
      allowClear,
      onSearch,
      onPressEnter,
      onKeyDown,
      size: _size,
      loading: _loading,
      variant: _variant,
      addonAfter,
      iconRender: _iconRender,
      ...props
    },
    ref,
  ) => (
    <span className={cn('archer-input-affix-wrapper', className)}>
      {prefix}
      <input
        ref={ref}
        className="archer-input"
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'Enter') onPressEnter?.(event);
          if (event.key === 'Enter') onSearch?.((event.currentTarget as HTMLInputElement).value);
        }}
        {...props}
      />
      {allowClear && props.value ? <span className="archer-input-clear">×</span> : null}
      {suffix}
      {addonAfter}
    </span>
  ),
) as InputComponent;
InputBase.displayName = 'Input';
InputBase.Password = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <InputBase ref={ref} type="password" {...props} />
));
InputBase.TextArea = forwardRef<HTMLTextAreaElement, any>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('archer-input archer-input-textarea', className)} {...props} />
));
InputBase.Search = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <InputBase ref={ref} suffix={<i className="iconfont icon-search" />} {...props} />
));
InputBase.Group = ({ children, className }: any) => (
  <span className={cn('archer-input-group', className)}>{children}</span>
);
export const Input = InputBase;

export const InputNumber = forwardRef<HTMLInputElement, any>(({ onChange, ...props }, ref) => (
  <Input
    ref={ref}
    type="number"
    onChange={(event: any) =>
      onChange?.(event.target.value === '' ? null : Number(event.target.value))
    }
    {...props}
  />
));
InputNumber.displayName = 'InputNumber';

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
    const value = props.value ?? props.defaultValue ?? (multiple ? [] : '');
    return (
      <select
        className={cn('archer-select', props.className)}
        disabled={props.disabled || props.loading}
        multiple={multiple}
        value={value as any}
        style={props.style}
        onChange={(event) => {
          const selected = multiple
            ? Array.from(event.currentTarget.selectedOptions).map((option) => option.value)
            : event.currentTarget.value;
          const option = options.find((item) => String(item.value) === String(selected));
          props.onChange?.(selected as any, option);
          props.onSelect?.(selected as any, option);
        }}
      >
        {props.placeholder && !multiple && <option value="">{props.placeholder}</option>}
        {options.map((option) => (
          <option
            key={String(option.key ?? option.value)}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  } as SelectComponentType,
  {
    Option: ({ children }: any) => <>{children}</>,
  },
);

export function AutoComplete({ children, options, onSelect, showSearch }: SelectProps) {
  const datalistId = useMemo(() => `vd-ac-${Math.random().toString(36).slice(2)}`, []);
  if (!isValidElement(children)) return null;
  return (
    <>
      {cloneElement(children as ReactElement<any>, {
        list: datalistId,
        onChange: (event: any) => {
          const value = event.target.value;
          if (typeof showSearch === 'object') showSearch.onSearch?.(value);
          (children as ReactElement<any>).props.onChange?.(event);
        },
        onBlur: (event: any) => onSelect?.(event.target.value, undefined),
      })}
      <datalist id={datalistId}>
        {(options || []).map((option) => (
          <option key={String(option.key ?? option.value)} value={option.value} />
        ))}
      </datalist>
    </>
  );
}

export function Dropdown({ menu, children, classNames }: any) {
  const [open, setOpen] = useState(false);
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        onClick: (event: any) => {
          event.stopPropagation();
          setOpen((value) => !value);
          (children as ReactElement<any>).props.onClick?.(event);
        },
      })
    : children;
  return (
    <span
      className="vd-dropdown"
      onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      tabIndex={-1}
    >
      {child}
      {open && (
        <div className={cn('archer-dropdown', classNames?.root, menu?.className)}>
          {(menu?.items || []).map((item: ItemType) => (
            <button
              key={String(item.key)}
              className={cn('archer-dropdown-menu-item', item.danger && 'is-danger')}
              type="button"
              disabled={item.disabled}
              onClick={(event) => {
                const info = { key: item.key, domEvent: event };
                item.onClick?.(info);
                menu?.onClick?.(info);
                setOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

export const Menu = Object.assign(
  function MenuComponent({ children, items, onClick, className }: MenuProps) {
    return (
      <div className={cn('archer-menu', className)}>
        {items?.map((item) => (
          <button
            key={String(item.key)}
            type="button"
            disabled={item.disabled}
            onClick={(event) => onClick?.({ key: item.key, domEvent: event })}
          >
            {item.label}
          </button>
        ))}
        {children}
      </div>
    );
  },
  {
    Item: ({ children, onClick, disabled, className }: any) => (
      <button
        className={cn('archer-menu-item', className)}
        type="button"
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    ),
  },
);

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
    <span className="vd-popover">
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            onClick: (event: any) => {
              (children as ReactElement<any>).props.onClick?.(event);
              setInternalOpen(!visible);
              onOpenChange?.(!visible);
            },
          })
        : children}
      {visible && <div className="archer-popover-inner-content">{content}</div>}
    </span>
  );
}

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
    <div className={cn('archer-table-wrapper', props.className)}>
      {props.loading && <Spin spinning />}
      <table className="archer-table">
        <thead className="archer-table-thead">
          <tr>
            {props.rowSelection && <th />}
            {columns.map((column, index) => (
              <th
                key={String(column.key ?? column.dataIndex ?? index)}
                style={{ width: column.width, textAlign: column.align }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="archer-table-tbody">
          {rows.length ? (
            rows.map((record, rowIndex) => {
              const rowProps = props.onRow?.(record, rowIndex) || {};
              const rowKey = keyOf(record, rowIndex);
              return (
                <tr key={rowKey} {...rowProps}>
                  {props.rowSelection && (
                    <td>
                      <input
                        type={props.rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                        checked={selectedKeys.includes(rowKey)}
                        onChange={(event) => setSelected(record, rowIndex, event.target.checked)}
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
                        className={column.className}
                        style={{ textAlign: column.align }}
                      >
                        {column.render ? column.render(value, record, rowIndex) : (value ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr className="archer-table-placeholder">
              <td colSpan={columns.length + (props.rowSelection ? 1 : 0)}>
                <Empty />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {props.pagination && (
        <div className="archer-pagination">
          <Button
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
          <span>
            {props.pagination.current || 1} /{' '}
            {Math.max(
              1,
              Math.ceil(
                (props.pagination.total || rows.length) / (props.pagination.pageSize || 10),
              ),
            )}
          </span>
          <Button
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

function EmptyComponent({ description }: any) {
  return (
    <div className="archer-empty">
      <div className="archer-empty-image" />
      <div className="archer-empty-description">{description ?? '-'}</div>
    </div>
  );
}
export const Empty = Object.assign(EmptyComponent, {
  PRESENTED_IMAGE_SIMPLE: 'simple',
});

export function Spin({ spinning, children }: any) {
  return (
    <span className={cn('archer-spin-nested-loading', spinning && 'is-spinning')}>
      {spinning && <span className="vd-spinner" />}
      {children}
    </span>
  );
}

export function Tag({ children, color, className }: any) {
  return (
    <span className={cn('archer-tag', color && `archer-tag-${color}`, className)}>{children}</span>
  );
}
export function Divider({ type = 'horizontal', className }: any) {
  return <span className={cn('archer-divider', `archer-divider-${type}`, className)} />;
}
function SpaceComponent({ children, className, size = 8, direction = 'horizontal' }: any) {
  return (
    <span
      className={cn('archer-space', `archer-space-${direction}`, className)}
      style={{ gap: size }}
    >
      {children}
    </span>
  );
}
export const Space = Object.assign(SpaceComponent, {
  Compact: ({ children, className }: any) => (
    <span className={cn('archer-space archer-space-compact', className)}>{children}</span>
  ),
});
export function Row({ children, className, gutter }: any) {
  return (
    <div
      className={cn('archer-row', className)}
      style={{ gap: Array.isArray(gutter) ? gutter[0] : gutter }}
    >
      {children}
    </div>
  );
}
export function Col({ children, className, span }: any) {
  return (
    <div
      className={cn('archer-col', className)}
      style={{ flex: span ? `0 0 ${(span / 24) * 100}%` : undefined }}
    >
      {children}
    </div>
  );
}
export function Switch({ checked, onChange, className, disabled }: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn('archer-switch', checked && 'archer-switch-checked', className)}
      onClick={() => onChange?.(!checked)}
    >
      <span />
    </button>
  );
}
export const Checkbox = Object.assign(
  ({
    checked,
    onChange,
    children,
    disabled,
    className,
  }: {
    checked?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    children?: ReactNode;
    disabled?: boolean;
    className?: string;
  }) => (
    <label className={cn('archer-checkbox-wrapper', className)}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event)}
      />
      <span>{children}</span>
    </label>
  ),
  {
    Group: ({ options, value = [], defaultValue = [], onChange, children }: any) => {
      const current = value.length ? value : defaultValue;
      const opts = options || [];
      return (
        <span className="archer-checkbox-group">
          {opts.map((option: any) => (
            <Checkbox
              key={String(option.value)}
              checked={current.includes(option.value)}
              onChange={(event: any) => {
                const next = event.target.checked
                  ? [...current, option.value]
                  : current.filter((item: any) => item !== option.value);
                onChange?.(next);
              }}
            >
              {option.label ?? option.title}
            </Checkbox>
          ))}
          {children}
        </span>
      );
    },
  },
);
export const Radio = Object.assign(
  ({ checked, onChange, children, value, name }: any) => (
    <label className="archer-radio-wrapper">
      <input type="radio" checked={checked} name={name} onChange={() => onChange?.(value)} />
      <span>{children}</span>
    </label>
  ),
  {
    Group: ({ options = [], value, onChange, children }: any) => (
      <span className="archer-radio-group">
        {options.map((option: any) => (
          <Radio
            key={String(option.value)}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          >
            {option.label}
          </Radio>
        ))}
        {children}
      </span>
    ),
  },
);
export function Progress({ percent = 0, status }: any) {
  return (
    <div className={cn('archer-progress', status && `archer-progress-${status}`)}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
export function Skeleton(_props: any) {
  return <div className="archer-skeleton" />;
}
export function Alert({ message: msg, description, type }: any) {
  return (
    <div className={cn('archer-alert', type && `archer-alert-${type}`)}>
      <strong>{msg}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}
export function QRCode({ value }: any) {
  return <div className="archer-qrcode">{value}</div>;
}
export function Slider({ value, onChange, min = 0, max = 100, step = 1, disabled }: any) {
  return (
    <input
      className="archer-slider"
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(event) => onChange?.(Number(event.target.value))}
    />
  );
}
export const DatePicker = Object.assign((props: InputProps) => <Input type="date" {...props} />, {
  TimePicker: (props: InputProps) => <Input type="time" {...props} />,
  RangePicker: (props: any) => (
    <span className={cn('archer-range-picker', props.className)}>
      <Input type="datetime-local" />
      <Input type="datetime-local" />
    </span>
  ),
});
export const TreeSelect = Select;

const configContextValue = {
  getPrefixCls: (suffix?: string, customizePrefixCls?: string) =>
    customizePrefixCls || (suffix ? `archer-${suffix}` : 'archer'),
};
const ConfigContext = createContext(configContextValue);
export const ConfigProvider = Object.assign(({ children }: any) => <>{children}</>, {
  ConfigContext,
});
export const App = Object.assign(({ children }: any) => <>{children}</>, {
  useApp: () => ({
    message,
    modal: {
      confirm: (props: ModalProps) => {
        runConfirm(props);
        return { destroy: () => {}, update: (_props?: ModalProps) => {} };
      },
    },
  }),
});
