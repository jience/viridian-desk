import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SelectPrimitive from '@radix-ui/react-select';
import { useState, type ReactElement, type ReactNode } from 'react';

import { cn } from './lib/cn';
import type { DefaultOptionType, SelectProps } from './types';

type SelectComponentType = {
  <ValueType = unknown>(props: SelectProps<ValueType>): ReactElement | null;
};

type FloatingSide = 'top' | 'right' | 'bottom' | 'left';
type FloatingAlign = 'start' | 'center' | 'end';

const getSide = (placement?: string): FloatingSide => {
  if (placement?.startsWith('top')) return 'top';
  if (placement?.startsWith('right')) return 'right';
  if (placement?.startsWith('left')) return 'left';
  return 'bottom';
};

const getAlign = (placement?: string): FloatingAlign => {
  if (placement?.endsWith('Left')) return 'start';
  if (placement?.endsWith('Right')) return 'end';
  return 'center';
};

const optionId = (option: DefaultOptionType, index: number) => {
  const rawValue = option.value ?? option.key ?? index;
  const value = String(rawValue);
  return value || `vdui-empty-${index}`;
};

const optionLabel = (option?: DefaultOptionType): ReactNode => option?.label ?? option?.key;

export const Select = function SelectComponent<ValueType = unknown>(props: SelectProps<ValueType>) {
  const options = props.options ?? [];
  const normalizedOptions = options.map((option, index) => ({
    id: optionId(option, index),
    option,
  }));
  const multiple = props.mode === 'multiple' || props.mode === 'tags';
  const isControlled = props.value !== undefined;
  const [internalValue, setInternalValue] = useState<unknown>(
    props.defaultValue ?? (multiple ? [] : undefined),
  );
  const [open, setOpen] = useState(false);
  const value = isControlled ? props.value : internalValue;
  const currentValues = multiple ? (Array.isArray(value) ? value : []) : [];
  const selectedValues = multiple
    ? currentValues.map(String)
    : value === undefined || value === null || value === ''
      ? []
      : [String(value)];
  const selectedOptions = normalizedOptions.filter(({ id }) => selectedValues.includes(id));
  const selectedLabels = selectedOptions
    .map(({ option }) => optionLabel(option))
    .filter((label): label is Exclude<ReactNode, boolean | null | undefined> => !!label);
  const disabled = props.disabled || props.loading;
  const popupClassName = cn(
    'vdui-select-dropdown',
    props.placement && `vdui-select-dropdown--${props.placement}`,
    props.classNames?.popup,
  );
  const triggerClassName = cn(
    'vdui-select',
    `vdui-select-${props.size ?? 'middle'}`,
    open && 'vdui-select-open',
    disabled && 'vdui-select-disabled',
    props.className,
    props.classNames?.root,
  );

  const commitValue = (nextValue: unknown, option?: DefaultOptionType) => {
    if (!isControlled) setInternalValue(nextValue);
    props.onChange?.(nextValue as ValueType, option);
    props.onSelect?.(nextValue as ValueType, option);
  };

  if (multiple) {
    return (
      <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={triggerClassName}
            disabled={disabled}
            style={props.style}
            aria-haspopup="listbox"
          >
            {selectedValues.length > 0 ? (
              <span className="vdui-select-selection-item">
                {selectedLabels.map((label, index) => (
                  <span key={selectedValues[index]}>
                    {index > 0 ? ', ' : null}
                    {label}
                  </span>
                ))}
              </span>
            ) : props.placeholder ? (
              <span className="vdui-select-placeholder">{props.placeholder}</span>
            ) : null}
            {props.suffixIcon === null ? null : (
              <span className="vdui-select-arrow" aria-hidden="true">
                {props.suffixIcon ?? '▾'}
              </span>
            )}
          </button>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            className={popupClassName}
            side={getSide(props.placement)}
            align={getAlign(props.placement)}
            sideOffset={8}
          >
            {normalizedOptions.map(({ id, option }) => {
              const selected = selectedValues.includes(id);

              return (
                <DropdownMenuPrimitive.CheckboxItem
                  key={String(option.key ?? id)}
                  className={cn('vdui-select-option', selected && 'is-selected')}
                  checked={selected}
                  disabled={option.disabled}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() => {
                    const nextValues = selected
                      ? currentValues.filter((item) => String(item) !== id)
                      : [...currentValues, option.value];
                    commitValue(nextValues, option);
                  }}
                >
                  <span className="vdui-select-option-label">{option.label}</span>
                  <DropdownMenuPrimitive.ItemIndicator className="vdui-select-option-check">
                    ✓
                  </DropdownMenuPrimitive.ItemIndicator>
                </DropdownMenuPrimitive.CheckboxItem>
              );
            })}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    );
  }

  const selectedValue = selectedValues[0];
  const rootValueProps = isControlled
    ? { value: selectedValue ?? '' }
    : { defaultValue: props.defaultValue === undefined ? undefined : String(props.defaultValue) };

  return (
    <SelectPrimitive.Root
      {...rootValueProps}
      open={open}
      disabled={disabled}
      onOpenChange={setOpen}
      onValueChange={(nextValue) => {
        const selectedOption = normalizedOptions.find(({ id }) => id === nextValue)?.option;
        if (!selectedOption) return;
        commitValue(selectedOption?.value, selectedOption);
      }}
    >
      <SelectPrimitive.Trigger
        className={triggerClassName}
        style={props.style}
        aria-label={props.placeholder}
      >
        <SelectPrimitive.Value
          className={cn(
            'vdui-select-value',
            selectedValue ? 'vdui-select-selection-item' : 'vdui-select-placeholder',
          )}
          placeholder={props.placeholder}
        />
        {props.suffixIcon === null ? null : (
          <SelectPrimitive.Icon className="vdui-select-arrow">
            {props.suffixIcon ?? '▾'}
          </SelectPrimitive.Icon>
        )}
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={popupClassName}
          position="popper"
          side={getSide(props.placement)}
          align={getAlign(props.placement)}
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="vdui-select-viewport">
            {normalizedOptions.map(({ id, option }) => (
              <SelectPrimitive.Item
                key={String(option.key ?? id)}
                className={cn('vdui-select-option', selectedValue === id && 'is-selected')}
                value={id}
                disabled={option.disabled}
              >
                <SelectPrimitive.ItemText className="vdui-select-option-label">
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="vdui-select-option-check">
                  ✓
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
} as SelectComponentType;
