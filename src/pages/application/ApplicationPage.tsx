import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { Button, Dropdown, Empty, Modal, Spin, Tooltip } from '@/ui/fast';
import type { ItemType } from '@/ui/fast';
import type { ModalFunc } from '@/ui/fast';
import { Trans, useTranslation } from 'react-i18next';
import { AppIcon } from './component/AppIcon';
import { useLoading } from '@/hooks/useLoading';
import { useProgressiveItems } from '@/hooks/useProgressiveItems';
import { VappApi } from '@/services/api/vapp';
import Actions from '@/utils/actions';
import { hasPermission } from '@/utils/permission';
import type {
  DeleteVappReq,
  ListVappItem,
  RemoveVappReq,
  VappCategory,
} from '@/services/api/vapp/types';
import type { ConnectVappReq } from '@/services/invoke/vapp/types';
import type { DefaultOptionType } from '@/ui/fast';
import './ApplicationPage.scss';

const AppDetailModal = lazy(() =>
  import('./component/AppDetailModal').then((module) => ({ default: module.AppDetailModal })),
);

export interface ApplicationPageProps {
  category: VappCategory | 'all';
  categories: DefaultOptionType[];
  dataSource: ListVappItem[];
  loading: boolean;
  onCategoryChange: (value: VappCategory | 'all') => Promise<void>;
  onRefresh: () => Promise<void>;
  onFavoriteApp: () => void;
  onCustomPublish: () => void;
  onRemoveApp: (params: RemoveVappReq) => Promise<void>;
  onDeleteApp: (params: DeleteVappReq) => Promise<void>;
  onVappItemClick: (params: ConnectVappReq) => Promise<void>;
}

const getResourceName = (app: ListVappItem) =>
  app.desktop?.name || app.desktop?.desktopPool?.name || '-';

const getPublishTypeKey = (app: ListVappItem) =>
  app.vapp.publishType === 'System'
    ? 'application_page.favorite_app'
    : 'application_page.custom_publish';

export const ApplicationPage: FC<ApplicationPageProps> = (props) => {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const deleteConfirmRef = useRef<ReturnType<ModalFunc>>(null);
  const [detailApp, setDetailApp] = useState<ListVappItem | null>(null);
  const [launchingIds, setLaunchingIds] = useState<Set<number>>(() => new Set());
  const launchingIdsRef = useRef<Set<number>>(new Set());
  const operateAppLoading = useLoading([VappApi.DELETE_VAPP, VappApi.REMOVE_VAPP]);
  const visibleApps = useProgressiveItems(props.dataSource, {
    initialCount: 24,
    chunkSize: 24,
  });

  const selectedCategory = useMemo(
    () => props.categories.find((item) => item.value === props.category),
    [props.categories, props.category],
  );

  const getCategoryLabel = (app: ListVappItem) =>
    props.categories.find((item) => item.value === app.vapp.category)?.label || app.vapp.category;

  const launchApp = async (app: ListVappItem) => {
    if (launchingIds.has(app.id) || launchingIdsRef.current.has(app.id)) {
      return;
    }

    launchingIdsRef.current = new Set(launchingIdsRef.current).add(app.id);
    setLaunchingIds((prev) => {
      const next = new Set(prev);
      next.add(app.id);
      launchingIdsRef.current = next;
      return next;
    });
    await props
      .onVappItemClick({
        vappId: app.vapp.id,
        mId: app.id,
      })
      .finally(() =>
        setLaunchingIds((prev) => {
          const next = new Set(prev);
          next.delete(app.id);
          launchingIdsRef.current = next;
          return next;
        }),
      );
  };

  useEffect(() => {
    if (deleteConfirmRef.current) {
      deleteConfirmRef.current.update({
        okButtonProps: {
          loading: operateAppLoading,
        },
      });
    }
  }, [operateAppLoading]);

  const confirmRemoveOrDelete = (app: ListVappItem) => {
    const isSystem = app.vapp.publishType === 'System';
    deleteConfirmRef.current = modal.confirm({
      centered: true,
      className: 'confirm-modal',
      title: isSystem
        ? t('application_page.cancel_favorite_app')
        : t('application_page.delete_app'),
      content: (
        <span>
          {isSystem
            ? t('application_page.confirm_cancel_favorite_app')
            : t('application_page.confirm_delete_app')}
          <span className="confirm-tag">{app.vapp.name}</span> ?
        </span>
      ),
      okText: isSystem ? t('application_page.cancel_favorite') : t('application_page.delete'),
      okButtonProps: {
        loading: operateAppLoading,
      },
      cancelText: t('application_page.close'),
      onOk: async () => {
        const params = {
          mIds: [String(app.id)],
          desktopIds: app.desktop?.id ? [app.desktop.id] : [],
        };
        if (isSystem) {
          await props.onRemoveApp(params);
          return;
        }
        await props.onDeleteApp(params);
      },
    });
  };

  const getMenuItems = (app: ListVappItem): ItemType[] => [
    {
      label: t('application_page.details'),
      key: 'details',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setDetailApp(app);
      },
    },
    {
      label:
        app.vapp.publishType === 'System'
          ? t('application_page.remove')
          : t('application_page.delete'),
      key: 'remove-or-delete',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        confirmRemoveOrDelete(app);
      },
      danger: app.vapp.publishType !== 'System',
    },
  ];

  return (
    <main className="application-page">
      <header className="application-page__toolbar">
        <div className="application-page__heading">
          <span>{t('application_page.workbench_eyebrow')}</span>
          <h1>{t('application_page.workbench_title')}</h1>
          <p>
            {t('application_page.workbench_summary', {
              count: props.dataSource.length,
              category: selectedCategory?.label || t('application_page.category_all'),
            })}
          </p>
        </div>
        <div className="application-page__actions">
          <Tooltip title={<Trans t={t} i18nKey="application_page.virtual_app_minimize_tip" />}>
            <Button
              icon={<i className="iconfont icon-c_question-s" />}
              aria-label={t('application_page.usage_tip')}
            />
          </Tooltip>
          <Button
            loading={props.loading}
            icon={<i className="iconfont icon-refresh" />}
            onClick={props.onRefresh}
          >
            {t('application_page.refresh')}
          </Button>
          {hasPermission(
            [Actions.TerminalRWAppAddPrepare],
            <Button onClick={props.onFavoriteApp}>{t('application_page.favorite_app')}</Button>,
          )}
          {hasPermission(
            [Actions.TerminalRWAppAddCustom],
            <Button type="primary" onClick={props.onCustomPublish}>
              {t('application_page.custom_publish')}
            </Button>,
          )}
        </div>
      </header>

      <nav className="application-page__filters" aria-label={t('application_page.category')}>
        {props.categories.map((item) => (
          <button
            key={String(item.value)}
            className={item.value === props.category ? 'is-active' : ''}
            type="button"
            onClick={() => props.onCategoryChange(item.value as VappCategory | 'all')}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <Spin spinning={props.loading}>
        {props.dataSource.length === 0 ? (
          <section className="application-page__empty">
            <Empty description={t('application_page.empty_title')} />
            <p>{t('application_page.empty_description')}</p>
          </section>
        ) : (
          <section className="application-page__grid">
            {visibleApps.map((app) => {
              const isLaunching = launchingIds.has(app.id);

              return (
                <article className="application-card" key={app.id}>
                  <button
                    className="application-card__main"
                    type="button"
                    disabled={isLaunching}
                    onClick={() => launchApp(app)}
                  >
                    <AppIcon appIconUrl={app.vapp.appIconUrl} appId={app.id} />
                    <span className="application-card__name" title={app.vapp.name}>
                      {app.vapp.name}
                    </span>
                    <span className="application-card__resource" title={getResourceName(app)}>
                      {getResourceName(app)}
                    </span>
                  </button>
                  <div className="application-card__meta">
                    <span>{getCategoryLabel(app)}</span>
                    <span>
                      {t(
                        app.vapp.mode === 'Exclusive'
                          ? 'application_page.mode_exclusive'
                          : 'application_page.mode_shared',
                      )}
                    </span>
                    <span>{t(getPublishTypeKey(app))}</span>
                  </div>
                  <div className="application-card__footer">
                    <Button
                      type="primary"
                      loading={isLaunching}
                      disabled={isLaunching}
                      onClick={() => launchApp(app)}
                    >
                      {t('application_page.launch')}
                    </Button>
                    <Dropdown menu={{ items: getMenuItems(app) }} trigger={['click']}>
                      <Button
                        aria-label={t('application_page.more_actions')}
                        icon={<i className="iconfont icon-more" />}
                      />
                    </Dropdown>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </Spin>

      {detailApp && (
        <Suspense fallback={null}>
          <AppDetailModal
            visible={!!detailApp}
            app={detailApp}
            setVisible={() => setDetailApp(null)}
          />
        </Suspense>
      )}
      {contextHolder}
    </main>
  );
};
