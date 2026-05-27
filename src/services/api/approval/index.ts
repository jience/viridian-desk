import { request } from '@/utils/request';

type ApprovalApiRequest = Record<string, any>;

export enum ApprovalApi {
  LIST_WORKFLOW = '/listWorkflow',
  CANCEL_WORKFLOW = '/cancelWorkflow',
  CREATE_WORKFLOW = '/createWorkflow',
  GET_WORKFLOW = '/getWorkflow',
}

export const listWorkflow = (data: ApprovalApiRequest) =>
  request(ApprovalApi.LIST_WORKFLOW, { method: 'POST', body: data });

export const cancelWorkflow = (data: ApprovalApiRequest) =>
  request(ApprovalApi.CANCEL_WORKFLOW, { method: 'POST', body: data });

export const createWorkflow = (data: ApprovalApiRequest) =>
  request(ApprovalApi.CREATE_WORKFLOW, { method: 'POST', body: data });

export const getWorkflowDetail = (data: ApprovalApiRequest) =>
  request(ApprovalApi.GET_WORKFLOW, { method: 'POST', body: data });
