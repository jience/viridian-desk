import { deviceTransLocal } from '@/utils/constant';
import type { MessageFormatterShape } from '@/utils/message-format';

export const createWorkflowTemplateIds = [
  ['createDesktop', 'ApplyForDesk'],
  ['extendDisk', 'ResizeDisk'],
  ['addDisk', 'ApplyDataDisk'],
  ['resizeDesktop', 'ChangeConfig'],
  ['addSoftware', 'ApplySoftware'],
  ['applyUsb', 'ApplyUSB'],
] as const;

export const buildCreateWorkflowTemplates = (
  formatMessage: MessageFormatterShape['formatMessage'],
) =>
  createWorkflowTemplateIds.map(([id, messageId]) => ({
    id,
    name: formatMessage({ id: messageId }),
  }));

export const getDeviceTypeLabels = (typeStr = '') =>
  typeStr
    .split(',')
    .filter(Boolean)
    .map((val) => deviceTransLocal[val as keyof typeof deviceTransLocal])
    .filter(Boolean);

export const buildWorkflowRequestPayload = (params: Record<string, any>) => {
  let resource = {};
  if (params.workflowType === 'createDesktop') {
    resource = {
      desktopPoolId: params.desktopPoolId,
    };
  } else if (params.workflowType === 'extendDisk') {
    resource = {
      desktopId: params.desktopId,
      diskId: params.diskId,
      newSize: params.newSize,
    };
  } else if (params.workflowType === 'addDisk') {
    resource = {
      desktopId: params.desktopId,
      size: params.size,
    };
  } else if (params.workflowType === 'resizeDesktop') {
    resource = {
      desktopId: params.desktopId,
      newCpuNumbers: params.newCpuNumbers,
      newMemSize: params.newMemSize,
    };
  } else if (params.workflowType === 'updateApps') {
    resource = {
      desktopId: params.desktopId,
      appLibId: params.appLibId,
    };
  } else if (params.workflowType === 'addSoftware') {
    resource = {
      name: params.softName,
      version: params.softVersion,
    };
  } else if (params.workflowType === 'applyUsb') {
    resource = {
      ...params.usbresource,
    };
  }

  return {
    workflowType: params.workflowType,
    reason: params.reason,
    resource,
  };
};
