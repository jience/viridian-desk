import InfoTable from '@/components/InfoTable';
import { SettingItem } from '@/components/SettingItem';
import { Modal, Spin } from '@/ui';
import { useImperativeHandle, useRef, useState, type FC, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfoTable } from './useInfoTable';
import style from './index.module.scss';

// 指定弹窗返回值类型
export type ApprovalDetailModalRespType = unknown | null; // 替换为实际返回值类型
// 指定弹窗请求参数类型
export type ApprovalDetailModalReqType = { id: string };
// 定义弹窗返回值解析函数类型
export type ResolveFunType = (value: ApprovalDetailModalRespType) => void;
// 定义弹窗打开参数类型
export type OpenModalParamType = {
  initData: ApprovalDetailModalReqType;
  // 其他可能的初始化的配置
};

export type ApprovalDetailModalRef = {
  openModal: (param: OpenModalParamType) => Promise<ApprovalDetailModalRespType>;
};

export interface ApprovalDetailModalProps {
  ref?: Ref<ApprovalDetailModalRef>;
}

export const ApprovalDetailModal: FC<ApprovalDetailModalProps> = ({ ref }) => {
  const [visible, setVisible] = useState(false);
  const resolveRef = useRef<ResolveFunType | null>(null);
  const { t } = useTranslation();
  const {
    baseInfo,
    getWorkflowDetailLoading,
    getWorkflowDetailRun,
    setWorkflowDetail,
    workflowDetail,
    approvalInfo,
    workflowStatusKv,
    getWorkflowStatusClass,
  } = useInfoTable();

  useImperativeHandle(
    ref,
    () => ({
      openModal: (param) => {
        return new Promise<ApprovalDetailModalRespType>((resolvePromise) => {
          setWorkflowDetail(undefined);
          const { initData } = param || {};
          setVisible(true);
          resolveRef.current = resolvePromise;
          getWorkflowDetailRun({ id: initData.id });
        });
      },
    }),
    [],
  );

  const handleCancel = () => {
    setVisible(false);
    resolveRef.current?.(null); // 替换为实际返回值类型的处理逻辑
  };

  return (
    <Modal
      title={t('approval_page.detail')} // 替换为实际标题内容
      open={visible}
      onCancel={handleCancel}
      centered
      maskClosable={false}
      keyboard={false}
      className={style.approvalDetailModalWrapper}
      footer={null}
    >
      <Spin spinning={getWorkflowDetailLoading}>
        <div className={style.approvalDetailModalContent}>
          <SettingItem mainTitle={t('approval_page.base_info')}>
            <InfoTable rows={baseInfo} />
            {workflowDetail?.status && !getWorkflowDetailLoading && (
              <div
                className={`${style.watermark} ${getWorkflowStatusClass(workflowDetail?.status)}`}
              >
                {workflowStatusKv[workflowDetail?.status]}
              </div>
            )}
          </SettingItem>
          {workflowDetail?.finishTime && (
            <SettingItem mainTitle={t('approval_page.approval_result')}>
              <InfoTable rows={approvalInfo} />
            </SettingItem>
          )}
        </div>
      </Spin>
    </Modal>
  );
};
