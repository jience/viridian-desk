import { formatI18NKey } from './utils';

/**
 * @author zhoujingjing
 * @description 日期格式
 */
export const dateFormate = 'yyyy-MM-dd HH:mm:ss';

/**
 * @author zhoujingjing
 * @description 空文本显示内容
 */
export const EmptyText = '-';

// Binary kilo unit
export const Ki = 1024;
// Binary mega unit
export const Mi = 1024 ** 2;
// Binary giga unit
export const Gi = 1024 ** 3;
// Binary tera unit
export const Ti = 1024 ** 4;
// Binary peta unit
export const Pi = 1024 ** 5;
export const DESK_STATUS = {
  START: 'Start',
  ERROR: 'Error',
  STOP: 'Stop',
  STOPPING: 'Stopping',
  REBOOTING: 'Rebooting',
  STOPRETAIN: 'StopRetain',
  PAUSED: 'Paused',
  UNKNOWN: 'Unknown',
  CREATING: 'Creating',
  SNAPSHOTCREATING: 'SnapshotCreating',
  SNAPSHOTDELETING: 'SnapshotDeleting',
  ROLLINGBACK: 'RollingBack',
  DELETING: 'Deleting',
};
const DESK_STATUS_Zh = {
  start: {
    zh_CN: '运行中',
  },
  error: {
    zh_CN: '异常',
  },
  stop: {
    zh_CN: '关机',
  },
  stopretain: {
    zh_CN: '关机并释放资源',
  },
  paused: {
    zh_CN: '暂停',
  },
  unknown: {
    zh_CN: '已删除',
  },
  creating: {
    zh_CN: '创建中',
  },
  snapshotcreating: {
    zh_CN: '快照创建中',
  },
  snapshotdeleting: {
    zh_CN: '快照删除中',
  },
  rollingback: {
    zh_CN: '快照回滚中',
  },
  deleting: {
    zh_CN: '删除中',
  },
};
// 获取桌面状态值
export const getStatus = (status) => {
  let type = 'success';
  let stat = status.toLowerCase();
  const showStatus = [
    'start',
    'error',
    'stop',
    'stopretain',
    'paused',
    'unknown',
    'creating',
    'snapshotcreating',
    'snapshotdeleting',
    'rollingback',
  ];
  if (showStatus.indexOf(stat) !== -1) {
    if (stat === 'start') {
      type = 'success';
    } else if (['stop', 'stopretain'].includes(stat)) {
      type = 'default';
    } else {
      type = 'warning';
    }
    return {
      type,
      title: window.LangCode == 'zh-CN' ? DESK_STATUS_Zh[stat]['zh_CN'] : stat,
    };
  } else {
    type = 'warning';
    return {
      type,
      title: formatI18NKey('Other'),
    };
  }
};
//外设信息类型type
export const deviceTransLocal = {
  0: '种类信息定义在接口描述符中',
  1: '音频设备',
  2: '通信设备',
  3: '人机接口设备',
  5: '物理设备',
  6: '图像设备',
  7: '打印机',
  8: '大容量存储',
  9: '集线器',
  a: '通信设备',
  b: '智能卡',
  d: '内容安全设备',
  e: '视频设备',
  f: '个人健康设备',
  10: '声音/视频设备',
  11: '广播牌设备',
  12: 'USB Type-C 桥接类',
  dc: '诊断设备',
  e0: '无线控制器',
  ef: '混杂设备',
  fe: '专用设备',
  ff: '供应商特定设备',
};

export const advancedSettingCardDisplay = {
  directConnectDesk: {
    normal: true,
    remoteDesktopPhysic: false,
  },
  agentConnect: {
    normal: true,
    remoteDesktopPhysic: false,
  },
};

export const defaultRouteMap = {
  remoteDesktopPhysic: '/app/application',
};
// storage 键值对
export const STORAGE_KEYS = {
  GATEWAY_LIST: 'gatewayList',
};

export const errorCodeMap = {
  // 400: '请求错误',
  403: '您没有进行该操作的权限，请与平台管理员联系。',
  // 404: 'API接口不存在',
  500: '平台服务异常，请联系管理员',
  502: '服务器网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
