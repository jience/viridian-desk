import { Tooltip } from 'antd';

interface IconWithTooltipProps {
  icon: string;
  tips: React.ReactNode;
  getPopupContainer?: () => HTMLElement;
}

const IconWithTooltip: React.FC<IconWithTooltipProps> = ({
  // icon,
  tips,
  getPopupContainer = () => document.body,
}) => {
  return (
    <Tooltip
      getPopupContainer={getPopupContainer}
      title={<div style={{ padding: '0 12px' }}>{tips}</div>}
      color="var(--vd-color-panel, #1c211f)"
    >
      {/* <Icon type={`icon-${icon}`} /> */}
    </Tooltip>
  );
};

export default IconWithTooltip;
