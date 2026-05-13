import { Dropdown, Button } from 'antd';
import './index.scss';
import type { ItemType } from 'antd/es/menu/interface';
import { EllipsisOutlined } from '@ant-design/icons';

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
          className="operate-btn"
          icon={<EllipsisOutlined />}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};
