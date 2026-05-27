import * as DropdownMenu from '@/shared/ui/components/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface UserMenuProps {
  initials: string;
  name: string;
  email: string;
}

const menuItemClassName =
  'vd-user-menu__item';

export function UserMenu({ initials, name, email }: UserMenuProps) {
  const { t } = useTranslation('common');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={name}
          className="vd-user-menu__trigger vd-focus-ring"
          type="button"
        >
          {initials}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="vd-user-menu__content"
          side="right"
          sideOffset={12}
        >
          <div className="vd-user-menu__header">
            <div className="vd-user-menu__name">{name}</div>
            <div className="vd-user-menu__email">{email}</div>
          </div>
          <DropdownMenu.Item className={menuItemClassName}>
            {t('user.personalInformation')}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClassName}>{t('user.preferences')}</DropdownMenu.Item>
          <DropdownMenu.Item
            className={`${menuItemClassName} vd-user-menu__item--danger`}
          >
            {t('user.signOut')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
