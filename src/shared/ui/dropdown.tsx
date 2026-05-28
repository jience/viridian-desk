import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

import { cn } from './lib/cn';
import type { ItemType, MenuClickInfo, MenuProps } from './types';

type DropdownProps = {
  menu?: MenuProps | ReactNode;
  children?: ReactNode;
  classNames?: {
    root?: string;
  };
  placement?:
    | 'bottomLeft'
    | 'bottomRight'
    | 'topLeft'
    | 'topRight'
    | 'top'
    | 'bottom'
    | 'topCenter'
    | 'bottomCenter';
  trigger?: string[];
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  [key: string]: unknown;
};

type FloatingSide = 'top' | 'right' | 'bottom' | 'left';
type FloatingAlign = 'start' | 'center' | 'end';

type TriggerElementProps = {
  'aria-haspopup'?: 'menu';
};

const getSide = (placement?: string): FloatingSide => {
  if (placement?.startsWith('top')) return 'top';
  if (placement?.startsWith('right')) return 'right';
  if (placement?.startsWith('left')) return 'left';
  return 'bottom';
};

const getAlign = (placement?: string): FloatingAlign => {
  if (placement?.endsWith('Left')) return 'start';
  if (placement?.endsWith('Right')) return 'end';
  return 'center';
};

const menuConfigFrom = (menu?: MenuProps | ReactNode) =>
  menu && typeof menu === 'object' && !isValidElement(menu) ? (menu as MenuProps) : undefined;

const menuClickInfo = (item: ItemType, event: Event): MenuClickInfo => ({
  key: item.key,
  domEvent: event as unknown as MouseEvent,
});

export function Dropdown({ menu, children, classNames, placement = 'bottomRight' }: DropdownProps) {
  const menuConfig = menuConfigFrom(menu);
  const customMenu = menuConfig ? null : (menu as ReactNode);

  if (!isValidElement(children)) return children;

  const triggerElement = cloneElement(children as ReactElement<TriggerElementProps>, {
    'aria-haspopup': 'menu',
  });

  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <DropdownMenuPrimitive.Trigger asChild>{triggerElement}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            'vdui-dropdown',
            `vdui-dropdown--${placement}`,
            classNames?.root,
            menuConfig?.className,
          )}
          side={getSide(placement)}
          align={getAlign(placement)}
          sideOffset={8}
        >
          {menuConfig
            ? (menuConfig.items || []).map((item: ItemType) => (
                <DropdownMenuPrimitive.Item
                  key={String(item.key)}
                  className={cn('vdui-dropdown-menu-item', item.danger && 'is-danger')}
                  disabled={item.disabled}
                  onSelect={(event) => {
                    const info = menuClickInfo(item, event);
                    item.onClick?.(info);
                    menuConfig.onClick?.(info);
                  }}
                >
                  {item.icon}
                  <span className="vdui-dropdown-menu-title-content">{item.label}</span>
                </DropdownMenuPrimitive.Item>
              ))
            : customMenu}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
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
    Item: ({
      children,
      onClick,
      disabled,
      className,
    }: {
      children?: ReactNode;
      onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
      disabled?: boolean;
      className?: string;
    }) => (
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
