import type { InfoItem } from '@/shared/components/info-table';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import IconWithTooltip from '../icon-with-tooltip';
import useRequest from '@/hooks/useRequest';
import { getWorkflowDetail } from '@/services/api/approval';
import style from './index.module.scss';

export enum WorkflowStatus {
  /** 待审批 */
  PENDING = 'pending',
  /** 执行中 */
  PROCESSING = 'processing',
  /** 成功 */
  SUCCESS = 'success',
  /** 驳回 */
  REJECTED = 'reject',
  /** 失败 */
  ERROR = 'error',
  /** 撤回 */
  REVOKE = 'revoke',
}

export enum WorkFlowType {
  /** 申请桌面 */
  CREATE_DESKTOP = 'createDesktop',
  /** 磁盘扩容 */
  EXTEND_DISK = 'extendDisk',
  /** 申请数据盘 */
  ADD_DISK = 'addDisk',
  /** 更改配置 */
  RESIZE_DESKTOP = 'resizeDesktop',
  /** 软件申请 */
  ADD_SOFTWARE = 'addSoftware',
  /** 申请USB */
  APPLY_USB = 'applyUsb',
}

export enum DeskType {
  DATA_DISK = 'dataDisk',
  SYSTEM_DISK = 'systemDisk',
}

export interface WorkFlowCurrentConfig {
  currentCpu?: number;
  currentMemory?: number;
  currentDiskSize?: number;
}

export interface WorkFlowRequestConfig {
  requestCpu?: number;
  requestMemory?: number;
  requestDiskSize?: number;
  desktopsInfo: {
    name: string;
  }[];
  usbInfo?: {
    name: string;
    PID: string;
    VID: string;
    startTime: string;
    endTime: string;
  };
}

export interface WorkFlowDetail {
  createUser?: string;
  workflowType: WorkFlowType;
  status: WorkflowStatus;
  reason?: string;
  desktopPoolName?: string;
  diskType?: DeskType;
  desktopName?: string;
  diskLocation?: string;
  requestConfig?: WorkFlowRequestConfig;
  currentConfig?: WorkFlowCurrentConfig;
  softwareName?: string;
  softwareVersion?: string;
  finishTime?: string;
  approveUser?: string;
  opinion?: string;
}

export const useInfoTable = () => {
  const { t } = useTranslation();

  const [workflowDetail, setWorkflowDetail] = useState<WorkFlowDetail>();

  const workFlowTypeKv: Record<WorkFlowType, string> = useMemo(() => {
    return {
      [WorkFlowType.CREATE_DESKTOP]: t('approval_page.apply_for_desk'),
      [WorkFlowType.EXTEND_DISK]: t('approval_page.resize_disk'),
      [WorkFlowType.ADD_DISK]: t('approval_page.apply_data_disk'),
      [WorkFlowType.RESIZE_DESKTOP]: t('approval_page.change_config'),
      [WorkFlowType.ADD_SOFTWARE]: t('approval_page.apply_software'),
      [WorkFlowType.APPLY_USB]: t('approval_page.apply_usb'),
    };
  }, [t]);

  const workFlowTypeToShowIdsKv: Record<WorkFlowType, string[]> = useMemo(() => {
    return {
      [WorkFlowType.CREATE_DESKTOP]: ['requestDesktops', 'requestUSB', 'applicationDeadline'],
      [WorkFlowType.EXTEND_DISK]: [
        'desktopPoolName',
        'diskType',
        'desktopName',
        'currentDiskSize',
        'requestConfig',
        'diskLocation',
      ],
      [WorkFlowType.ADD_DISK]: ['diskType', 'desktopName', 'requestConfig', 'diskLocation'],
      [WorkFlowType.RESIZE_DESKTOP]: ['desktopName', 'currentDiskSize', 'requestConfig'],
      [WorkFlowType.ADD_SOFTWARE]: ['softwareName', 'softwareVersion'],
      [WorkFlowType.APPLY_USB]: ['requestDesktops', 'requestUSB', 'applicationDeadline'],
    };
  }, []);

  const workflowStatusKv: Record<WorkflowStatus, string> = useMemo(() => {
    return {
      [WorkflowStatus.PENDING]: t('approval_page.pending'),
      [WorkflowStatus.PROCESSING]: t('approval_page.processing'),
      [WorkflowStatus.SUCCESS]: t('approval_page.success'),
      [WorkflowStatus.REJECTED]: t('approval_page.rejected'),
      [WorkflowStatus.ERROR]: t('approval_page.error'),
      [WorkflowStatus.REVOKE]: t('approval_page.revoke'),
    };
  }, [t]);

  const deskTypeKv: Record<DeskType, string> = useMemo(() => {
    return {
      [DeskType.DATA_DISK]: t('approval_page.data_disk'),
      [DeskType.SYSTEM_DISK]: t('approval_page.system_disk'),
    };
  }, [t]);

  const getWorkflowStatusClass = (status: WorkflowStatus) => {
    let type = style.success;
    if (status === WorkflowStatus.SUCCESS) {
      type = style.success;
    } else if ([WorkflowStatus.PENDING].includes(status)) {
      type = style.processing;
    } else if ([WorkflowStatus.REJECTED, WorkflowStatus.ERROR].includes(status)) {
      type = style.danger;
    } else if ([WorkflowStatus.PROCESSING].includes(status)) {
      type = style.warning;
    }
    return type;
  };

  // 渲染 当前配置
  const renderCurrentConfig = useCallback(
    (value: WorkFlowDetail): ReactNode => {
      const { workflowType, currentConfig } = value;
      switch (workflowType) {
        case 'resizeDesktop':
          return (
            <div>
              <span className="m-r-sm">
                <IconWithTooltip icon="CPU" tips="CPU" />
                {`${currentConfig?.currentCpu || '-'} ${t('approval_page.desk_cpu_unit')}`}
              </span>
              <span className="m-r-sm">
                <IconWithTooltip icon="RAM" tips={t('approval_page.store')} />
                {currentConfig?.currentMemory ? `${currentConfig?.currentMemory} GB` : '-'}
              </span>
            </div>
          );
        default:
          return currentConfig?.currentDiskSize ? `${currentConfig?.currentDiskSize} GB` : '-';
      }
    },
    [t],
  );

  // 渲染 申请配置
  const renderRequestResource = useCallback(
    (value: WorkFlowDetail): ReactNode => {
      const { workflowType, requestConfig } = value;
      switch (workflowType) {
        case 'createDesktop':
        case 'resizeDesktop':
          return (
            <div>
              <span className="m-r-sm">
                <IconWithTooltip icon="CPU" tips="CPU" />
                {`${requestConfig?.requestCpu || '-'} ${t('approval_page.desk_cpu_unit')}`}
              </span>
              <span className="m-r-sm">
                <IconWithTooltip icon="RAM" tips={t('approval_page.store')} />
                {requestConfig?.requestMemory ? `${requestConfig?.requestMemory} GB` : '-'}
              </span>
            </div>
          );
        case 'addDisk':
          return requestConfig?.requestDiskSize ? `${requestConfig?.requestDiskSize} GB` : '-';
        case 'applyUsb':
          return (
            <div>
              <span className="m-r-sm">{`名称: ${requestConfig?.usbInfo?.name};`}</span>
              <span className="m-r-sm">{`PID: ${requestConfig?.usbInfo?.PID};`}</span>
              <span className="m-r-sm">{`VID: ${requestConfig?.usbInfo?.VID};`}</span>
            </div>
          );
        default:
          return requestConfig?.requestDiskSize ? `${requestConfig?.requestDiskSize} GB` : '-';
      }
    },
    [t],
  );

  const baseInfo: InfoItem[] = useMemo(() => {
    if (!workflowDetail) {
      return [];
    }
    const {
      createUser,
      status,
      reason,
      desktopPoolName,
      diskType,
      desktopName,
      diskLocation,
      requestConfig,
      workflowType,
      softwareName,
      softwareVersion,
    } = workflowDetail;

    const res: InfoItem[] = [
      {
        id: 'createUser',
        key: t('approval_page.request_user'),
        value: createUser,
      },
      {
        id: 'workflowType',
        key: t('approval_page.approval_type'),
        value: workFlowTypeKv[workflowType],
      },
      {
        id: 'status',
        key: t('approval_page.status'),
        value: workflowStatusKv[status],
      },
      {
        id: 'reason',
        key: t('approval_page.reason'),
        keyInfo: '',
        value: reason || '-',
      },
    ];

    const allItem: InfoItem[] = [
      {
        id: 'softwareName',
        key: t('approval_page.software_name'),
        keyInfo: '',
        value: softwareName,
      },
      {
        id: 'softwareVersion',
        key: t('approval_page.software_version'),
        value: softwareVersion,
      },
      {
        id: 'desktopPoolName',
        key: t('approval_page.desk_pool_name'),
        value: desktopPoolName || '-',
      },
      {
        id: 'diskType',
        key: t('approval_page.disk_type'),
        value: diskType ? deskTypeKv[diskType] : '-',
      },
      {
        id: 'desktopName',
        key: t('approval_page.desk_name'),
        value: desktopName || '-',
      },
      {
        id: 'currentDiskSize',
        key: t('approval_page.current_config'),
        value: renderCurrentConfig(workflowDetail),
      },
      {
        id: 'requestConfig',
        key: t('approval_page.request_config'),
        value: renderRequestResource(workflowDetail),
      },
      {
        id: 'diskLocation',
        key: t('approval_page.data_disk_storage_locate'),
        value: diskLocation || '-',
      },
      {
        id: 'requestDesktops',
        key: t('approval_page.apply_for_desk'),
        value: requestConfig?.desktopsInfo
          ?.map((item: any) => {
            return item.name;
          })
          .join(','),
      },
      {
        id: 'requestUSB',
        key: t('approval_page.usb_device'),
        value: renderRequestResource(workflowDetail),
      },
      {
        id: 'applicationDeadline',
        key: t('approval_page.application_deadline'),
        value: `${requestConfig?.usbInfo?.startTime} 至 ${requestConfig?.usbInfo?.endTime}`,
      },
    ];

    res.push(
      ...allItem.filter((item) => {
        return workFlowTypeToShowIdsKv[workflowType].includes(item.id);
      }),
    );

    return res;
  }, [
    t,
    deskTypeKv,
    renderCurrentConfig,
    renderRequestResource,
    workflowDetail,
    workFlowTypeKv,
    workflowStatusKv,
    workFlowTypeToShowIdsKv,
  ]);

  const approvalInfo: InfoItem[] = useMemo(() => {
    const { finishTime, approveUser, opinion } = workflowDetail || {};
    return [
      {
        id: 'finishTime',
        key: t('approval_page.treat_time'),
        value: finishTime,
      },
      {
        id: 'approveUser',
        key: t('approval_page.approve_user'),
        value: approveUser,
      },
      {
        id: 'replay',
        key: t('approval_page.approval_comment'),
        value: opinion,
      },
    ];
  }, [t, workflowDetail]);

  /**
   * @author QL
   * @date 2023-11-24 11:27:39
   * @version V..
   * @description requests
   */
  const { run: getWorkflowDetailRun, loading: getWorkflowDetailLoading } = useRequest(
    getWorkflowDetail,
    {
      manual: true,
      onSuccess: (res: any) => {
        setWorkflowDetail(res);
      },
    },
  );

  return {
    baseInfo,
    getWorkflowDetailRun,
    getWorkflowDetailLoading,
    setWorkflowDetail,
    workflowDetail,
    approvalInfo,
    workflowStatusKv,
    getWorkflowStatusClass,
  };
};
