import { formatI18NKey } from '@/utils/utils';
export const faultStatus: {
  [key: string]: {
    'en-US': string;
    'zh-CN': string;
    statues: 'success' | 'processing' | 'error' | 'default' | 'warning';
  };
} = {
  unresolved: {
    'zh-CN': '待处理',
    'en-US': 'Pending',
    statues: 'processing',
  },
  solved: {
    'zh-CN': '已处理',
    'en-US': 'Solved',
    statues: 'success',
  },
  reject: {
    'zh-CN': '已驳回',
    'en-US': 'Rejected',
    statues: 'warning',
  },
  revoke: {
    'zh-CN': '已撤回',
    'en-US': 'Withdrawn',
    statues: 'error',
  },
};

export const faultTypes: {
  [key: string]: string;
} = {
  desktop: formatI18NKey('DesktopIssues'),
  terminal: formatI18NKey('TerminalIssues'),
  other: formatI18NKey('OtherIssues'),
};
