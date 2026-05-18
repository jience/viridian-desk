import { Tooltip } from '@/ui';
import './index.scss';

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
      title={<div className="approval-icon-tooltip-content">{tips}</div>}
      color="var(--vd-color-panel, #1c211f)"
    >
      {/* <Icon type={`icon-${icon}`} /> */}
    </Tooltip>
  );
};

export default IconWithTooltip;
