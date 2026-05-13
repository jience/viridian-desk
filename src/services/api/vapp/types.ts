import type { ApiPageRequest, ApiPageResponse, ApiResponse } from '@/utils/request/types';

export enum VappCategory {
  OFFICE = 'Office',
  DESIGN = 'Design',
  GAME = 'Game',
  DEVELOPMENT = 'Develop',
  VIDEO = 'Video',
  UTILITIES = 'Utilities',
  OTHER = 'Other',
}

export enum VappModeType {
  /** 专属 */
  EXCLUSIVE = 'Exclusive',
  /** 共享 */
  SHARE = 'Share',
}

export type ListVappReq = ApiPageRequest & {
  isAdded?: boolean;
  category?: VappCategory;
  nameLike?: string;
};

export interface VappItem {
  /** 远程应用ID */
  id: string;
  /** 远程应用的名称 */
  name: string;
  /** 远程应用的路径 */
  target: string;
  /** 远程应用类别 */
  category: VappCategory;
  /** 远程应用的图片地址 */
  imgUrl: string;
  /** 远程应用的icon地址 */
  iconUrl: string;
  /** 远程应用发布类型 */
  publishType: 'User' | 'System';
  /** 远程应用的简介 */
  description: string;
  /** 远程应用的模式 */
  mode: VappModeType;
  /** 远程应用的协议类型 */
  protocolType: 'spice';
  /** 远程应用的更新时间 */
  updateTime: string;
  /** 远程应用的创建时间 */
  createTime: string;
  appIconUrl?: string;
}

export interface VappDesktopInfo {
  id: string;
  name: string;
  os: string;
  desktopPool?: {
    id: string;
    name: string;
    type: string;
    isKeepData: boolean;
  };
  createTime: string;
}

export interface ListVappItem {
  desktop?: VappDesktopInfo;
  id: number;
  vapp: VappItem;
}

export type ListVappResp = ApiResponse<ApiPageResponse<ListVappItem>>;

export type AddVappReq = {
  mIds: string[];
};

export type RemoveVappReq = {
  mIds: string[];
  desktopIds: string[];
};

export type DeleteVappReq = {
  mIds: string[];
  desktopIds: string[];
};

export type ListVappIconReq = {
  isTerminal?: boolean;
};

export interface VappIconItem {
  id: string;
  iconUrl: string;
  name: string;
}

export type ListVappIconResp = ApiResponse<VappIconItem[]>;

//   desktopId: res.desktop,
//   name: res.name,
//   icon: res.icon,
//   target: res.path,
//   category: res.category,
//   description: res.desc,
//   protocolType: res?.protocolType || undefined,
export type CreateVappReq = {
  desktopId: string;
  name: string;
  icon: string;
  target: string;
  category: VappCategory;
  description: string;
};
