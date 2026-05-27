import { memo } from 'react';
import { Button, Dropdown, Tooltip } from '@/shared/ui';
import { transIcon } from '@/utils/utils';
import Deskpool from './desk-pool-icon';
import InUseLoading from './in-use-loading';

const getPopupContainer = (triggerNode: HTMLElement) => triggerNode.ownerDocument.body;

interface DesktopCardProps {
  item: any;
  index: number;
  connectLabel: string;
  moreLabel: string;
  metaLine: string;
  menu: any;
  statusInfo: { title: string; type: string };
  onEnterDesk: (item: any) => void;
}

export const DesktopCard = memo(function DesktopCard({
  item,
  index,
  connectLabel,
  moreLabel,
  metaLine,
  menu,
  statusInfo,
  onEnterDesk,
}: DesktopCardProps) {
  const isStopped = ['stop', 'stopretain'].includes(item?.status?.toLowerCase());

  return (
    <article
      className={`desk-card desk-card--${item?.desktopPool?.type} desk-card-item-${index} ${
        isStopped ? 'desk-card--disabled' : ''
      } ${item.isDefault ? 'desk-card--default' : ''}`}
    >
      {item.isDefault && <span className="desk-card__default-mark">{menu.defaultLabel}</span>}

      <Dropdown
        menu={menu.dropdown}
        placement="bottomRight"
        trigger={['click']}
        classNames={{ root: 'desk-more-menu desk-page__more-menu' }}
        getPopupContainer={getPopupContainer}
      >
        <Button
          className="desk-card__menu"
          type="text"
          icon={<i className="iconfont icon-more" />}
          aria-label={moreLabel}
          title={moreLabel}
          onClick={(event) => event.stopPropagation()}
        />
      </Dropdown>

      <button className="desk-card__preview" type="button" onClick={() => onEnterDesk(item)}>
        <div className="desk-card__icon">{transIcon(item.image?.os || item.os)}</div>

        <div className="desk-card__identity">
          <Tooltip title={item.name}>
            <h3 className="desk-card__name">
              <span>{item.name}</span>
            </h3>
          </Tooltip>
          <p className="desk-card__meta-line">{metaLine}</p>
        </div>

        <div className={`desk-card__status desk-card__status--${statusInfo.type}`}>
          <span className="desk-card__status-dot" />
          <span>{statusInfo.title}</span>
          {item?.sessionStatus == '1' && <InUseLoading />}
        </div>
      </button>

      <Button
        className="desk-card__connect"
        type="primary"
        aria-label={connectLabel}
        title={connectLabel}
        onClick={() => onEnterDesk(item)}
      >
        <span>{connectLabel}</span>
        <i className="iconfont icon-arrow" />
      </Button>
    </article>
  );
});

interface DeskPoolCardProps {
  item: any;
  detailLabel: string;
  metaLine: string;
  poolLabel: string;
  createLabel: string;
  onCreate: (item: any) => void;
  onShowDetail: (id: string) => void;
}

export const DeskPoolCard = memo(function DeskPoolCard({
  item,
  detailLabel,
  metaLine,
  poolLabel,
  createLabel,
  onCreate,
  onShowDetail,
}: DeskPoolCardProps) {
  return (
    <article className="desk-pool">
      <Button
        className="desk-card__menu"
        type="text"
        icon={<i className="iconfont icon-info-o" />}
        aria-label={`${detailLabel}: ${item.name}`}
        title={detailLabel}
        onClick={() => onShowDetail(item.id)}
      />

      <button
        type="button"
        className="desk-pool__preview"
        aria-label={`${detailLabel}: ${item.name}`}
        onClick={() => onShowDetail(item.id)}
      >
        <div className="desk-card__icon desk-card__icon--pool">
          <Deskpool />
          {transIcon(item?.os)}
        </div>

        <div className="desk-card__identity">
          <Tooltip title={item.name}>
            <h3 className="desk-pool__name">
              <span>{item.name}</span>
            </h3>
          </Tooltip>
          <p className="desk-card__meta-line">{metaLine}</p>
        </div>

        <div className="desk-card__status desk-card__status--success">
          <span className="desk-card__status-dot" />
          <span>{poolLabel}</span>
        </div>
      </button>

      <Button
        onClick={(event) => {
          event.stopPropagation();
          onCreate(item);
        }}
        className="desk-card__connect desk-pool__create"
      >
        <span>{createLabel}</span>
        <i className="iconfont icon-arrow" />
      </Button>
    </article>
  );
});
