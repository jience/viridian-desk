import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from './lib/cn';
import type { AnyRecord } from './types';

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

  const child =
    key && form && isValidElement(children)
      ? cloneElement(children as ReactElement<any>, {
          id: (children as ReactElement<any>).props.id ?? fieldId,
          'aria-invalid': hasError || undefined,
          'aria-describedby': hasError ? errorId : undefined,
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
