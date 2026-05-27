import { request } from '@/utils/request';
import type { DesktopApiRequest, ListResourceUserReq, ListResourceUserRes } from './types';

export enum DeskTopApi {
  LIST_RESOURCE_USER = '/listResourceUser',
  LIST_DESKTOP_POOL = '/listDesktopPool',
  SET_AUTO_DESKTOP = '/setAutoDesktop',
  REBOOT_DESKTOP = '/rebootDesktop',
  STOP_DESKTOP = '/stopDesktop',
  SHUTDOWN_DESKTOP = '/shutdownDesktop',
  LIST_VOLUME = '/listVolume',
  CREATE_SNAPSHOT = '/createSnapshot',
  GET_SNAPSHOT = '/getSnapshot',
  DELETE_SNAPSHOT = '/deleteSnapshot',
  APPLY_SNAPSHOT = '/applySnapshot',
  ATTACH_VOLUME = '/attachVolume',
  DETACH_VOLUME = '/detachVolume',
  LIST_STORAGE = '/listStorage',
  CREATE_DESKTOP_FROM_POOL = '/createDesktopFromPool',
  GET_DESKTOP_VNC_ADDRESS = '/getDesktopVncAddress',
}

export const listResourceUser = async (data: ListResourceUserReq) => {
  return request<ListResourceUserRes>(DeskTopApi.LIST_RESOURCE_USER, {
    method: 'POST',
    body: data,
  });
};

export const listDesktopPool = (data: DesktopApiRequest) =>
  request(DeskTopApi.LIST_DESKTOP_POOL, { method: 'POST', body: data });

export const setAutoDesktop = (data: DesktopApiRequest) =>
  request(DeskTopApi.SET_AUTO_DESKTOP, { method: 'POST', body: data });

export const rebootDesktop = (data: DesktopApiRequest) =>
  request(DeskTopApi.REBOOT_DESKTOP, { method: 'POST', body: data });

export const stopDesktop = (data: DesktopApiRequest) =>
  request(DeskTopApi.STOP_DESKTOP, { method: 'POST', body: data });

export const shutdownDesktop = (data: DesktopApiRequest) =>
  request(DeskTopApi.SHUTDOWN_DESKTOP, { method: 'POST', body: data });

export const listVolume = (data: DesktopApiRequest) =>
  request(DeskTopApi.LIST_VOLUME, { method: 'POST', body: data });

export const createSnapshot = (data: DesktopApiRequest) =>
  request(DeskTopApi.CREATE_SNAPSHOT, { method: 'POST', body: data });

export const getSnapshot = (data: DesktopApiRequest) =>
  request(DeskTopApi.GET_SNAPSHOT, { method: 'POST', body: data });

export const deleteSnapshot = (data: DesktopApiRequest) =>
  request(DeskTopApi.DELETE_SNAPSHOT, { method: 'POST', body: data });

export const applySnapshot = (data: DesktopApiRequest) =>
  request(DeskTopApi.APPLY_SNAPSHOT, { method: 'POST', body: data });

export const attachVolume = (data: DesktopApiRequest) =>
  request(DeskTopApi.ATTACH_VOLUME, { method: 'POST', body: data });

export const detachVolume = (data: DesktopApiRequest) =>
  request(DeskTopApi.DETACH_VOLUME, { method: 'POST', body: data });

export const listStorage = (data: DesktopApiRequest) =>
  request(DeskTopApi.LIST_STORAGE, { method: 'POST', body: data });

export const createDesktopFromPool = (data: DesktopApiRequest) =>
  request(DeskTopApi.CREATE_DESKTOP_FROM_POOL, { method: 'POST', body: data });

export const getDesktopVncAddress = (data: DesktopApiRequest) =>
  request(DeskTopApi.GET_DESKTOP_VNC_ADDRESS, { method: 'POST', body: data });
