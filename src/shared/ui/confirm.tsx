/* eslint-disable react-refresh/only-export-components */
import * as Dialog from '@radix-ui/react-dialog';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import type { Root } from 'react-dom/client';

type ConfirmVariant = 'confirm' | 'info' | 'success' | 'error' | 'warning';
type ConfirmButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  loading?: boolean;
  danger?: boolean;
  block?: boolean;
  shape?: string;
  size?: string;
  icon?: ReactNode;
};

export type ConfirmProps = {
  title?: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
  centered?: boolean;
  className?: string;
  width?: number | string;
  maskClosable?: boolean;
  keyboard?: boolean;
  closable?: boolean;
  type?: ConfirmVariant;
  variant?: ConfirmVariant;
  okButtonProps?: ConfirmButtonProps;
  cancelButtonProps?: ConfirmButtonProps;
  onOk?: (close?: () => void) => void | Promise<void>;
  onCancel?: () => void;
  afterClose?: () => void;
  [key: string]: any;
};

export type ConfirmController = {
  destroy: () => void;
  update: (props?: Partial<ConfirmProps>) => void;
};

const variantIcon: Record<ConfirmVariant, string> = {
  confirm: '?',
  info: 'i',
  success: '✓',
  error: '×',
  warning: '!',
};

const joinClassNames = (...items: Array<string | undefined | false>) =>
  items.filter(Boolean).join(' ');

const toCssSize = (value?: number | string) => (typeof value === 'number' ? `${value}px` : value);

const getNativeButtonProps = (buttonProps?: ConfirmButtonProps) => {
  const next: Record<string, any> = { ...(buttonProps ?? {}) };
  for (const key of [
    'loading',
    'htmlType',
    'type',
    'danger',
    'block',
    'shape',
    'size',
    'icon',
    'children',
    'onClick',
  ]) {
    delete next[key];
  }
  return next;
};

const mergeConfirmProps = (current: ConfirmProps, next?: Partial<ConfirmProps>): ConfirmProps => ({
  ...current,
  ...(next ?? {}),
  okButtonProps: next?.okButtonProps
    ? { ...current.okButtonProps, ...next.okButtonProps }
    : current.okButtonProps,
  cancelButtonProps: next?.cancelButtonProps
    ? { ...current.cancelButtonProps, ...next.cancelButtonProps }
    : current.cancelButtonProps,
});

function ConfirmDialog({
  close,
  open,
  props,
}: {
  close: () => void;
  open: boolean;
  props: ConfirmProps;
}) {
  const contentRef = useRef<HTMLElement>(null);
  const mountedRef = useRef(true);
  const [pending, setPending] = useState(false);
  const variant = props.variant ?? props.type ?? 'confirm';
  const hasContent = props.content !== undefined && props.content !== null;
  const content = hasContent ? props.content : props.children;
  const showIcon = props.icon !== null;
  const okButtonProps = getNativeButtonProps(props.okButtonProps);
  const cancelButtonProps = getNativeButtonProps(props.cancelButtonProps);
  const okLoading = pending || Boolean(props.confirmLoading || props.okButtonProps?.loading);
  const okDisabled = okLoading || Boolean(okButtonProps.disabled);
  const cancelDisabled = Boolean(cancelButtonProps.disabled);
  const okClassName =
    typeof okButtonProps.className === 'string' ? okButtonProps.className : undefined;
  const cancelClassName =
    typeof cancelButtonProps.className === 'string' ? cancelButtonProps.className : undefined;
  delete okButtonProps.className;
  delete okButtonProps.disabled;
  delete cancelButtonProps.className;
  delete cancelButtonProps.disabled;

  const handleCancel = useCallback(() => {
    props.onCancel?.();
    close();
  }, [close, props]);

  const handleOk = useCallback(async () => {
    if (okLoading) return;

    try {
      const result = props.onOk?.(close);
      if (result && typeof (result as Promise<void>).then === 'function') {
        setPending(true);
        await result;
      }
      close();
    } catch {
      if (mountedRef.current) setPending(false);
    }
  }, [close, okLoading, props]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleCancel();
      }}
    >
      <Dialog.Portal forceMount>
        <div
          className={joinClassNames(
            'vdui-modal-root vdui-confirm-root',
            props.centered !== false && 'vdui-modal-root--centered',
            !open && 'vdui-confirm-root--leaving',
          )}
        >
          <Dialog.Overlay asChild forceMount>
            <div className="vdui-modal-mask" />
          </Dialog.Overlay>
          <div
            className={joinClassNames('vdui-modal-panel vdui-confirm-panel', props.className)}
            style={{ width: toCssSize(props.width ?? 440) }}
          >
            <Dialog.Content
              asChild
              forceMount
              onEscapeKeyDown={(event) => {
                if (props.keyboard === false) event.preventDefault();
              }}
              onPointerDownOutside={(event) => {
                if (!props.maskClosable) event.preventDefault();
              }}
              onInteractOutside={(event) => {
                if (!props.maskClosable) event.preventDefault();
              }}
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                window.requestAnimationFrame(() => contentRef.current?.focus());
              }}
            >
              <section
                ref={contentRef}
                className={joinClassNames('vdui-modal-content vdui-confirm-modal', `is-${variant}`)}
                role="alertdialog"
                aria-modal="true"
                aria-live="polite"
                tabIndex={-1}
              >
                {props.closable !== false && (
                  <button
                    aria-label="Close"
                    className="vdui-modal-close vdui-confirm-modal__close"
                    type="button"
                    onClick={handleCancel}
                  >
                    <span aria-hidden="true" />
                  </button>
                )}
                <div
                  className={joinClassNames(
                    'vdui-confirm-modal__body',
                    !showIcon && 'vdui-confirm-modal__body--no-icon',
                  )}
                >
                  {showIcon && (
                    <div className="vdui-confirm-modal__icon" aria-hidden="true">
                      {props.icon ?? variantIcon[variant]}
                    </div>
                  )}
                  <div className="vdui-confirm-modal__copy">
                    <Dialog.Title asChild>
                      <div className="vdui-modal-title vdui-confirm-modal__title">
                        {props.title ?? 'Confirm'}
                      </div>
                    </Dialog.Title>
                    {content && (
                      <Dialog.Description asChild>
                        <div className="vdui-confirm-modal__description">{content}</div>
                      </Dialog.Description>
                    )}
                  </div>
                </div>
                <div className="vdui-modal-footer vdui-confirm-modal__footer">
                  <button
                    {...cancelButtonProps}
                    className={joinClassNames('vdui-btn vdui-btn-normal', cancelClassName)}
                    disabled={cancelDisabled}
                    type="button"
                    onClick={handleCancel}
                  >
                    <span>{props.cancelText ?? 'Cancel'}</span>
                  </button>
                  <button
                    {...okButtonProps}
                    className={joinClassNames('vdui-btn vdui-btn-primary', okClassName)}
                    disabled={okDisabled}
                    type="button"
                    onClick={handleOk}
                  >
                    {okLoading && <span className="vd-spinner vd-spinner--inline" />}
                    <span>{props.okText ?? 'OK'}</span>
                  </button>
                </div>
              </section>
            </Dialog.Content>
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function showConfirm(initialProps: ConfirmProps): ConfirmController {
  const host = document.createElement('div');
  host.className = 'vdui-confirm-host';
  document.body.appendChild(host);

  let root: Root | null = null;
  let props = initialProps;
  let closed = false;
  let cleanupTimer = 0;

  const cleanup = () => {
    window.clearTimeout(cleanupTimer);
    root?.unmount();
    root = null;
    host.remove();
    props.afterClose?.();
  };

  const render = () => {
    root?.render(<ConfirmDialog close={close} open={!closed} props={props} />);
  };

  const close = () => {
    if (closed) return;
    closed = true;
    render();
    cleanupTimer = window.setTimeout(cleanup, 180);
  };

  void import('react-dom/client').then(({ createRoot }) => {
    if (!host.isConnected) return;
    root = createRoot(host);
    render();
  });

  return {
    destroy: close,
    update: (next?: Partial<ConfirmProps>) => {
      if (closed) return;
      props = mergeConfirmProps(props, next);
      render();
    },
  };
}
