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
      color="#516f90"
    >
      {/* <Icon type={`icon-${icon}`} /> */}
    </Tooltip>
  );
};

export default IconWithTooltip;
