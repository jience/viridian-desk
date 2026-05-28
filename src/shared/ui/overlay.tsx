import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type CSSProperties,
  type FocusEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';

type TriggerElementProps = {
  onClick?: MouseEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
};

type OverlaySide = 'top' | 'right' | 'bottom' | 'left';
type OverlayAlign = 'start' | 'center' | 'end';

const getSide = (placement?: string): OverlaySide => {
  if (placement?.startsWith('left')) return 'left';
  if (placement?.startsWith('right')) return 'right';
  if (placement?.startsWith('bottom')) return 'bottom';
  return 'top';
};

const getAlign = (placement?: string): OverlayAlign => {
  if (placement?.endsWith('Left') || placement?.endsWith('Top')) return 'start';
  if (placement?.endsWith('Right') || placement?.endsWith('Bottom')) return 'end';
  return 'center';
};

const normalizeTriggers = (trigger?: string | string[]) => {
  if (!trigger) return new Set(['click']);
  return new Set(Array.isArray(trigger) ? trigger : [trigger]);
};

export type TooltipProps = {
  title?: ReactNode;
  children?: ReactNode;
  placement?: string;
  color?: string;
  arrow?: boolean;
  trigger?: string | string[];
  showArrow?: boolean;
  overlayInnerStyle?: CSSProperties;
  getPopupContainer?: (node: HTMLElement) => ParentNode | HTMLElement | null;
  [key: string]: unknown;
};

export function Tooltip({
  title,
  children,
  placement,
  color,
  arrow,
  showArrow,
  overlayInnerStyle,
}: TooltipProps) {
  if (!title || !isValidElement(children)) return children;

  return (
    <TooltipPrimitive.Provider delayDuration={260} skipDelayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="vdui-tooltip-content"
            side={getSide(placement)}
            align={getAlign(placement)}
            sideOffset={8}
            style={{ ...overlayInnerStyle, background: color ?? overlayInnerStyle?.background }}
          >
            {title}
            {arrow !== false && showArrow !== false && (
              <TooltipPrimitive.Arrow className="vdui-tooltip-arrow" />
            )}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

type PopoverProps = {
  title?: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: string;
  trigger?: string | string[];
  getPopupContainer?: (node: HTMLElement) => ParentNode | HTMLElement | null;
  [key: string]: unknown;
};

export function Popover({
  title,
  content,
  children,
  open,
  onOpenChange,
  placement,
  trigger,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerTypes = useMemo(() => normalizeTriggers(trigger), [trigger]);
  const visible = open ?? internalOpen;

  const setVisible = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  if (!isValidElement(children)) return children;

  const child = children as ReactElement<TriggerElementProps>;
  const triggerElement = cloneElement(child, {
    onClick: (event) => {
      child.props.onClick?.(event);
      if (!triggerTypes.has('click')) {
        event.preventDefault();
      }
    },
    onFocus: (event) => {
      child.props.onFocus?.(event);
      if (triggerTypes.has('focus')) setVisible(true);
    },
    onBlur: (event) => {
      child.props.onBlur?.(event);
      if (triggerTypes.has('focus')) setVisible(false);
    },
    onMouseEnter: (event) => {
      child.props.onMouseEnter?.(event);
      if (triggerTypes.has('hover')) setVisible(true);
    },
    onMouseLeave: (event) => {
      child.props.onMouseLeave?.(event);
      if (triggerTypes.has('hover')) setVisible(false);
    },
  });

  return (
    <PopoverPrimitive.Root open={visible} onOpenChange={setVisible}>
      <PopoverPrimitive.Trigger asChild>{triggerElement}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="vdui-popover-inner-content"
          side={getSide(placement)}
          align={getAlign(placement)}
          sideOffset={8}
        >
          <PopoverPrimitive.Arrow className="vdui-popover-arrow" />
          {title && <div className="vdui-popover-title">{title}</div>}
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
