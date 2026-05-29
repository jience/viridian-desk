import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, type ReactNode } from 'react';

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
  keyboard?: boolean;
  maskClosable?: boolean;
  okButtonProps?: ConfirmProps['okButtonProps'];
  cancelButtonProps?: ConfirmProps['cancelButtonProps'];
  afterClose?: () => void;
  [key: string]: unknown;
}

export const Modal = Object.assign(
  function ModalComponent(props: ModalProps) {
    const open = Boolean(props.open);
    const wasOpenRef = useRef(false);
    const contentRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (wasOpenRef.current && !open) {
        props.afterClose?.();
      }
      wasOpenRef.current = open;
    }, [open, props.afterClose]);

    if (!open) return null;

    const maskClosable = props.maskClosable === true;
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
      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) props.onCancel?.();
        }}
      >
        <Dialog.Portal>
          <div className={cn('vdui-modal-root', props.centered && 'vdui-modal-root--centered')}>
            <Dialog.Overlay asChild>
              <div className="vdui-modal-mask" />
            </Dialog.Overlay>
            <div
              className={cn('vdui-modal-panel', props.className)}
              style={{ width: props.width }}
            >
              <Dialog.Content
                asChild
                aria-describedby={undefined}
                onEscapeKeyDown={(event) => {
                  if (props.keyboard === false) event.preventDefault();
                }}
                onPointerDownOutside={(event) => {
                  if (!maskClosable) event.preventDefault();
                }}
                onInteractOutside={(event) => {
                  if (!maskClosable) event.preventDefault();
                }}
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                  window.requestAnimationFrame(() => contentRef.current?.focus());
                }}
              >
                <section ref={contentRef} className="vdui-modal-content" tabIndex={-1}>
                  {props.title && (
                    <header className="vdui-modal-header">
                      <Dialog.Title asChild>
                        <div className="vdui-modal-title">{props.title}</div>
                      </Dialog.Title>
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
              </Dialog.Content>
            </div>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
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
