import useRequest from '@/hooks/useRequest';
import { listResourceUser, listVolume } from '@/services/api/desktop';
import { EmptyText } from '@/utils/constant';
import { transRam } from '@/utils/utils';
import { getPathValue, isEmptyValue } from '@/utils/value';
import { useState } from 'react';

const useDeskDetail = ({ id, formatMessage, navigate }: any) => {
  const [desk, setDesk] = useState<any>();
  const [desktopDiskList, setDesktopDiskList] = useState([]);
  const [showAllDiskList, setShowAllDiskList] = useState(false);
  // 获取列表的接口参数
  const [diskListParams, setDiskListParams] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [totalDiskCount, setTotalDiskCount] = useState(0);
  // 列表数据
  const [diskList, setDiskList] = useState([]);

  const { run: listResourceUserRun, loading: deskLoading } = useRequest(listResourceUser, {
    manual: true,
    onSuccess: (res: any) => {
      const currentDeskInfo = res?.results.find((val: any) => val.id === id) || {};
      if (isEmptyValue(currentDeskInfo)) {
        navigate('/app/desk');
      }
      const disks: any = currentDeskInfo?.disks;
      if (disks) {
        setDesktopDiskList(disks.filter((val: any) => val.attribute != 'personal'));
        setTotalDiskCount(disks?.length);
      } else {
        setDesktopDiskList([]);
      }
      setDesk(currentDeskInfo);
    },
  });

  const { run: listVolumerRun, loading } = useRequest(listVolume, {
    manual: true,
    onSuccess: (res: any) => {
      setTotalDiskCount(res?.totalCount);
      setDiskList(res?.results || []);
    },
  });
  // 获取桌面数据
  const getDeskList = () => {
    const queryData = {
      pageSize: 9999,
      pageNumber: 1,
    };
    listResourceUserRun(queryData);
  };

  // 获取全量磁盘
  const refreshDiskList = () => {
    listVolumerRun({ ...diskListParams, desktopId: id });
  };

  const transGpu = (item: any) => {
    if (!isEmptyValue(item?.gpus) || !isEmptyValue(item?.vgpus)) {
      return (
        ' | GPU：' +
        (getPathValue<number>(item, 'gpus.length', 0) + (isEmptyValue(item?.vgpus) ? 0 : 1)) +
        ' 颗'
      );
    }
  };
  function transCpu(cpu: any) {
    const core = Number.parseInt(cpu);
    if (isNaN(core)) {
      return cpu || EmptyText;
    }
    return `${core} ${formatMessage({ id: 'DESK_CPU_UNIT' })}`;
  }
  const { num, unit } = transRam(desk?.flavor?.memory);

  function getDeskNetwork(interfaces: any) {
    if (!interfaces) return EmptyText;
    const ipList = interfaces.map((item: any) => {
      const ips: any = [];
      if (item.ip) {
        ips.push(
          <span className="desk-detail-fact__line" key={item.id}>
            {item.ip}
          </span>,
        );
      }
      if (item.ip2) {
        ips.push(
          <span className="desk-detail-fact__line" key={item.id + item.ip2}>
            {item.ip2}
          </span>,
        );
      }
      return ips;
    });
    const ipListFlat = ipList.flat();
    if (ipListFlat.length > 0) return ipListFlat;
    return EmptyText;
  }

  const diskConfigs = (showDiskType: any) => {
    const systemDisk: any = [];
    const personalDisk: any = [];
    const otherDisks: any = [];

    desk?.disks?.map((disk: any, _index: any) => {
      const delAttribute = disk.isSystem ? 'system' : disk.attribute;
      switch (delAttribute) {
        case 'system':
          systemDisk.push({
            key: disk.id,
            icon: 'icon-hardisk',
            type: 'system',
            title: formatMessage({ id: 'DESK_VOLUME_SYSTEM' }),
            render: () => {
              return <span>{disk.name}</span>;
            },
          });
          break;
        case 'personal':
          personalDisk.push({
            key: disk.id,
            icon: 'icon-hardisk',
            type: 'personal',
            title: formatMessage({ id: 'DESK_VOLUME_PERSONAL' }),
            render: () => {
              return <span>{disk.name}</span>;
            },
          });
          break;
        case 'common':
          otherDisks.push({
            key: disk.id,
            icon: 'icon-hardisk',
            type: 'common',
            title: formatMessage({ id: `DESK_VOLUME_COMMON` }),
            render: () => {
              return <span>{disk.name}</span>;
            },
          });
          break;
      }
    });
    switch (showDiskType) {
      case 'system':
        return [...systemDisk];
      case 'personal':
        return [...personalDisk];
      case 'common':
        return [...otherDisks];
      case 'system_1common':
        if (!isEmptyValue(otherDisks)) {
          otherDisks[0].showMore = true;
          otherDisks[0].showMoreAction = () => setShowAllDiskList(true);
          return [...systemDisk, ...[otherDisks[0]]];
        }
        return [];
      case 'all':
        return [...systemDisk, ...personalDisk, ...otherDisks];
      default:
        return [
          {
            key: 'DESK_VOLUME',
            icon: 'icon-hardisk',
            type: 'common',
            title: formatMessage({ id: `DESK_VLOUME` }),
            showMore: true,
            showMoreAction: () => setShowAllDiskList(true),
            render: () => {
              return (
                <span>
                  {formatMessage({ id: 'DESK_VOLUME_SYSTEM' })}：{systemDisk.length} 个 |{' '}
                  {formatMessage({ id: `DESK_VOLUME_COMMON` })}：
                  {totalDiskCount > 0 ? totalDiskCount - 1 : totalDiskCount} 个
                </span>
              );
            },
          },
        ];
    }
  };

  const config = [
    {
      key: 'DESK_STANDARD',
      icon: 'icon-project',
      title: formatMessage({ id: 'DESK_STANDARD' }),
      render: () => {
        return (
          <span>
            {'CPU'}：{transCpu(desk?.flavor?.cpu)} | {formatMessage({ id: 'STORE' })}：{num}
            {unit}
            {transGpu(desk)}
          </span>
        );
      },
    },
    ...diskConfigs(''),
    {
      key: 'DESK_IMAGE',
      icon: 'icon-mirror',
      title: formatMessage({ id: 'DESK_IMAGE' }),
      render: () => {
        return <span>{desk?.image?.name || EmptyText}</span>;
      },
    },
    {
      key: 'DESK_NETWORK',
      icon: 'icon-net',
      title: formatMessage({ id: 'DESK_NETWORK' }),
      render: () => {
        return <span className="desk-detail-fact__lines">{getDeskNetwork(desk?.interfaces)}</span>;
      },
    },
    {
      key: 'DESK_CON_DISCON_TIME',
      icon: 'icon-Willdo',
      title: formatMessage({ id: 'DESK_CON_DISCON_TIME' }),
      render: () => {
        return <span>{desk?.lastTime || EmptyText}</span>;
      },
    },
    {
      key: 'DESK_CREAT_TIME',
      icon: 'icon-time',
      title: formatMessage({ id: 'DESK_CREAT_TIME' }),
      render: () => {
        return <span>{desk?.createTime || EmptyText}</span>;
      },
    },
  ];

  const transType = (item: any) => {
    if (item.type === 'SHARE') {
      return <i className="iconfont icon-shared-desktop"></i>;
    } else if (item.type === 'RESTORE') {
      return <i className="iconfont icon-reductive"></i>;
    } else {
      return <i className="iconfont icon-exclusive1"></i>;
    }
  };

  return {
    desk,
    deskLoading,
    config,
    desktopDiskList,
    transType,
    getDeskList,
    showAllDiskList,
    setShowAllDiskList,
    loading,
    totalDiskCount,
    setTotalDiskCount,
    diskList,
    diskListParams,
    setDiskListParams,
    refreshDiskList,
  };
};

export default useDeskDetail;
