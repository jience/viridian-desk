import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

export function Tooltip({ title, children }: any) {
  return isValidElement(children)
    ? cloneElement(children, { title: typeof title === 'string' ? title : undefined } as any)
    : children;
}

type PopoverProps = {
  content?: ReactNode;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  getPopupContainer?: (node: HTMLElement) => any;
  [key: string]: any;
};

export function Popover({ content, children, open, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const visible = open ?? internalOpen;

  useEffect(() => {
    if (!visible) return;

    const closePopover = () => {
      setInternalOpen(false);
      onOpenChange?.(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      closePopover();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onOpenChange]);

  return (
    <span ref={rootRef} className="vd-popover vdui-popover">
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            onClick: (event: any) => {
              (children as ReactElement<any>).props.onClick?.(event);
              const nextOpen = !visible;
              setInternalOpen(nextOpen);
              onOpenChange?.(nextOpen);
            },
          })
        : children}
      {visible && (
        <div className="vdui-popover-inner-content">
          <span className="vdui-popover-arrow" />
          {content}
        </div>
      )}
    </span>
  );
}
