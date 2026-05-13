export const versionTypes = {
  2: 'ApplyForDesk',
};
export const userRoles = [
  {
    type: 'Terminal',
    name: 'NormalUser',
    enableApply: true,
    enableApproval: false,
  },
  {
    type: 'Department',
    name: 'DeptManager',
    enableApply: true,
    enableApproval: true,
  },
  {
    type: 'Platform',
    name: 'PlatformManager',
    enableApply: true,
    enableApproval: true,
  },
  {
    type: 'Security',
    name: 'SecurityManager',
    enableApply: false,
    enableApproval: false,
  },
  {
    type: 'Audit',
    name: 'AuditManager',
    enableApply: false,
    enableApproval: false,
  },
];
// 1:待审批 4:撤销 9:处理中 10:成功 11:驳回  12:失败
export const workflowStatus = {
  // TODO: 1,
  // CANCELED: 4,
  // DOING: 9,
  // SUCCESSFULL: 10,
  // REJECTED: 11,
  // FAILED: 12,
  pending: '待审批',
  processing: '执行中',
  success: '成功',
  reject: '驳回',
  error: '失败',
  revoke: '撤回',
};
export const workflowStatus_zh_CN = {
  [workflowStatus.TODO]: '待审批',
  [workflowStatus.CANCELED]: '撤回',
  [workflowStatus.DOING]: '执行中',
  [workflowStatus.SUCCESSFULL]: '成功',
  [workflowStatus.REJECTED]: '驳回',
  [workflowStatus.FAILED]: '失败',
};

export const workflowTempList_zh_Cn = {
  createDesktop: '申请桌面',
  extendDisk: '磁盘扩容',
  addDisk: '申请数据盘',
  resizeDesktop: '更改配置',
  updateApps: '更新软件',
  addSoftware: '软件申请',
  applyUsb: 'USB外设使用申请',
};

export const getWorkflowStatus = (status) => {
  let type = 'success';
  const showStatus = ['pending', 'processing', 'success', 'reject', 'error', 'revoke'];
  if (showStatus.indexOf(status) !== -1) {
    if (status === 'success') {
      type = 'success';
    } else if (['pending'].includes(status)) {
      type = 'processing';
    } else if (['reject', 'error'].includes(status)) {
      type = 'danger';
    } else if (['processing'].includes(status)) {
      type = 'warning';
    } else {
      type = 'default';
    }
  } else {
    type = 'processing';
  }
  return {
    type,
    title: workflowStatus[status],
  };
};
