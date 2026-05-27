import { Gi, Ki, Mi, Pi, Ti } from '@/utils/constant';
import { isEmptyValue } from '@/utils/value';
import i18next from 'i18next';

/**
 * @author zhoujingjing
 * @description 转义桌面图标
 * @param {*} value
 */
export function transIcon(value?: string) {
  if (!value) return <i className="iconfont icon-Desktop_defaultOS"></i>;
  const systemLower = value.toLowerCase();
  if (systemLower.indexOf('windows') > -1) {
    return <i className="iconfont icon-windows"></i>;
  }
  if (systemLower.indexOf('ubuntu') > -1) {
    return <i className="iconfont icon-ubuntu"></i>;
  }
  if (systemLower.indexOf('centos') > -1) {
    return <i className="iconfont icon-CentOS"></i>;
  }
  if (systemLower.indexOf('rhel') > -1) {
    return <i className="iconfont icon-redhat"></i>;
  }
  if (systemLower.indexOf('kylin') > -1) {
    return <i className="iconfont icon-KylinOS"></i>;
  }
  if (systemLower.indexOf('uos') > -1) {
    return <i className="iconfont icon-UOS icon-UOS-style"></i>;
  }
  return <i className="iconfont icon-Desktop_defaultOS"></i>;
}

export function isInteger(obj: number) {
  return Math.floor(obj) === obj;
}
/**
 * @author zhoujingjing
 * @description 转义内存数据
 * @param {*} ram
 */
export function transRam(ram: string | number) {
  const floatNumber = Number.parseFloat(String(ram));
  if (isNaN(floatNumber)) {
    return {
      num: 0,
      unit: 'GB',
    };
  }
  const bytes = floatNumber * Gi;
  if (bytes === 0) {
    return {
      num: 0,
      unit: 'GB',
    };
  }
  if (bytes < Ki) {
    const res = Number(bytes.toFixed(2));
    if (res > 1) {
      return {
        num: res,
        unit: 'Bytes',
      };
    } else {
      return {
        num: res,
        unit: 'Byte',
      };
    }
  }
  if (bytes < Mi) {
    return {
      num: isInteger(bytes / Ki) ? bytes / Ki : (bytes / Ki).toFixed(2),
      unit: 'KB',
    };
  }
  if (bytes < Gi) {
    return {
      num: isInteger(bytes / Mi) ? bytes / Mi : (bytes / Mi).toFixed(2),
      unit: 'MB',
    };
  }
  if (bytes < Ti) {
    return {
      num: isInteger(bytes / Gi) ? bytes / Gi : (bytes / Gi).toFixed(2),
      unit: 'GB',
    };
  }
  if (bytes < Pi) {
    return {
      num: isInteger(bytes / Ti) ? bytes / Ti : (bytes / Ti).toFixed(2),
      unit: 'TB',
    };
  }
  return {
    num: isInteger(bytes / Pi) ? bytes / Pi : (bytes / Pi).toFixed(2),
    unit: 'PB',
  };
}

export function getRandomNumberByRange(start: number, end: number) {
  return Math.round(Math.random() * (end - start) + start);
}

export function sum(x: number, y: number) {
  return x + y;
}

export function square(x: number) {
  return x * x;
}

// 获取数字以及字符随机码
export function getRandomCode(len?: number) {
  len = len || 32;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxPos = chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

export const appCategoryList = [
  {
    value: 'Office',
    name: '办公',
    title: '办公',
    key: 'Office',
  },
  {
    value: 'Design',
    name: '设计',
    title: '设计',
    key: 'Design',
  },
  {
    value: 'Game',
    name: '游戏',
    title: '游戏',
    key: 'Game',
  },
  {
    value: 'Develop',
    name: '开发',
    key: 'Develop',
    title: '开发',
  },
  {
    value: 'Video',
    name: '视频',
    key: 'Video',
    title: '视频',
  },
  {
    value: 'Utilities',
    name: '工具',
    key: 'Utilities',
    title: '工具',
  },
  {
    value: 'Other',
    name: '其他',
    key: 'Other',
    title: '其他',
  },
];

export const appModeList = [
  {
    value: 'Exclusive',
    name: '专属',
    key: 'Exclusive',
  },
  {
    value: 'Share',
    name: '共享',
    key: 'Share',
  },
];

// 去除对象中值为[null, undefined，'']的项 不递归
export const clearEmpty = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .filter(([, val]) => {
      return val !== null && val !== undefined && val !== '' && !isEmptyValue(val);
    })
    .reduce(
      (prev, [key, val]) => ({
        ...prev,
        [key]: val,
      }),
      {},
    );
};

export const formatTel = (tel?: string) => {
  return tel && tel.length == 11 ? tel.substring(0, 3) + '****' + tel.substr(tel.length - 4) : '';
};

/**
 * 字符串替换占位符，字典方式
 * 如：formatKey('桌面{name}创建成功', {name: '测试机'})
 */
export const formatKey = (string: string, data?: Record<string, any>) => {
  if (string) {
    if (data) {
      const keys = Object.keys(data);
      keys.map((key) => {
        string = string.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key]);
      });
      return string;
    }
    return string;
  }
  return '';
};

/**
 * 从语言包中找到对应字符串，并替换占位符，字典方式
 * 如：formatI18NKey('MISC_ExternalCreatedSucc', {name: '测试外网名称'})
 */
export const formatI18NKey = (string: string, data?: Record<string, any>) => {
  const value = i18next.t(string, {
    defaultValue: string,
    ...(data || {}),
  });

  return value;
};
