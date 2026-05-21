import { request } from '@/utils/request';

/**
 * @author QL
 * @date 2024-05-11 14:05:57
 * @version V..
 * @description 公告 消息
 */
// 获取历史消息列表
export const listHistoryMessage = (data: any) =>
  request(`/listHistoryMessage`, { method: 'POST', body: data });

// 删除历史消息
export const deleteHistoryMsg = (data: any) =>
  request(`/deleteTerminalMsg`, { method: 'POST', body: data });

// 获取历史公告列表
export const listHistoryNotice = (data: any) =>
  request(`/notice/listNotice`, { method: 'POST', body: data });

// 获取登录配置
export const getTerminalLoginConfig = () => {
  return request(`/getTerminalLoginConfig`, { method: 'POST' });
};

// 获取验证码
export const getPhoneCode = (data: any) => request(`/getPhoneCode`, { method: 'POST', body: data });

// 获取用户权限
export const getUserPermission = () => {
  return request(`/getUserPermission`, { method: 'POST' });
};

// 登出
export const logoutUser = (data: any) => request(`/logoutUser`, { method: 'POST', body: data });
