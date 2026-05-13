export enum NetStatus {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum NetFamily {
  IPv4 = 'ipv4',
  IPv6 = 'ipv6',
}

export interface NetProbeItem {
  /**
   * 网络名称
   */
  name: string;
  /**
   * MAC 地址
   */
  mac: string;
  /**
   *  IPv4 地址
   */
  ipv4: string;
  /**
   * 子网掩码
   */
  netmask: string;
  /**
   * CIDR 地址
   */
  cidr: string;
  /**
   * 是否启用DHCP
   */
  dhcpEnabled: 0 | 1;
  /**
   * 地址类型（ipv4）
   */
  family: NetFamily;
  /**
   * 网关地址
   */
  gateway: string;
  /**
   * 是否为内部网卡
   */
  internal: 0 | 1;
  /**
   * 接口状态（UP 或 DOWN）
   */
  status: NetStatus;
  /**
   * 网络速度
   */
  speed: string;
}

export type NetProbeItemRender = Omit<NetProbeItem, 'internal' | 'dhcpEnabled'> & {
  internal: boolean;
  dhcpEnabled: boolean;
};

export type GetLocalNetInfoResp = NetProbeItemRender[];

export type GetLogInfoRes = {
  /** 日志级别 */
  level: string;
  /** 日志路径 */
  path: string;
  /** 日志最大大小 */
  max_file_size: number;
  /** 轮换策略 */
  rotation_strategy: number;
  /** 日志总大小 */
  log_size: number;
  /** 日志保存数量 */
  log_retention_files: number;
};

export type SetLogReq = {
  /** 日志路径 */
  path: string;
  /** 日志最大大小 */
  maxFileSize: number;
  /** 轮换策略 */
  rotationStrategy: number;
  /** 日志保存数量 */
  logRetentionFiles: number;
};

export type DiagnoseEvent =
  | {
      event: 'Started';
      data: {
        totalItems: number;
      };
    }
  | {
      event: 'Progress';
      data: {
        diagnosedItems: number;
        status: {
          port: number;
          is_open: boolean;
        };
      };
    }
  | {
      event: 'Finished';
      data?: null;
    };
