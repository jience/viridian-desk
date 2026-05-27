import type { ReactNode } from 'react';
import type { MessageFormatterShape } from '@/utils/message-format';

export type WorkflowStatus = 'pending' | 'processing' | 'success' | 'reject' | 'error' | 'revoke';
export type ViewWorkflowStatus = WorkflowStatus | 'all';

export interface ApprovalWorkflowItem {
  id: string;
  workflowType?: string;
  approveUser?: string;
  status?: WorkflowStatus | string;
  createTime?: string;
  createUser?: string;
}

export type WorkflowStatusOption = {
  label: ReactNode;
  value: ViewWorkflowStatus;
};

export const workflowStatusOrder: WorkflowStatus[] = [
  'pending',
  'processing',
  'success',
  'reject',
  'error',
  'revoke',
];

export const workflowTypeMessageIds: Record<string, string> = {
  createDesktop: 'ApplyForDesk',
  extendDisk: 'ResizeDisk',
  addDisk: 'ApplyDataDisk',
  resizeDesktop: 'ChangeConfig',
  updateApps: 'UpdateApps',
  addSoftware: 'ApplySoftware',
  applyUsb: 'ApplyUSB',
};

export const isWorkflowStatus = (status?: string): status is WorkflowStatus =>
  workflowStatusOrder.includes(status as WorkflowStatus);

export const getWorkflowTypeLabel = (
  formatMessage: MessageFormatterShape['formatMessage'],
  workflowType?: string,
) => {
  if (!workflowType) {
    return '-';
  }

  const messageId = workflowTypeMessageIds[workflowType];
  return messageId ? formatMessage({ id: messageId, defaultMessage: workflowType }) : workflowType;
};
