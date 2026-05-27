import { Modal, Tooltip } from '@/shared/ui';
import Deskpool from '@/features/desktop/components/desk-pool-icon';
import { EmptyText } from '@/utils/constant';
import { transRam } from '@/utils/utils';
import './index.scss';
import { getPathValue, isEmptyValue } from '@/utils/value';

const DeskPoolDetail = (props: any) => {
  const { item, transIcon, setCheckDeskPoolItem, formatMessage, visible, setVisible } = props;

  const getDiskNum = (data: any = [], isSystem: boolean) => {
    const disks = data
      .filter((val: any) => (isSystem ? val.isSystem : !val.isSystem) && val.size != undefined)
      .map((val: any, index: number) => {
        return (
          <span className="deskPoolInDesk-disk" key={`${isSystem ? 'system' : 'data'}-${index}`}>
            {val.size} GB
          </span>
        );
      });
    return disks.length ? disks : false;
  };
  const { num, unit } = transRam(item?.flavor?.memory);
  function transCpu(cpu: any) {
    const core = Number.parseInt(cpu);
    if (isNaN(core)) {
      return cpu || EmptyText;
    }
    return `${core} ${formatMessage({ id: 'DESK_CPU_UNIT' })}`;
  }

  const deskPoolTitle = (item: any) => {
    return (
      <div className="deskPoolInDesk-title">
        <div className="os">
          <div className="stop-bg">
            <Deskpool />
          </div>
          {transIcon(item?.os)}
        </div>
        <div className="title-box">
          <p className="pool-name">{item?.name}</p>
          <span className="show-type">
            {formatMessage({ id: item?.type || '' })}
            {formatMessage({ id: 'DESK_POOL' })}
          </span>
        </div>
      </div>
    );
  };
  const transGpu = (item: any) => {
    if (!isEmptyValue(item?.gpus) || !isEmptyValue(item?.vgpu)) {
      return (
        ' | GPU：' +
        (getPathValue<number>(item, 'gpus.length', 0) + (isEmptyValue(item?.vgpu) ? 0 : 1)) +
        ' 颗'
      );
    }
  };
  const config = [
    {
      key: 'STORE',
      icon: 'icon-project',
      title: formatMessage({ id: 'DESK_STANDARD' }),
      render: () => {
        return (
          <p>
            {'CPU'}：{transCpu(item?.flavor?.cpu)} | {formatMessage({ id: 'STORE' })}：{num}
            {unit}
            {transGpu(item)}
          </p>
        );
      },
    },
    {
      key: 'DESK_IMAGE',
      icon: 'icon-mirror',
      title: formatMessage({ id: 'DESK_IMAGE' }),
      render: () => {
        return <p>{item?.image?.name || EmptyText}</p>;
      },
    },
    {
      key: 'DESK_NETWORK',
      icon: 'icon-net',
      title: formatMessage({ id: 'DESK_NETWORK' }),
      render: () => {
        return <p>{item?.network?.subnets?.[0]?.cidr || EmptyText}</p>;
      },
    },
    {
      key: 'SystemDisk',
      icon: 'icon-Systemdisk',
      title: formatMessage({ id: 'SystemDisk' }),
      render: () => {
        return <p> {getDiskNum(item?.disks, true) || EmptyText}</p>;
      },
    },
    {
      key: 'DataDisk',
      icon: 'icon-Datadisk',
      title: formatMessage({ id: 'DataDisk' }),
      render: () => {
        return <p>{getDiskNum(item?.disks, false) || EmptyText}</p>;
      },
    },
  ];
  return (
    <Modal
      title={deskPoolTitle(item)}
      open={visible}
      centered={true}
      keyboard={false}
      onCancel={() => {
        setCheckDeskPoolItem(null);
        setVisible(false);
      }}
      className="deskPoolInDesk"
      footer={null}
    >
      <ul className="detailList">
        {config.map((val) => {
          return (
            <li key={val.key}>
              <Tooltip
                title={val.title}
                getPopupContainer={(): HTMLElement =>
                  document.querySelector(`#deskpool-detailList-${val.icon}`) as HTMLElement
                }
                placement={'topLeft'}
              >
                <div className="content" id={`deskpool-detailList-${val.icon}`}>
                  <span className="detail-icon">
                    <i className={`iconfont ${val.icon}`}></i>
                  </span>
                  <div className="detail-main">
                    <span className="detail-label">{val.title}</span>
                    <div className="detail-value">{val.render()}</div>
                  </div>
                </div>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};

export default DeskPoolDetail;
