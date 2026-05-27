import type { CSSProperties, ReactNode } from 'react';
import { cn } from './lib/cn';

type EmptyProps = {
  description?: ReactNode;
  className?: string;
  [key: string]: unknown;
};

function EmptyComponent({ description }: EmptyProps) {
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

export function Spin({ spinning, children }: { spinning?: boolean; children?: ReactNode }) {
  return (
    <span className={cn('vdui-spin-nested-loading', spinning && 'is-spinning')}>
      {spinning && <span className="vd-spinner" />}
      <span className="vdui-spin-container">{children}</span>
    </span>
  );
}

export function Tag({
  children,
  color,
  className,
}: {
  children?: ReactNode;
  color?: string;
  className?: string;
  icon?: ReactNode;
  closable?: boolean;
  closeIcon?: ReactNode;
  onClose?: () => void;
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  return (
    <span className={cn('vdui-tag', color && `vdui-tag-${color}`, className)}>{children}</span>
  );
}

export function Divider({
  type = 'horizontal',
  className,
}: {
  type?: 'horizontal' | 'vertical';
  className?: string;
  dashed?: boolean;
  [key: string]: unknown;
}) {
  return <span className={cn('vdui-divider', `vdui-divider-${type}`, className)} />;
}

type SpaceProps = {
  children?: ReactNode;
  className?: string;
  size?: number | string;
  direction?: 'horizontal' | 'vertical';
  wrap?: boolean;
};

function SpaceComponent({
  children,
  className,
  size = 8,
  direction = 'horizontal',
  wrap,
}: SpaceProps) {
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
  Compact: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <span className={cn('vdui-space vdui-space-compact', className)}>{children}</span>
  ),
});

export function Row({
  children,
  className,
  gutter,
}: {
  children?: ReactNode;
  className?: string;
  gutter?: number | [number, number];
}) {
  return (
    <div
      className={cn('vdui-row', className)}
      style={{ gap: Array.isArray(gutter) ? gutter[0] : gutter }}
    >
      {children}
    </div>
  );
}

export function Col({
  children,
  className,
  span,
  offset: _offset,
}: {
  children?: ReactNode;
  className?: string;
  span?: number;
  offset?: number;
  [key: string]: unknown;
}) {
  return (
    <div
      className={cn('vdui-col', className)}
      style={{ flex: span ? `0 0 ${(span / 24) * 100}%` : undefined }}
    >
      {children}
    </div>
  );
}

export function Progress({
  percent = 0,
  status,
}: {
  percent?: number;
  status?: 'success' | 'exception' | 'active' | 'normal' | string;
  showInfo?: boolean;
  strokeColor?: string | Record<string, string>;
  strokeLinecap?: string;
  size?: string | number;
  [key: string]: unknown;
}) {
  return (
    <div className={cn('vdui-progress', status && `vdui-progress-${status}`)}>
      <span className="vdui-progress-bg" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function Skeleton(_props: { className?: string; active?: boolean; [key: string]: unknown }) {
  return <div className="vdui-skeleton" />;
}

export function Alert({
  message: msg,
  description,
  type,
}: {
  message?: ReactNode;
  description?: ReactNode;
  type?: 'success' | 'info' | 'warning' | 'error' | string;
}) {
  return (
    <div className={cn('vdui-alert', type && `vdui-alert-${type}`)}>
      <strong>{msg}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}

export function QRCode({ value }: { value?: ReactNode; style?: CSSProperties }) {
  return <div className="vdui-qrcode">{value}</div>;
}
