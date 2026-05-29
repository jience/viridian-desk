import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from './lib/cn';

type Option<ValueType = string | number | boolean> = {
  label?: ReactNode;
  title?: ReactNode;
  value: ValueType;
  disabled?: boolean;
};

export function Switch({
  checked,
  onChange,
  className,
  disabled,
  size: _size,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  size?: string;
  [key: string]: unknown;
}) {
  return (
    <SwitchPrimitive.Root
      disabled={disabled}
      checked={!!checked}
      className={cn('vdui-switch', checked && 'vdui-switch-checked', className)}
      onCheckedChange={onChange}
    >
      <SwitchPrimitive.Thumb className="vdui-switch-thumb" />
    </SwitchPrimitive.Root>
  );
}

export const Checkbox = Object.assign(
  ({
    checked,
    children,
    disabled,
    className,
    ...inputProps
  }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    children?: ReactNode;
  }) => (
    <label
      className={cn(
        'vdui-checkbox-wrapper',
        checked && 'vdui-checkbox-wrapper-checked',
        disabled && 'vdui-checkbox-wrapper-disabled',
        className,
      )}
    >
      <input
        {...inputProps}
        type="checkbox"
        checked={checked}
        disabled={disabled}
      />
      {children !== undefined && <span>{children}</span>}
    </label>
  ),
  {
    Group: ({
      options,
      value = [],
      defaultValue = [],
      onChange,
      children,
    }: {
      options?: Option[];
      value?: Array<Option['value']>;
      defaultValue?: Array<Option['value']>;
      onChange?: (value: Array<Option['value']>) => void;
      children?: ReactNode;
    }) => {
      const current = value.length ? value : defaultValue;
      const opts = options || [];
      return (
        <span className="vdui-checkbox-group">
          {opts.map((option) => (
            <Checkbox
              key={String(option.value)}
              checked={current.includes(option.value)}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...current, option.value]
                  : current.filter((item) => item !== option.value);
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

type RadioChange<ValueType> = {
  target: {
    value: ValueType;
  };
};

export const Radio = Object.assign(
  ({
    checked,
    disabled,
    onChange,
    children,
    value,
    name,
    optionType,
    inputProps,
    className,
  }: {
    checked?: boolean;
    disabled?: boolean;
    onChange?: (value: unknown) => void;
    children?: ReactNode;
    value?: unknown;
    name?: string;
    optionType?: 'button' | 'default';
    className?: string;
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'type' | 'checked' | 'disabled' | 'name' | 'onChange' | 'value'
    >;
  }) => (
    <label
      className={cn(
        'vdui-radio-wrapper',
        checked && 'vdui-radio-wrapper-checked',
        disabled && 'vdui-radio-wrapper-disabled',
        optionType === 'button' && 'vdui-radio-button-wrapper',
        optionType === 'button' && checked && 'vdui-radio-button-wrapper-checked',
        className,
      )}
    >
      <input
        {...inputProps}
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
    Group: ({
      options = [],
      value,
      onChange,
      children,
      optionType,
      className,
    }: {
      options?: Option[];
      value?: Option['value'];
      onChange?: (event: RadioChange<Option['value']>) => void;
      children?: ReactNode;
      optionType?: 'button' | 'default';
      className?: string;
    }) => (
      <span className={cn('vdui-radio-group', className)}>
        {options.map((option) => (
          <Radio
            key={String(option.value)}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            optionType={optionType}
            onChange={(nextValue) =>
              onChange?.({ target: { value: nextValue as Option['value'] } })
            }
          >
            {option.label}
          </Radio>
        ))}
        {children}
      </span>
    ),
  },
);

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
}: {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  [key: string]: unknown;
}) {
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
