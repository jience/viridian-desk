import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { cn } from './lib/cn';
import type { ItemType, MenuProps } from './types';

export function Dropdown({ menu, children, classNames, placement = 'bottomRight' }: any) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const shouldFocusMenuRef = useRef(false);

  useEffect(() => {
    if (!open || !shouldFocusMenuRef.current) return;
    shouldFocusMenuRef.current = false;
    window.setTimeout(() => {
      const firstItem = rootRef.current?.querySelector<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)',
      );
      firstItem?.focus();
    }, 0);
  }, [open]);

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
  };

  const focusMenuItem = (current: HTMLElement, direction: 'next' | 'prev' | 'first' | 'last') => {
    const menuRoot = current.closest('[role="menu"]');
    if (!menuRoot) return;

    const items = Array.from(
      menuRoot.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
    );
    if (!items.length) return;

    const currentIndex = items.indexOf(current as HTMLButtonElement);
    const lastIndex = items.length - 1;
    const nextIndex =
      direction === 'first'
        ? 0
        : direction === 'last'
          ? lastIndex
          : direction === 'next'
            ? currentIndex >= lastIndex
              ? 0
              : currentIndex + 1
            : currentIndex <= 0
              ? lastIndex
              : currentIndex - 1;

    items[nextIndex]?.focus();
  };

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        onClick: (event: any) => {
          event.stopPropagation();
          setOpen((value) => !value);
          (children as ReactElement<any>).props.onClick?.(event);
        },
        onKeyDown: (event: ReactKeyboardEvent) => {
          (children as ReactElement<any>).props.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            shouldFocusMenuRef.current = !open;
            setOpen((value) => !value);
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            shouldFocusMenuRef.current = true;
            setOpen(true);
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
        },
      })
    : children;

  return (
    <span
      ref={rootRef}
      className="vd-dropdown"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
        window.setTimeout(() => {
          if (!rootRef.current?.contains(document.activeElement)) {
            setOpen(false);
          }
        }, 120);
      }}
      tabIndex={-1}
    >
      {child}
      {open && (
        <div
          className={cn(
            'vdui-dropdown',
            `vdui-dropdown--${placement}`,
            classNames?.root,
            menu?.className,
          )}
          role="menu"
        >
          {(menu?.items || []).map((item: ItemType) => (
            <button
              key={String(item.key)}
              className={cn('vdui-dropdown-menu-item', item.danger && 'is-danger')}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(event) => {
                const info = { key: item.key, domEvent: event };
                item.onClick?.(info);
                menu?.onClick?.(info);
                setOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setOpen(false);
                  focusTrigger();
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'next');
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'prev');
                }
                if (event.key === 'Home') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'first');
                }
                if (event.key === 'End') {
                  event.preventDefault();
                  focusMenuItem(event.currentTarget, 'last');
                }
                if (event.key === 'Tab') {
                  setOpen(false);
                }
              }}
            >
              {item.icon}
              <span className="vdui-dropdown-menu-title-content">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

export const Menu = Object.assign(
  function MenuComponent({ children, items, onClick, className }: MenuProps) {
    return (
      <div className={cn('vdui-menu', className)}>
        {items?.map((item) => (
          <button
            key={String(item.key)}
            type="button"
            disabled={item.disabled}
            onClick={(event) => onClick?.({ key: item.key, domEvent: event })}
          >
            {item.label}
          </button>
        ))}
        {children}
      </div>
    );
  },
  {
    Item: ({ children, onClick, disabled, className }: any) => (
      <button
        className={cn('vdui-menu-item', className)}
        type="button"
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    ),
  },
);
