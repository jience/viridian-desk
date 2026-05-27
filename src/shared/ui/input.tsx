import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from './lib/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
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
  (
    {
      className,
      autoSize,
      showCount: _showCount,
      rows,
      value: textAreaValue,
      defaultValue: textAreaDefaultValue,
      ...props
    },
    ref,
  ) => {
    const minRows = typeof autoSize === 'object' ? autoSize.minRows : undefined;
    const nativeValueProps =
      textAreaValue !== undefined
        ? { value: textAreaValue }
        : { defaultValue: textAreaDefaultValue };

    return (
      <textarea
        ref={ref}
        className={cn('vdui-input vdui-input-textarea', className)}
        rows={rows ?? minRows}
        {...nativeValueProps}
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
