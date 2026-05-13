import { useEffect } from 'react';
import TableBtn from '@/components/TableBtn';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router';
import './index.scss';
import { Col, Row, Button, Dropdown, Tag, Spin, Empty, Tooltip } from 'antd';
import Open from '@/components/Opensvg';
import Close from '@/components/Closesvg';
import { transIcon } from '@/utils/utils';
import useDeskDetail from './useDeskDetail';
import useSnap from './useSnap';
import { transStatus } from '../desk/useDeskHooks';
import ActionAuth, { authActionShow } from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { DESK_STATUS } from '@/utils/constant';
import CreateModal from './createSnap';
import AllDiskListModal from './allDiskListModal';
import snapPng from '@/assets/images/snap.png';
const ActionDropdown = ActionAuth(Dropdown);
const sanSpecialStatus = ['ERRORROLLBACKING', 'ERRORDELETING', 'ERRORCREATING'];
const MAXSNAP = 10; //快照最大数量
export function Component(_props: any) {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const { id } = location.state;
  const navigate = useNavigate();

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

  const createDisabled =
    ![DESK_STATUS.START, DESK_STATUS.STOP].includes(desk?.status) ||
    snapList.some((snap: any) =>
      ['CREATING', 'ROLLBACK', 'DELETING', ...sanSpecialStatus].includes(snap.status),
    ) ||
    desk?.isRestore ||
    desk?.desktopPool.type === 'RESTORE' ||
    // 加密系统盘的桌面不支持创快照
    desk?.disks?.find((i: any) => i?.isSystem)?.encrypt;

  const AuthAddBtn = ActionAuth((_props: any) => {
    const isOstackP = desk?.iaas?.type === 'OSTACKP' && MAXSNAP <= snapList.length;
    return (
      <li>
        <div className="dot"></div>
        <Button
          type="dashed"
          block
          icon={<i className="iconfont icon-add" />}
          disabled={isOstackP || createDisabled || desk?.isLock}
          className="add-btn"
          onClick={() => {
            setVisible(true);
          }}
        />
      </li>
    );
  });

  useEffect(() => {
    getDeskList();
    getDeskSnapshotList();
    return () => {
      setVisible(false);
    };
  }, []);

  const renderDisks = (dataDisks: any) => {
    const systemDisk: any = [];
    const personalDisk: any = [];
    const otherDisks: any = [];

    dataDisks.map((disk: any, _index: any) => {
      const delAttribute = disk.isSystem ? 'system' : 'common';
      switch (delAttribute) {
        case 'system':
          systemDisk.push({
            label: `${disk?.name}`,
            value: disk.id,
            hide: false,
            checked: false,
          });
          break;
        // case 'personal':
        //   personalDisk.push({
        //     label: `${disk.name}`,
        //     value: disk.id,
        //     hide: true,
        //     checked: false,
        //   });
        //   break;
        case 'common':
          otherDisks.push({
            label: `${disk.name}`,
            value: disk.id,
            hide: false,
            checked: true,
          });
          break;
      }
    });
    return (
      <div className="disk_tag_box">
        {[...systemDisk, ...personalDisk, ...otherDisks].map((disk: any) => {
          return <div className="disk_tag_item">{disk.label}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="deskDetail">
      <TableBtn
        icon="icon-left"
        onClick={() => {
          navigate('/app/desk');
        }}
      ></TableBtn>
      <TableBtn
        icon="icon-refresh"
        loading={deskLoading || snapLoading}
        onClick={() => {
          getDeskSnapshotList();
          getDeskList();
        }}
      ></TableBtn>
      <Spin spinning={deskLoading || snapLoading}>
        <Row gutter={[12, 0]} className="deskDetail-content">
          <Col span={8}>
            <div className="desk-detail-content">
              <div className="detail-title">
                <div className="os">
                  {desk?.status?.toLowerCase() === 'stop' ? (
                    <div className="stop-bg">
                      <Close></Close>
                    </div>
                  ) : (
                    <Open></Open>
                  )}
                  {transIcon(desk?.image?.os || desk?.os)}
                  {transStatus(desk?.status, desk?.isLock)}
                </div>
                <div className="name-content">
                  <p className="name">{desk?.name}</p>
                  <div className="deskType">
                    {transType(desk?.desktopPool || {})}
                    <span>
                      {formatMessage({
                        id: desk?.desktopPool?.type || 'EXCLUSIVE',
                      })}
                      {formatMessage({ id: 'DESK' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="detailList">
                <ul>
                  {config?.map((val) => {
                    return (
                      <li key={val.key}>
                        <Tooltip
                          title={val.title}
                          getPopupContainer={(): HTMLElement =>
                            document.querySelector(`#desk-detailList-${val.icon}`) as HTMLElement
                          }
                          placement={'topLeft'}
                          className="toolBox"
                        >
                          <div className="content" id={`desk-detailList-${val.icon}`}>
                            <i className={`iconfont ${val.icon}`}></i>
                            {val.render()}
                          </div>
                          {val.showMore && (
                            <Button
                              icon={<i className="iconfont icon-more" />}
                              type={'text'}
                              title={formatMessage({ id: 'More' })}
                              onClick={val.showMoreAction}
                            />
                          )}
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Col>
          <Col span={16}>
            <div className="SnapBox">
              {authActionShow([Actions.TerminalROSnapshotRead]) ? (
                <>
                  <p className="title">{formatMessage({ id: 'SNAPSHOTLIST' })}</p>
                  <ul className="snap">
                    <AuthAddBtn actions={[Actions.TerminalRWSnapshotCreateOrDelete]}></AuthAddBtn>
                    {snapList.map((val: any) => {
                      return (
                        <li>
                          <div className="status">{handleDiskStatus(val.status)}</div>

                          <div className="card">
                            <div className="info">
                              <img src={snapPng} alt="" />
                              <div className="text">
                                <p className="name">
                                  {val.name}
                                  {val?.systemFlag && (
                                    <Tag
                                      style={{
                                        color: `#4C8CCA`,
                                        margin: '2px 5px',
                                        padding: '2px 6px',
                                      }}
                                    >
                                      {formatMessage({
                                        id: 'CurrentUsedThing',
                                      })}
                                    </Tag>
                                  )}
                                  <Tooltip
                                    title={renderDisks(val.disk)}
                                    trigger={'hover'}
                                    color="#FFFFFF"
                                    placement="right"
                                    overlayInnerStyle={{ maxWidth: 'unset' }}
                                    showArrow={false}
                                  >
                                    <Tag
                                      id={`desk-disks-${val.id}`}
                                      style={{
                                        background: `#e6f1fd`,
                                        color: `#4c8cca`,
                                        margin: '2px 5px',
                                        padding: '2px 6px',
                                      }}
                                    >{`${formatMessage({
                                      id: 'DESK_VLOUME',
                                    })}：${val.disk.length}`}</Tag>
                                  </Tooltip>
                                </p>
                                <p className="time">{val.createTime}</p>
                              </div>
                            </div>
                            <ActionDropdown
                              menu={menu(val)}
                              actions={[
                                Actions.TerminalRWSnapshotRollback,
                                Actions.TerminalRWSnapshotCreateOrDelete,
                              ]}
                              trigger={['click']}
                              placement="bottomLeft"
                            >
                              <Button
                                // type="operate"
                                // size={'small-s'}
                                className="snap-opt-btn"
                                icon={<i className="iconfont icon-more" />}
                                onClick={(e: any) => e.stopPropagation()}
                              />
                            </ActionDropdown>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <Empty description={'无权限查看'} />
              )}
            </div>
          </Col>
        </Row>
      </Spin>
      <CreateModal
        visible={visible}
        setVisible={setVisible}
        desktopId={desk?.id}
        desktopDiskList={desktopDiskList}
        refreshList={() => {
          getDeskSnapshotList();
          getDeskList();
        }}
      ></CreateModal>
      <AllDiskListModal
        title={formatMessage({ id: 'AllDisks' })}
        visiable={showAllDiskList}
        setVisiable={setShowAllDiskList}
        desktopId={id}
      ></AllDiskListModal>
    </div>
  );
}
