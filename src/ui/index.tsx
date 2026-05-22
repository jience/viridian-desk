/* eslint-disable react-refresh/only-export-components */
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/ui/lib/cn';
import './styles.scss';
import { message } from './message';
export { message } from './message';

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
  getFieldError: (name: keyof T | string) => ReactNode[];
  setFieldsValue: (values: Partial<T>) => void;
  setFieldValue: (name: keyof T | string, value: any) => void;
  resetFields: (names?: Array<keyof T | string>) => void;
  validateFields: (names?: Array<keyof T | string>) => Promise<T>;
  _register?: (name: string, rules?: RuleInput[]) => () => void;
  _subscribe?: (listener: () => void) => () => void;
  _subscribeField?: (name: string, listener: () => void) => () => void;
  _notifyField?: (name: string) => void;
  _setFieldValueSilently?: (name: keyof T | string, value: any) => void;
};

const normalizeRuleError = (error: any, fallback?: ReactNode): ReactNode => {
  if (error?.message) return error.message;
  if (error) return String(error);
  return fallback ?? '';
};

const validateRule = async (rule: FormRule, value: any): Promise<ReactNode | null> => {
  if (rule.required && (value === undefined || value === null || value === '')) {
    return rule.message ?? '';
  }
  if (rule.min && String(value ?? '').length < rule.min) {
    return rule.message ?? '';
  }
  if (rule.pattern && value && !rule.pattern.test(String(value))) {
    return rule.message ?? '';
  }
  if (!rule.validator) return null;

  try {
    const validator = rule.validator;
    await new Promise<void>((resolve, reject) => {
      const result = validator(rule, value, (error?: any) => (error ? reject(error) : resolve()));
      if (result && typeof (result as Promise<any>).then === 'function') {
        (result as Promise<any>).then(() => resolve()).catch(reject);
      } else if (validator.length < 3) {
        resolve();
      }
    });
    return null;
  } catch (error) {
    return normalizeRuleError(error, rule.message);
  }
};

const createForm = <T extends AnyRecord = AnyRecord>(): FormInstance<T> => {
  const values: AnyRecord = {};
  const initial: AnyRecord = {};
  const rules = new Map<string, RuleInput[]>();
  const errors = new Map<string, ReactNode[]>();
  const listeners = new Set<() => void>();
  const fieldListeners = new Map<string, Set<() => void>>();
  const notify = () => listeners.forEach((listener) => listener());
  const notifyField = (name: string) => {
    fieldListeners.get(name)?.forEach((listener) => listener());
    notify();
  };
  const setValue = (name: keyof T | string, value: any, shouldNotify: boolean) => {
    const key = String(name);
    values[key] = value;
    errors.delete(key);
    if (shouldNotify) notifyField(key);
  };
  const api: FormInstance<T> = {
    getFieldValue: (name) => values[String(name)],
    getFieldsValue: () => ({ ...values }) as T,
    getFieldError: (name) => errors.get(String(name)) ?? [],
    setFieldsValue: (next) => {
      Object.assign(values, next);
      Object.keys(next).forEach((key) => errors.delete(key));
      Object.keys(next).forEach((key) => notifyField(key));
    },
    setFieldValue: (name, value) => setValue(name, value, true),
    resetFields: (names) => {
      const changedKeys =
        names?.map(String) ??
        Array.from(new Set([...Object.keys(values), ...Object.keys(initial)]));
      if (!names) {
        Object.keys(values).forEach((key) => delete values[key]);
        Object.assign(values, initial);
        errors.clear();
      } else {
        names.forEach((name) => {
          const key = String(name);
          if (key in initial) values[key] = initial[key];
          else delete values[key];
          errors.delete(key);
        });
      }
      changedKeys.forEach((key) => notifyField(key));
    },
    validateFields: async (names) => {
      const keys = names?.map(String) ?? Array.from(rules.keys());
      const errorFields: Array<{ name: string; errors: ReactNode[] }> = [];

      keys.forEach((key) => errors.delete(key));

      for (const key of keys) {
        const value = values[key];
        for (const ruleInput of rules.get(key) || []) {
          const rule = typeof ruleInput === 'function' ? ruleInput(api as any) : ruleInput;
          const error = await validateRule(rule, value);
          if (error) {
            const fieldErrors = [error];
            errors.set(key, fieldErrors);
            errorFields.push({ name: key, errors: fieldErrors });
            break;
          }
        }
      }

      keys.forEach((key) => notifyField(key));

      if (errorFields.length) {
        throw { errorFields, values: { ...values } };
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
    _subscribeField: (name, listener) => {
      const key = String(name);
      const nextListeners = fieldListeners.get(key) ?? new Set<() => void>();
      nextListeners.add(listener);
      fieldListeners.set(key, nextListeners);

      return () => {
        nextListeners.delete(listener);
        if (!nextListeners.size) {
          fieldListeners.delete(key);
        }
      };
    },
    _notifyField: (name) => notifyField(String(name)),
    _setFieldValueSilently: (name, value) => setValue(name, value, false),
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
  labelAlign?: 'left' | 'right';
  wrapperCol?: AnyRecord;
  requiredMark?: boolean;
}

interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  name?: string | number | Array<string | number>;
  label?: ReactNode;
  rules?: RuleInput[];
  valuePropName?: string;
  liveValue?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

function FormItem({
  name,
  label,
  rules,
  valuePropName = 'value',
  liveValue = true,
  children,
  className,
}: FormItemProps) {
  const form = useContext(FormContext);
  const [, force] = useState(0);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const key = Array.isArray(name) ? name.join('.') : name !== undefined ? String(name) : undefined;
  const fieldErrors = key && form ? form.getFieldError(key) : [];
  const hasError = fieldErrors.length > 0;
  useEffect(() => {
    if (!form || !key) return;
    const unreg = form._register?.(key, rules);
    const unsub = form._subscribeField?.(key, () => force((value) => value + 1));
    return () => {
      unreg?.();
      unsub?.();
    };
  }, [form, key, rules]);

  const shouldWriteLiveValue = liveValue || valuePropName !== 'value';
  const fieldValue = key && form ? form.getFieldValue(key) : undefined;
  const valueProps =
    key && form
      ? shouldWriteLiveValue
        ? { [valuePropName]: fieldValue ?? (valuePropName === 'checked' ? false : '') }
        : { defaultValue: fieldValue ?? '' }
      : {};
  const conflictingValueProps =
    key && form
      ? shouldWriteLiveValue
        ? valuePropName === 'checked'
          ? { defaultChecked: undefined }
          : valuePropName === 'value'
            ? { defaultValue: undefined }
            : {}
        : { [valuePropName]: undefined }
      : {};

  const child =
    key && form && isValidElement(children)
      ? cloneElement(children as ReactElement<any>, {
          id: (children as ReactElement<any>).props.id ?? fieldId,
          'aria-invalid': hasError || undefined,
          'aria-describedby': hasError ? errorId : undefined,
          ...conflictingValueProps,
          ...valueProps,
          onChange: (...args: any[]) => {
            const event = args[0];
            const value =
              valuePropName === 'checked'
                ? !!event?.target?.checked || !!event
                : event?.target
                  ? event.target.value
                  : event;
            if (shouldWriteLiveValue) {
              form.setFieldValue(key, value);
            } else {
              form._setFieldValueSilently?.(key, value);
            }
            (children as ReactElement<any>).props.onChange?.(...args);
          },
          onBlur: (...args: any[]) => {
            if (!shouldWriteLiveValue) {
              form._notifyField?.(key);
            }
            (children as ReactElement<any>).props.onBlur?.(...args);
          },
        })
      : children;

  return (
    <div className={cn('vdui-form-item', hasError && 'vdui-form-item-has-error', className)}>
      {label && (
        <label className="vdui-form-item-label" htmlFor={key ? fieldId : undefined}>
          {label}
        </label>
      )}
      <div className="vdui-form-item-control">{child}</div>
      {hasError && (
        <div className="vdui-form-item-error" id={errorId} role="alert">
          {fieldErrors[0]}
        </div>
      )}
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
    layout = 'horizontal',
    onFinish,
    onSubmit,
    onValuesChange: _onValuesChange,
    colon: _colon,
    labelCol: _labelCol,
    labelAlign: _labelAlign,
    wrapperCol: _wrapperCol,
    requiredMark: _requiredMark,
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
          className={cn('vdui-form', `vdui-form-layout-${layout}`, className)}
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
      const watchedValueRef = useRef<any>(undefined);
      const key = String(name);

      useEffect(() => {
        watchedValueRef.current = form?.getFieldValue(key);
        return form?._subscribe?.(() => {
          const nextValue = form.getFieldValue(key);
          if (Object.is(watchedValueRef.current, nextValue)) return;
          watchedValueRef.current = nextValue;
          force((value) => value + 1);
        });
      }, [form, key]);

      return form?.getFieldValue(key);
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
    <span className={cn('vdui-input-affix-wrapper', className)}>
      {prefix}
      <input
        ref={ref}
        className="vdui-input"
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'Enter') onPressEnter?.(event);
          if (event.key === 'Enter') onSearch?.((event.currentTarget as HTMLInputElement).value);
        }}
        {...props}
      />
      {allowClear && props.value ? <span className="vdui-input-clear">×</span> : null}
      {suffix}
      {addonAfter}
    </span>
  ),
) as InputComponent;
InputBase.displayName = 'Input';
InputBase.Password = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <InputBase ref={ref} type="password" {...props} />
));
InputBase.TextArea = forwardRef<HTMLTextAreaElement, any>(
  ({ className, autoSize, showCount: _showCount, rows, ...props }, ref) => {
    const minRows = typeof autoSize === 'object' ? autoSize.minRows : undefined;

    return (
      <textarea
        ref={ref}
        className={cn('vdui-input vdui-input-textarea', className)}
        rows={rows ?? minRows}
        {...props}
      />
    );
  },
);
InputBase.Search = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <InputBase
    ref={ref}
    className={cn('vdui-input-search', className)}
    suffix={<i className="iconfont icon-search" />}
    {...props}
  />
));
InputBase.Group = ({ children, className }: any) => (
  <span className={cn('vdui-input-group', className)}>{children}</span>
);
export const Input = InputBase;

export const InputNumber = forwardRef<HTMLInputElement, any>(
  ({ onChange, className, ...props }, ref) => (
    <Input
      ref={ref}
      type="number"
      className={cn('vdui-input-number', className)}
      onChange={(event: any) =>
        onChange?.(event.target.value === '' ? null : Number(event.target.value))
      }
      {...props}
    />
  ),
);
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
        {selectedValues.length > 0 ? (
          <span className="vdui-select-selection-item">{selectedLabel}</span>
        ) : props.placeholder ? (
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

export const Menu = Object.assign(
  function MenuComponent({ children, items, onClick, className }: MenuProps) {
    return (
      <div className={cn('vdui-menu', className)}>
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
        className={cn('vdui-menu-item', className)}
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
  const rootRef = useRef<HTMLSpanElement>(null);
  const visible = open ?? internalOpen;

  useEffect(() => {
    if (!visible) return;

    const closePopover = () => {
      setInternalOpen(false);
      onOpenChange?.(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      closePopover();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onOpenChange]);

  return (
    <span ref={rootRef} className="vd-popover vdui-popover">
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            onClick: (event: any) => {
              (children as ReactElement<any>).props.onClick?.(event);
              const nextOpen = !visible;
              setInternalOpen(nextOpen);
              onOpenChange?.(nextOpen);
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

function EmptyComponent({ description }: any) {
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
export function Divider({ type = 'horizontal', className }: any) {
  return <span className={cn('vdui-divider', `vdui-divider-${type}`, className)} />;
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
export function Row({ children, className, gutter }: any) {
  return (
    <div
      className={cn('vdui-row', className)}
      style={{ gap: Array.isArray(gutter) ? gutter[0] : gutter }}
    >
      {children}
    </div>
  );
}
export function Col({ children, className, span }: any) {
  return (
    <div
      className={cn('vdui-col', className)}
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
      role="switch"
      aria-checked={!!checked}
      className={cn('vdui-switch', checked && 'vdui-switch-checked', className)}
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
    <label className={cn('vdui-checkbox-wrapper', className)}>
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
        <span className="vdui-checkbox-group">
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
  ({ checked, disabled, onChange, children, value, name, optionType }: any) => (
    <label
      className={cn(
        'vdui-radio-wrapper',
        checked && 'vdui-radio-wrapper-checked',
        disabled && 'vdui-radio-wrapper-disabled',
        optionType === 'button' && 'vdui-radio-button-wrapper',
        optionType === 'button' && checked && 'vdui-radio-button-wrapper-checked',
      )}
    >
      <input
        type="radio"
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={() => onChange?.(value)}
      />
      <span>{children}</span>
    </label>
  ),
  {
    Group: ({ options = [], value, onChange, children, optionType, className }: any) => (
      <span className={cn('vdui-radio-group', className)}>
        {options.map((option: any) => (
          <Radio
            key={String(option.value)}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            optionType={optionType}
            onChange={(nextValue: any) => onChange?.({ target: { value: nextValue } })}
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
    <div className={cn('vdui-progress', status && `vdui-progress-${status}`)}>
      <span className="vdui-progress-bg" style={{ width: `${percent}%` }} />
    </div>
  );
}
export function Skeleton(_props: any) {
  return <div className="vdui-skeleton" />;
}
export function Alert({ message: msg, description, type }: any) {
  return (
    <div className={cn('vdui-alert', type && `vdui-alert-${type}`)}>
      <strong>{msg}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}
export function QRCode({ value }: any) {
  return <div className="vdui-qrcode">{value}</div>;
}
export function Slider({ value, onChange, min = 0, max = 100, step = 1, disabled }: any) {
  return (
    <input
      className="vdui-slider"
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
    <span className={cn('vdui-range-picker', props.className)}>
      <Input type="datetime-local" />
      <Input type="datetime-local" />
    </span>
  ),
});
export const TreeSelect = Select;

const configContextValue = {
  getPrefixCls: (suffix?: string, customizePrefixCls?: string) =>
    customizePrefixCls || (suffix ? `vdui-${suffix}` : 'vdui'),
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
