import './index.scss';

// UI
import { Divider, Tag, Tooltip } from 'antd';

interface tagObject {
  color: string;
  textColor: string;
  optIcon?: React.ReactNode;
  name: string;
}

interface cardConfig {
  type: string; // normal | normal-row | overSize
  titleConfig: {
    // 左侧标题区配置
    key: string;
    mainTitle: string | React.ReactNode; // 左上主标题文案
    mainTitle_tags?: Array<tagObject>; // 左上主标题末尾标签
    subTitle?: Array<tagObject>; // 左下次标题文案
    middleSlot?: string | React.ReactNode; // 中部插槽
    rightSlot?: string | React.ReactNode; // 右侧插槽
  };
  content?: any; // 标题下内容区域插槽
  clickAction?: boolean; // 是否开启点击事件
  onClick?: (key?: any) => void;
  [propName: string]: boolean | string | number | object | void | (() => void);
}

const IntegratedCard = (props: cardConfig) => {
  /**
   * @author QL
   * @date 2022-11-07 09:48:06
   * @version V..
   * @description useState & other Data
   */
  const {
    type = 'normal',
    titleConfig,
    content = null,
    clickAction = false,
    onClick = () => {},
  } = props;

  /**
   * @author QL
   * @date 2022-11-07 16:28:42
   * @version V..
   * @description other methods
   */

  /**
   * @author QL
   * @date 2022-11-07 16:29:11
   * @version V..
   * @description VDOM
   */
  return (
    <div
      className={`integratedCard-${type}`}
      onClick={() => (clickAction ? onClick(titleConfig.key) : () => {})}
    >
      <div className="integratedCard-bullet"></div>
      <div className="integratedCard-title">
        <div className="integratedCard-title-left">
          <div className="integratedCard-title-left-main">
            <div className="titleText">
              <Tooltip title={titleConfig.mainTitle}>{titleConfig.mainTitle}</Tooltip>
            </div>
            {titleConfig.mainTitle_tags
              ? titleConfig.mainTitle_tags.map((tag: tagObject, index: number) => {
                  return (
                    <Tag
                      key={index}
                      color={tag.color}
                      icon={tag.optIcon}
                      style={{ color: `${tag.textColor}` }}
                      className="titleText-tag"
                    >
                      {tag.name}
                    </Tag>
                  );
                })
              : null}
          </div>
          {titleConfig.subTitle ? (
            <div className="integratedCard-title-left-sub">
              {titleConfig.subTitle.map((sub: any, index: any) => {
                return (
                  <div className="titleText" key={sub.name + index}>
                    <Tooltip title={sub.name}>{sub.name}</Tooltip>
                    <div className="slotIcon">{sub.optIcon}</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {titleConfig.middleSlot ? (
          <>
            <div className="integratedCard-title-middle">{titleConfig.middleSlot}</div>
            <Divider dashed={true} type={'vertical'} className="integratedCard-title-divider" />
          </>
        ) : null}

        <div className={`integratedCard-title-right ${type}_${titleConfig.key}`}>
          {titleConfig.rightSlot}
        </div>
      </div>

      {content ? <div className="integratedCard-content">{content}</div> : null}
    </div>
  );
};

export default IntegratedCard;
