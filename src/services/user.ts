import { request } from '@/utils/request';

// 修改密码
export const changePasswordUser = (data: any) =>
  request(`/changePasswordUser`, { method: 'POST', body: data });

// 获取用户信息
export const getUser = (data: any) => request(`/getUser`, { method: 'POST', body: data });

// 换手机号
export const updateUserPhone = (data: any) =>
  request(`/updateUserPhone`, { method: 'POST', body: data });
