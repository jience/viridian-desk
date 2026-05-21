import { request } from '@/utils/request';

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
