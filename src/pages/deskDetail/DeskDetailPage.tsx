import { useEffect } from 'react';
import { Button, Dropdown, Empty, Spin, Tag, Tooltip } from '@/ui';
import { useMessageFormatter } from '@/utils/message-format';
import { useLocation, useNavigate } from 'react-router';
import Close from '@/components/Closesvg';
import Open from '@/components/Opensvg';
import ActionAuth, { authActionShow } from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { DESK_STATUS, EmptyText } from '@/utils/constant';
import { transIcon } from '@/utils/utils';
import snapPng from '@/assets/images/snap.png';
import { transStatus } from '../desk/useDeskHooks';
import AllDiskListModal from './allDiskListModal';
import CreateModal from './createSnap';
import useDeskDetail from './useDeskDetail';
import useSnap from './useSnap';
import './DeskDetailPage.scss';

const ActionDropdown = ActionAuth(Dropdown);
const AuthCreateButton = ActionAuth(Button);
const sanSpecialStatus = ['ERRORROLLBACKING', 'ERRORDELETING', 'ERRORCREATING'];
const MAXSNAP = 10;

const snapshotBusyStatuses = ['CREATING', 'ROLLBACK', 'DELETING', ...sanSpecialStatus];

export function DeskDetailPage() {
  const { formatMessage } = useMessageFormatter();
  const location = useLocation();
  const navigate = useNavigate();
  const id = (location.state as { id?: string } | null)?.id;

  const {
    desk,
    deskLoading,
    config,
    desktopDiskList,
    transType,
    getDeskList,
    showAllDiskList,
    setShowAllDiskList,
  } = useDeskDetail({
    id,
    formatMessage,
    navigate,
  });

  const {
    snapLoading,
    snapList,
    menu,
    handleDiskStatus,
    visible,
    setVisible,
    getDeskSnapshotList,
  } = useSnap({
    id,
    formatMessage,
    desk,
    sanSpecialStatus,
  });

  const snapshots = (snapList || []) as any[];
  const isOstackSnapshotLimit = desk?.iaas?.type === 'OSTACKP' && MAXSNAP <= snapshots.length;
  const createDisabled =
    !id ||
    ![DESK_STATUS.START, DESK_STATUS.STOP].includes(desk?.status) ||
    snapshots.some((snap) => snapshotBusyStatuses.includes(snap.status)) ||
    desk?.isRestore ||
    desk?.desktopPool?.type === 'RESTORE' ||
    desk?.disks?.find((disk: any) => disk?.isSystem)?.encrypt ||
    desk?.isLock ||
    isOstackSnapshotLimit;
  const isRefreshing = deskLoading || snapLoading;

  useEffect(() => {
    if (!id) {
      navigate('/app/desk');
      return;
    }

    getDeskList();
    getDeskSnapshotList();
    return () => {
      setVisible(false);
    };
  }, []);

  const renderDisks = (dataDisks: any[] = []) => (
    <div className="desk-detail-disk-list">
      {dataDisks.map((disk) => (
        <div className="desk-detail-disk-list__item" key={disk.id || disk.name}>
          {disk.name}
        </div>
      ))}
    </div>
  );

  const handleRefresh = () => {
    getDeskSnapshotList();
    getDeskList();
  };

  return (
    <main className="desk-detail-page">
      <header className="desk-detail-page__toolbar">
        <Button
          className="desk-detail-page__icon-button"
          icon={<i className="iconfont icon-left" />}
          aria-label={formatMessage({ id: 'BACK', defaultMessage: 'Back' })}
          onClick={() => navigate('/app/desk')}
        />
        <div className="desk-detail-page__heading">
          <span>{formatMessage({ id: 'DESK' })}</span>
          <h2>{desk?.name || EmptyText}</h2>
        </div>
        <Button
          className="desk-detail-page__icon-button"
          icon={<i className="iconfont icon-refresh" />}
          loading={isRefreshing}
          aria-label={formatMessage({ id: 'REFRESH', defaultMessage: 'Refresh' })}
          onClick={handleRefresh}
        />
      </header>

      <Spin spinning={isRefreshing}>
        <section className="desk-detail-page__content">
          <aside className="desk-detail-page__profile" aria-label={desk?.name}>
            <div className="desk-detail-page__hero">
              <div className="desk-detail-page__os">
                {desk?.status?.toLowerCase() === 'stop' ? (
                  <span className="desk-detail-page__stop-shell">
                    <Close />
                  </span>
                ) : (
                  <Open />
                )}
                {transIcon(desk?.image?.os || desk?.os)}
                {transStatus(desk?.status, desk?.isLock)}
              </div>
              <div className="desk-detail-page__identity">
                <h3 title={desk?.name}>{desk?.name || EmptyText}</h3>
                <p>
                  {transType(desk?.desktopPool || {})}
                  <span>
                    {formatMessage({ id: desk?.desktopPool?.type || 'EXCLUSIVE' })}
                    {formatMessage({ id: 'DESK' })}
                  </span>
                </p>
              </div>
            </div>

            <div className="desk-detail-page__facts">
              {config?.map((item) => (
                <article className="desk-detail-fact" key={item.key}>
                  <div className="desk-detail-fact__icon">
                    <i className={`iconfont ${item.icon}`} />
                  </div>
                  <div className="desk-detail-fact__body">
                    <span>{item.title}</span>
                    <Tooltip title={item.title} placement="topLeft">
                      <div className="desk-detail-fact__value">{item.render()}</div>
                    </Tooltip>
                  </div>
                  {item.showMore && (
                    <Button
                      className="desk-detail-fact__more"
                      icon={<i className="iconfont icon-more" />}
                      type="text"
                      title={formatMessage({ id: 'More' })}
                      onClick={item.showMoreAction}
                    />
                  )}
                </article>
              ))}
            </div>
          </aside>

          <section className="desk-detail-page__snapshots">
            {authActionShow([Actions.TerminalROSnapshotRead]) ? (
              <>
                <div className="desk-detail-page__section-header">
                  <div>
                    <span>{formatMessage({ id: 'SNAPSHOTLIST' })}</span>
                    <strong>{snapshots.length}</strong>
                  </div>
                  <AuthCreateButton
                    actions={[Actions.TerminalRWSnapshotCreateOrDelete]}
                    disabled={createDisabled}
                    icon={<i className="iconfont icon-add" />}
                    type="primary"
                    onClick={() => setVisible(true)}
                  >
                    {formatMessage({ id: 'CREATE_SNAP' })}
                  </AuthCreateButton>
                </div>

                {snapshots.length ? (
                  <div className="desk-detail-timeline">
                    {snapshots.map((snapshot) => (
                      <article className="desk-detail-snapshot" key={snapshot.id}>
                        <div className="desk-detail-snapshot__status">
                          {handleDiskStatus(snapshot.status)}
                        </div>
                        <div className="desk-detail-snapshot__card">
                          <img src={snapPng} alt={formatMessage({ id: 'SNAPSHOTLIST' })} />
                          <div className="desk-detail-snapshot__body">
                            <div className="desk-detail-snapshot__name">
                              <span title={snapshot.name}>{snapshot.name}</span>
                              {snapshot?.systemFlag && (
                                <Tag className="desk-detail-snapshot__tag">
                                  {formatMessage({ id: 'CurrentUsedThing' })}
                                </Tag>
                              )}
                              <Tooltip
                                title={renderDisks(snapshot.disk)}
                                trigger="hover"
                                color="var(--vd-color-panel, #1c211f)"
                                placement="right"
                                overlayInnerStyle={{ maxWidth: 'unset' }}
                                showArrow={false}
                              >
                                <Tag className="desk-detail-snapshot__tag">
                                  {`${formatMessage({ id: 'DESK_VLOUME' })}：${
                                    snapshot.disk?.length || 0
                                  }`}
                                </Tag>
                              </Tooltip>
                            </div>
                            <time>{snapshot.createTime || EmptyText}</time>
                          </div>
                          <ActionDropdown
                            actions={[
                              Actions.TerminalRWSnapshotRollback,
                              Actions.TerminalRWSnapshotCreateOrDelete,
                            ]}
                            menu={menu(snapshot)}
                            trigger={['click']}
                            placement="bottomLeft"
                          >
                            <Button
                              className="desk-detail-snapshot__menu"
                              icon={<i className="iconfont icon-more" />}
                              onClick={(event) => event.stopPropagation()}
                            />
                          </ActionDropdown>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="desk-detail-page__empty">
                    <Empty description={formatMessage({ id: 'SNAPSHOTLIST' })} />
                  </div>
                )}
              </>
            ) : (
              <div className="desk-detail-page__empty">
                <Empty description="无权限查看" />
              </div>
            )}
          </section>
        </section>
      </Spin>

      <CreateModal
        visible={visible}
        setVisible={setVisible}
        desktopId={desk?.id}
        desktopDiskList={desktopDiskList}
        refreshList={handleRefresh}
      />
      <AllDiskListModal
        title={formatMessage({ id: 'AllDisks' })}
        visiable={showAllDiskList}
        setVisiable={setShowAllDiskList}
        desktopId={id}
      />
    </main>
  );
}
