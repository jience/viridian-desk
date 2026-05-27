import { cn } from './lib/cn';

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
