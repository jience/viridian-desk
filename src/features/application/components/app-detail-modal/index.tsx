import { Modal, Tooltip } from '@/shared/ui';
import { EmptyText } from '@/utils/constant';
import { AppIcon } from '../app-icon';

import './index.scss';
import { useInitData } from '../../model/init-data';
import { useTranslation } from 'react-i18next';
import type { ListVappItem, VappItem } from '@/services/api/vapp/types';

export interface AppDetailModalProps {
  app: ListVappItem;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const AppDetailModal = (props: AppDetailModalProps) => {
  const { app, visible, setVisible } = props;
  const { t } = useTranslation();

  const desktop = app?.desktop || null;
  const desktopPool = app?.desktop?.desktopPool || null;
  const vapp: VappItem = app?.vapp;

  const { appCategoryList, appModeList } = useInitData();

  const config = [
    {
      icon: desktop ? 'icon-desktop' : 'icon-virtual-res', // 所属桌面
      title: desktop
        ? t('application_page.include_desktop')
        : t('application_page.include_desktop_pool'),
      render: () => {
        return <span>{desktop?.name || desktopPool?.name || EmptyText}</span>;
      },
    },
    {
      icon: 'icon-tag', // 分类
      title: t('application_page.category'),
      render: () => {
        return (
          <span>
            {vapp?.category
              ? appCategoryList.find((i: any) => i.value === vapp?.category)?.label
              : EmptyText}
          </span>
        );
      },
    },
    {
      icon: 'icon-list', // 来源
      title: t('application_page.source'),
      render: () => {
        return (
          <span>
            {vapp?.publishType === 'System'
              ? t('application_page.favorite_app')
              : t('application_page.custom_publish')}
          </span>
        );
      },
    },
    {
      icon: 'icon-accesspath', // 路径
      title: t('application_page.path'),
      render: () => {
        return <span>{vapp?.target || EmptyText}</span>;
      },
    },
    {
      icon: 'icon-info-s', // 描述
      title: t('application_page.description'),
      render: () => {
        return <span>{vapp?.description || EmptyText}</span>;
      },
    },
    {
      icon: 'icon-stencil', // 模式
      title: t('application_page.mode'),
      render: () => {
        return <span>{appModeList.find((val) => val.value === vapp?.mode)?.label}</span>;
      },
    },
  ];
  return (
    <Modal
      title={
        <>
          <AppIcon appIconUrl={vapp?.appIconUrl} />
          <span title={vapp?.name} className="title">
            {vapp?.name}
          </span>
        </>
      }
      open={visible}
      keyboard={false}
      centered={true}
      onCancel={() => setVisible(false)}
      className="app-detail"
      footer={null}
    >
      <ul className="detail-list">
        {config.map((val) => {
          return (
            <li className="detail-item" key={val.title}>
              <Tooltip title={val.title} placement={'top'}>
                <i className={`iconfont ${val.icon}`}></i>
              </Tooltip>
              {val.render()}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};
