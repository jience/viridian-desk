import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/ui/lib/cn';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'default' | 'text' | 'link' | 'dashed';
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
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
