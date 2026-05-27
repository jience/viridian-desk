import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from 'react';

import { cn } from './lib/cn';
import type { DefaultOptionType, SelectProps } from './types';

type OptionElementProps = {
  value?: unknown;
  children?: ReactNode;
  disabled?: boolean;
};

const readOptions = (options?: DefaultOptionType[], children?: ReactNode): DefaultOptionType[] => {
  if (options) return options;
  const list: DefaultOptionType[] = [];
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (!isValidElement(child)) return;
    const props = child.props as OptionElementProps;
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
  <ValueType = unknown>(props: SelectProps<ValueType>): ReactElement | null;
  Option: (props: { children?: ReactNode }) => ReactElement;
};

export const Select = Object.assign(
  function SelectComponent<ValueType = unknown>(props: SelectProps<ValueType>) {
    const options = readOptions(props.options, props.children);
    const multiple = props.mode === 'multiple' || props.mode === 'tags';
    const isControlled = props.value !== undefined;
    const [internalValue, setInternalValue] = useState<unknown>(
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

    const commitValue = (nextValue: unknown, option?: DefaultOptionType) => {
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
    Option: ({ children }: { children?: ReactNode }) => <>{children}</>,
  },
);

export function AutoComplete({ children, options, onSelect, showSearch }: SelectProps) {
  const datalistId = useMemo(() => `vd-ac-${Math.random().toString(36).slice(2)}`, []);
  if (!isValidElement(children)) return null;
  return (
    <>
      {cloneElement(
        children as ReactElement<{
          list?: string;
          onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
          onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
        }>,
        {
        list: datalistId,
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          if (typeof showSearch === 'object') showSearch.onSearch?.(value);
          (
            children as ReactElement<{
              onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
            }>
          ).props.onChange?.(event);
        },
        onBlur: (event: FocusEvent<HTMLInputElement>) => onSelect?.(event.target.value, undefined),
        },
      )}
      <datalist id={datalistId}>
        {(options || []).map((option) => (
          <option key={String(option.key ?? option.value)} value={String(option.value ?? '')} />
        ))}
      </datalist>
    </>
  );
}

export const TreeSelect = Select;
