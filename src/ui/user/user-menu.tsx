import * as DropdownMenu from '@/ui/components/dropdown-menu';

interface UserMenuProps {
  initials: string;
  name: string;
  email: string;
}

const menuItemClassName =
  'rounded-xl px-3 py-2 text-sm outline-none hover:bg-vd-panel-subtle data-[highlighted]:bg-vd-panel-subtle data-[highlighted]:text-vd-text';

export function UserMenu({ initials, name, email }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={name}
          className="vd-focus-ring grid size-12 place-items-center rounded-2xl bg-vd-panel text-sm font-bold text-vd-rail"
          type="button"
        >
          {initials}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="z-50 w-72 rounded-2xl border border-vd-border bg-vd-panel p-2 text-vd-text shadow-xl"
          side="right"
          sideOffset={12}
        >
          <div className="border-b border-vd-border p-3">
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-vd-muted">{email}</div>
          </div>
          <DropdownMenu.Item className={menuItemClassName}>
            Personal information
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClassName}>
            Preferences
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={`${menuItemClassName} text-vd-danger data-[highlighted]:text-vd-danger`}
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
