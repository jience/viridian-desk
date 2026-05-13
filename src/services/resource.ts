import { request } from '@/utils/request';

/**
 * @author QL
 * @date 2024-04-12 09:28:06
 * @version V..
 * @description 桌面管理
 */
// 获取桌面列表下的桌面
export const listResourceUser = (data: any) =>
  request(`/listResourceUser`, { method: 'POST', body: data });

// 获取桌面列表下的桌面池
export const listDesktopPool = (data: any) =>
  request(`/listDesktopPool`, { method: 'POST', body: data });

// 设置默认桌面
export const setAutoDesktop = (data: any) =>
  request(`/setAutoDesktop`, { method: 'POST', body: data });

// 重启桌面
export const rebootDesktop = (data: any) =>
  request(`/rebootDesktop`, { method: 'POST', body: data });

// 关机
export const stopDesktop = (data: any) => request(`/stopDesktop`, { method: 'POST', body: data });

// 关闭电源
export const shutdownDesktop = (data: any) =>
  request(`/shutdownDesktop`, { method: 'POST', body: data });

// 磁盘列表
export const listVolume = (data: any) => request(`/listVolume`, { method: 'POST', body: data });

// 创快照
export const createSnapshot = (data: any) =>
  request(`/createSnapshot`, { method: 'POST', body: data });

// 快照列表
export const getSnapshot = (data: any) => request(`/getSnapshot`, { method: 'POST', body: data });

// 删除快照
export const deleteSnapshot = (data: any) =>
  request(`/deleteSnapshot`, { method: 'POST', body: data });

// 回滚快照
export const applySnapshot = (data: any) =>
  request(`/applySnapshot`, { method: 'POST', body: data });

// 挂载磁盘
export const attachVolume = (data: any) => request(`/attachVolume`, { method: 'POST', body: data });

// 卸载磁盘
export const detachVolume = (data: any) => request(`/detachVolume`, { method: 'POST', body: data });

// 获取存储位置列表
export const listStorage = (data: any) => request(`/listStorage`, { method: 'POST', body: data });

// 池创桌面
export const createDesktopFromPool = (data: any) =>
  request(`/createDesktopFromPool`, { method: 'POST', body: data });

// 获取桌面vnc链接
export const getDesktopVncAddress = (data: any) =>
  request('/getDesktopVncAddress', { method: 'POST', body: data });

/**
 * @author QL
 * @date 2024-04-12 09:29:24
 * @version V..
 * @description 应用管理
 */
// 应用库列表
export const listAppLib = (data: any) => request(`/listAppLib`, { method: 'POST', body: data });

/**
 * @author QL
 * @date 2024-04-12 09:26:50
 * @version V..
 * @description 流程申请
 */
// 获取流程
export const listWorkflow = (data: any) => request(`/listWorkflow`, { method: 'POST', body: data });

// 撤回
export const cancelWorkflow = (data: any) =>
  request(`/cancelWorkflow`, { method: 'POST', body: data });

// 创建流程
export const createWorkflow = (data: any) =>
  request(`/createWorkflow`, { method: 'POST', body: data });

// 获取流程详情
export const getWorkflowDetail = (data: any) =>
  request(`/getWorkflow`, { method: 'POST', body: data });

// 创建工单
export const createFault = (data: any) => request(`/createFault`, { method: 'POST', body: data });

// 撤回工单
export const revokeFault = (data: any) => request(`/revokeFault`, { method: 'POST', body: data });

// 获取公告消息
export const listNotice = (data: any) =>
  request(`/notice/listNotice`, { method: 'POST', body: data });

// 删除应用
export const deleteVapp = (data: any) => request(`/deleteVapp`, { method: 'POST', body: data });

// 移除应用
export const removeVapp = (data: any) => request(`/removeVapp`, { method: 'POST', body: data });

// 获取应用列表
export const listVapp = (data: any) => request(`/listVapp`, { method: 'POST', body: data });

// 添加应用
export const addVapp = (data: any) => request(`/addVapp`, { method: 'POST', body: data });

// 获取图标
export const listVappIcon = (data: any) => request(`/listVappIcon`, { method: 'POST', body: data });

// 添加应用
export const createVapp = (data: any) => request(`/createVapp`, { method: 'POST', body: data });
