// 获取网络类型
export const getNetworkType = () => {
  const ua = navigator.userAgent;
  let networkStr = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)?.[0] : 'NetType/other';
  networkStr = networkStr?.toLowerCase().replace('nettype/', '');
  let networkType = '';
  switch (networkStr) {
    case 'wifi':
      networkType = 'wifi';
      break;
    case '4g':
      networkType = '4g';
      break;
    case '3g':
      networkType = '3g';
      break;
    case '3gnet':
      networkType = '3g';
      break;
    case '2g':
      networkType = '2g';
      break;
    default:
      networkType = '本地连接';
  }
  return networkType;
};

export const transformSpeed = (speed: number) => {
  if (speed < 1024) {
    return `${speed} B/s`;
  } else if (speed < 1024 * 1024) {
    return `${(speed / 1024).toFixed(2)} KB/s`;
  } else {
    return `${(speed / 1024 / 1024).toFixed(2)} MB/s`;
  }
};

export enum SizeType {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
}
export const transformSize = (size: number = 0) => {
  if (size < 1024) {
    return `${size} ${SizeType.B}`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} ${SizeType.KB}`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} ${SizeType.MB}`;
  } else {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} ${SizeType.GB}`;
  }
};

export const getBSize = (size: number, sizeType: SizeType) => {
  switch (sizeType) {
    case SizeType.B:
      return size;
    case SizeType.KB:
      return size * 1024;
    case SizeType.MB:
      return size * 1024 * 1024;
    case SizeType.GB:
      return size * 1024 * 1024 * 1024;
    default:
      return size;
  }
};

/**
 * 脱敏文字函数
 */
export const desensitizeText = (
  text: string | number,
  frontNum: number = 3,
  endNum: number = 3,
) => {
  const t = String(text);
  if (!text) return '';
  const len = t.length - frontNum - endNum;
  let desensitizeStr = '';
  for (let i = 0; i < len; i++) {
    desensitizeStr += '*';
  }
  return t.substring(0, frontNum) + desensitizeStr + t.substring(t.length - endNum);
};
