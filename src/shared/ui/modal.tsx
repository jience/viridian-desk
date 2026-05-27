import { useEffect, useId, useRef, type ReactNode } from 'react';

import { Button, type ButtonProps } from './button';
import { showConfirm } from './confirm';
import type { ConfirmProps } from './confirm';
import { cn } from './lib/cn';

export type ModalFunc = (props: ModalProps) => {
  destroy: () => void;
  update: (props?: ModalProps) => void;
};

export interface ModalProps {
  open?: boolean;
  visible?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onCancel?: () => void;
  onOk?: (close?: () => void) => void | Promise<void>;
  okText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
  width?: number | string;
  centered?: boolean;
  className?: string;
  destroyOnHidden?: boolean;
  destroyOnClose?: boolean;
  keyboard?: boolean;
  maskClosable?: boolean;
  okButtonProps?: ConfirmProps['okButtonProps'];
  cancelButtonProps?: ConfirmProps['cancelButtonProps'];
  afterClose?: () => void;
  [key: string]: unknown;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute('disabled') && element.offsetParent !== null,
  );

export const Modal = Object.assign(
  function ModalComponent(props: ModalProps) {
    const open = props.open ?? props.visible;
    const titleId = useId();
    const dialogRef = useRef<HTMLElement>(null);
    const onCancelRef = useRef(props.onCancel);
    const keyboardRef = useRef(props.keyboard);

    useEffect(() => {
      onCancelRef.current = props.onCancel;
      keyboardRef.current = props.keyboard;
    });

    useEffect(() => {
      if (!open) return;

      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 0);
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && keyboardRef.current !== false) {
          event.stopPropagation();
          onCancelRef.current?.();
        }

        if (event.key !== 'Tab' || !dialogRef.current) return;

        const focusableElements = getFocusableElements(dialogRef.current);
        if (!focusableElements.length) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleKeyDown);
        activeElement?.focus?.();
      };
    }, [open]);

    if (!open && (props.destroyOnHidden || props.destroyOnClose)) return null;
    if (!open) return null;
    const footer =
      props.footer === undefined ? (
        <div className="vdui-modal-footer">
          <Button onClick={props.onCancel} {...(props.cancelButtonProps as ButtonProps)}>
            {props.cancelText ?? 'Cancel'}
          </Button>
          <Button
            type="primary"
            loading={props.confirmLoading}
            onClick={() => props.onOk?.()}
            {...(props.okButtonProps as ButtonProps)}
          >
            {props.okText ?? 'OK'}
          </Button>
        </div>
      ) : (
        props.footer
      );

    return (
      <div className={cn('vdui-modal-root', props.centered && 'vdui-modal-root--centered')}>
        <div
          className="vdui-modal-mask"
          onClick={props.maskClosable ? props.onCancel : undefined}
        />
        <div className={cn('vdui-modal-panel', props.className)} style={{ width: props.width }}>
          <section
            ref={dialogRef}
            className="vdui-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={props.title ? titleId : undefined}
            tabIndex={-1}
          >
            {props.title && (
              <header className="vdui-modal-header">
                <div className="vdui-modal-title" id={titleId}>
                  {props.title}
                </div>
              </header>
            )}
            {props.closable !== false && (
              <button
                aria-label="Close"
                className="vdui-modal-close"
                type="button"
                onClick={props.onCancel}
              >
                <span aria-hidden="true" />
              </button>
            )}
            <div className="vdui-modal-body">{props.children}</div>
            {footer}
          </section>
        </div>
      </div>
    );
  },
  {
    confirm: (props: ModalProps) => {
      return showConfirm(props);
    },
    info: (props: ModalProps) => showConfirm({ ...props, variant: 'info' }),
    success: (props: ModalProps) => showConfirm({ ...props, variant: 'success' }),
    error: (props: ModalProps) => showConfirm({ ...props, variant: 'error' }),
    warning: (props: ModalProps) => showConfirm({ ...props, variant: 'warning' }),
    useModal: () => {
      const confirm = (props: ModalProps) => {
        return showConfirm(props);
      };
      return [
        {
          confirm,
          info: confirm,
          success: confirm,
          error: confirm,
          warning: confirm,
        },
        null,
      ] as const;
    },
  },
);
