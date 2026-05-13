import './index.scss';

import { useMemo, type FC, type ReactNode } from 'react';

export interface SettingItemProps {
  mainTitle: ReactNode;
  subTitle?: ReactNode;
  optionSlot?: ReactNode;
  children?: ReactNode;
  sticky?: boolean;
}

export const SettingItem: FC<SettingItemProps> = (props) => {
  const rightContentClass = useMemo(() => {
    const baseClass = 'right-content';
    return props.subTitle || props.children ? `${baseClass} has-subtitle-or-content` : baseClass;
  }, [props.subTitle, props.children]);

  const mainTitleClass = useMemo(() => {
    const baseClass = 'main-title';
    return props.subTitle || props.children ? `${baseClass} has-subtitle-or-content` : baseClass;
  }, [props.subTitle, props.children]);

  const titleWrapperClass = useMemo(() => {
    let baseClass = 'title-wrapper';
    if (props.children) {
      baseClass = `${baseClass} has-children`;
    }
    if (props.subTitle || props.children) {
      baseClass = `${baseClass} has-subtitle-or-content`;
    }
    if (props.sticky) {
      baseClass = `${baseClass} sticky`;
    }
    return baseClass;
  }, [props.children, props.subTitle, props.children]);

  return (
    <div className="setting-item-wrapper">
      <div className={titleWrapperClass}>
        <div className="left-content">
          <div className={mainTitleClass}>{props.mainTitle}</div>
          {props.subTitle && <div className="sub-title">{props.subTitle}</div>}
        </div>
        {props.optionSlot && <div className={rightContentClass}>{props.optionSlot}</div>}
      </div>
      {props.children && <div className="content-wrapper">{props.children}</div>}
    </div>
  );
};
