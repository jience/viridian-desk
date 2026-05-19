import { Dropdown, Button } from '@/ui';
import './index.scss';
import type { ItemType } from '@/ui';
import { EllipsisOutlined } from '@/ui/icons';
import { useTranslation } from 'react-i18next';

export interface DropdownBtnProps {
  disabled?: boolean;
  options?: ItemType[];
  placement?:
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'bottom'
    | 'topCenter'
    | 'bottomCenter'
    | 'top';
}

export const DropdownBtn = (props: DropdownBtnProps) => {
  const { disabled = false, options = [], placement = 'bottom' } = props;
  const { t } = useTranslation();

  return (
    <div className="dropdown-wrapper">
      <Dropdown
        menu={{ items: options }}
        placement={placement}
        trigger={['click']}
        disabled={disabled}
      >
        <Button
          disabled={disabled}
          aria-label={t('config_page.more_actions')}
          className="operate-btn"
          icon={<EllipsisOutlined />}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};
