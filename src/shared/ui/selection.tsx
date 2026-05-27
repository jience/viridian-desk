import type { ChangeEvent, ReactNode } from 'react';

import { cn } from './lib/cn';

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
