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

/**
 * @author QL
 * @date 2024-05-28 10:15:16
 * @version V..
 * @description 终端配置  登录配置  域组织部门  企业
 */
// 获取终端配置
export const getConfigForTerminal = (data: any) =>
  request(`/getTerminalConfig`, { method: 'POST', body: data });

// 获取登录配置
export const getTerminalLoginConfig = () => {
  return request(`/getTerminalLoginConfig`, { method: 'POST' });
};

// 获取域组织部门
export const getADDepartment = (data: any) => {
  return request(`/listAD`, { method: 'POST', body: data });
};

// 获取其他登录方式的注册企业
export const getOtherLoginCorp = (data: any) =>
  request('/listCorp', { method: 'POST', body: data });

/**
 * @author QL
 * @date 2024-05-28 10:16:00
 * @version V..
 * @description 用户名密码登录  本地手机号验证登陆  短信验证获取验证码  获取用户权限  登出
 */
// 用户名密码登录接口
export const doLogin = (data: any) => request('/loginUser', { method: 'POST', body: data });

// 本地用户登录获取手机号验证码
export const getTerminalAuthCode = (data: any) =>
  request(`/getTerminalAuthCode`, { method: 'POST', body: data });

// 手机号登录
export const terminalPhoneLogin = (data: any) =>
  request(`/terminalPhoneLogin`, { method: 'POST', body: data });

// 获取验证码
export const getPhoneCode = (data: any) => request(`/getPhoneCode`, { method: 'POST', body: data });

// 获取用户权限
export const getUserPermission = () => {
  return request(`/getUserPermission`, { method: 'POST' });
};

// 登出
export const logoutUser = (data: any) => request(`/logoutUser`, { method: 'POST', body: data });
