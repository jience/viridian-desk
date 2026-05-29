import {
  createSelector,
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { initState } from './initState';
import type { AppState } from '@/store';
import { reconnectWs } from '@/services/invoke/ws';
import { bridge } from '@/native';
import type { AddGatewayServerReq, UpdateGatewayServerReq } from '@/native/interfaces/config';

// 异步操作函数
export const fetchGatewayList = createAsyncThunk('gateway/fetchGatewayList', async () => {
  const response = await bridge.config.getGatewayServer();
  return response.data;
});

export const fetchClientOnlineStatus = createAsyncThunk(
  'gateway/fetchClientOnlineStatus',
  async () => {
    const response = await bridge.cmd.getClientOnlineStatus();
    return response.data;
  },
);

export const addGateway = createAsyncThunk(
  'gateway/addGateway',
  async (gatewayInfo: AddGatewayServerReq) => {
    await bridge.config.addGatewayServer(gatewayInfo);
    // 添加成功后重新获取列表
    const response = await bridge.config.getGatewayServer();
    return response.data;
  },
);

export const switchGateway = createAsyncThunk('gateway/switchGateway', async (gwid: string) => {
  await bridge.config.switchGatewayServer(gwid);
  // 切换成功后重新获取列表
  const response = await bridge.config.getGatewayServer();
  await reconnectWs();
  return response.data;
});

export const updateGateway = createAsyncThunk(
  'gateway/updateGateway',
  async (gatewayInfo: UpdateGatewayServerReq) => {
    await bridge.config.updateGatewayServer(gatewayInfo);
    // 更新成功后重新获取列表
    const response = await bridge.config.getGatewayServer();
    return response.data;
  },
);

export const deleteGateway = createAsyncThunk('gateway/deleteGateway', async (gwid: string) => {
  await bridge.config.deleteGatewayServer(gwid);
  // 删除成功后重新获取列表
  const response = await bridge.config.getGatewayServer();
  return response.data;
});

const gatewaySlice = createSlice({
  name: 'gateway',
  initialState: initState,
  reducers: {
    setConnected(state, res: PayloadAction<boolean>) {
      state.connected = res.payload;
      state.gatewayStatusChecking = false;
    },
    setNetwork(state, res: PayloadAction<boolean>) {
      state.network = res.payload;
    },
    setPublicNet(state, res: PayloadAction<boolean>) {
      state.publicNet = res.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGatewayList.fulfilled, (state, action) => {
        state.gatewayList = action.payload;
        // 更新自动网关信息
        const autoGateway = action.payload.find((item) => item.auto);
        state.autoGateway = autoGateway || null;
      })
      .addCase(fetchClientOnlineStatus.pending, (state) => {
        state.gatewayStatusChecking = true;
      })
      .addCase(fetchClientOnlineStatus.fulfilled, (state, action) => {
        state.connected = action.payload;
        state.gatewayStatusChecking = false;
      })
      .addCase(fetchClientOnlineStatus.rejected, (state) => {
        state.connected = false;
        state.gatewayStatusChecking = false;
      })

      // 添加网关
      .addCase(addGateway.fulfilled, (state, action) => {
        state.gatewayList = action.payload;
        const autoGateway = action.payload.find((item) => item.auto);
        state.autoGateway = autoGateway || null;
      })

      // 切换网关
      .addCase(switchGateway.pending, (state) => {
        state.connected = false;
        state.gatewayStatusChecking = true;
      })
      .addCase(switchGateway.fulfilled, (state, action) => {
        state.gatewayList = action.payload;
        const autoGateway = action.payload.find((item) => item.auto);
        state.autoGateway = autoGateway || null;
        state.gatewayStatusChecking = false;
      })
      .addCase(switchGateway.rejected, (state) => {
        state.connected = false;
        state.gatewayStatusChecking = false;
      })

      // 更新网关
      .addCase(updateGateway.fulfilled, (state, action) => {
        state.gatewayList = action.payload;
        const autoGateway = action.payload.find((item) => item.auto);
        state.autoGateway = autoGateway || null;
      })

      // 删除网关
      .addCase(deleteGateway.fulfilled, (state, action) => {
        state.gatewayList = action.payload;
        const autoGateway = action.payload.find((item) => item.auto);
        state.autoGateway = autoGateway || null;
      });
  },
});

export const { reducer: gatewayReducer, name: gatewaySliceName } = gatewaySlice;

export const { setConnected, setNetwork, setPublicNet } = gatewaySlice.actions;

export const selectAutoGateway = createSelector(
  [(state: AppState) => state.gateway],
  (gateway) => gateway.autoGateway,
);

export const selectConnected = createSelector(
  [(state: AppState) => state.gateway],
  (gateway) => gateway.connected,
);

export const selectGatewayStatusChecking = createSelector(
  [(state: AppState) => state.gateway],
  (gateway) => gateway.gatewayStatusChecking,
);

export const selectNetwork = createSelector(
  [(state: AppState) => state.gateway],
  (gateway) => gateway.network,
);

export const selectPublicNet = createSelector(
  [(state: AppState) => state.gateway],
  (gateway) => gateway.publicNet,
);

export const selectGatewayList = createSelector(
  [(state: AppState) => state.gateway],
  (gateway) => gateway.gatewayList,
);
