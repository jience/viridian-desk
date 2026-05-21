import { request } from '@/utils/request';
import type {
  AddVappReq,
  CreateVappReq,
  DeleteVappReq,
  ListVappIconReq,
  ListVappIconResp,
  ListVappReq,
  ListVappResp,
  RemoveVappReq,
} from './types';
import { fetchImageUrlToBase64 } from '@/utils/base64';
import { getStoreState } from '@/store/runtime-access';

export enum VappApi {
  LIST_VAPP = '/listVapp',
  ADD_VAPP = '/addVapp',
  DELETE_VAPP = '/deleteVapp',
  REMOVE_VAPP = '/removeVapp',
  LIST_VAPP_ICON = '/listVappIcon',
  CREATE_VAPP = '/createVapp',
  // GET_VAPP = '/getVapp',
  // UPDATE_VAPP = '/updateVapp',
  // ENTER_VAPP = '/enterVapp',
  // EXIT_VAPP = '/exitVapp',
}

export const listVapp = async (data: ListVappReq) => {
  const ip = getStoreState()?.gateway.autoGateway?.address;
  const res = await request<ListVappResp>(VappApi.LIST_VAPP, {
    method: 'POST',
    body: data,
    trackLoading: true,
  });
  if (res.data.results?.length) {
    res.data.results = await Promise.all(
      res.data.results.map(async (i) => {
        i.vapp.appIconUrl = await fetchImageUrlToBase64(`https://${ip}${i.vapp.imgUrl}`);
        return i;
      }),
    );
  }
  return res;
};

export const addVapp = async (data: AddVappReq) => {
  return request(VappApi.ADD_VAPP, {
    method: 'POST',
    body: data,
    trackLoading: true,
  });
};

export const deleteVapp = async (data: DeleteVappReq) => {
  return request(VappApi.DELETE_VAPP, {
    method: 'POST',
    body: data,
    trackLoading: true,
  });
};

export const removeVapp = async (data: RemoveVappReq) => {
  return request(VappApi.REMOVE_VAPP, {
    method: 'POST',
    body: data,
    trackLoading: true,
  });
};

export const listVappIcon = async (data: ListVappIconReq) => {
  const res = await request<ListVappIconResp>(VappApi.LIST_VAPP_ICON, {
    method: 'POST',
    body: data,
    trackLoading: true,
  });
  const ip = getStoreState()?.gateway.autoGateway?.address;
  res.data = await Promise.all(
    res.data.map(async (i) => {
      i.iconUrl = await fetchImageUrlToBase64(`https://${ip}${i.iconUrl}`);
      return i;
    }),
  );
  return res;
};

export const createVapp = async (data: CreateVappReq) => {
  return request(VappApi.CREATE_VAPP, {
    method: 'POST',
    body: data,
    trackLoading: true,
  });
};
