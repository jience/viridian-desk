import { forwardRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Modal, message } from '@/shared/ui';
import './workflow-modal.scss';
import { clearEmpty } from '@/utils/utils';
import { createWorkflow } from '@/services/api/approval';
import { listAppLib } from '@/services/api/application';
import { listDesktopPool, listResourceUser } from '@/services/api/desktop';
import useRequest from '@/hooks/useRequest';
import { isEmptyValue } from '@/utils/value';
import {
  buildCreateWorkflowTemplates,
  buildWorkflowRequestPayload,
} from '../model/create-workflow';
import {
  AppLibField,
  CpuMemoryTip,
  DeskPoolField,
  DesktopField,
  DiskCapacityField,
  DiskField,
  ExtendCapacityField,
  ReasonField,
  SoftwareFields,
  UsbPeripheralFields,
  WorkflowTemplateField,
} from './create-workflow-fields';

const CreateForm = (props: any, _ref: any) => {
  // 常量定义
  const { formatMessage, refresh, visible, setVisible } = props;
  const [formIns] = Form.useForm();
  const workflowTempValue = Form.useWatch('workflowTemp', formIns);
  const deskPoolValue = Form.useWatch('deskPool', formIns);
  const deskTopIdValue = Form.useWatch('deskTopId', formIns);
  const diskIdvalue = Form.useWatch('diskId', formIns);
  const newCpuNumbersValue = Form.useWatch('newCpuNumbers', formIns);
  const newMemSizeValue = Form.useWatch('newMemSize', formIns);
  const appLibIdValue = Form.useWatch('appLibId', formIns);
  const peripheralName = Form.useWatch('peripheralName', formIns);

  const workflowTempList = useMemo(
    () => buildCreateWorkflowTemplates(formatMessage),
    [formatMessage],
  );

  // 桌面池列表
  const [deskPoolList, setDeskPoolList] = useState([]);
  // 桌面列表
  const [queryParams, _setQueryParams] = useState<any>({
    pageNum: 1,
    pageSize: 999,
    reverseStatusList: ['Unknown'],
  });
  const [deskTopList, setDeskTopList] = useState<any>([]);
  const [diskList, setDiskList] = useState<any>([]);
  // 应用库列表
  const [appLibList, setAppLibList] = useState<any>([]);
  // usb外设列表
  const [peripheralList, _setPeripheralList] = useState<any>([]);

  // 当前选中的桌面的详情
  const desktopDetail = useMemo(() => {
    return deskTopList?.find((i: any) => i?.id == deskTopIdValue);
  }, [deskTopIdValue, deskTopList]);

  // 获取桌面池
  const { run: listDesktopPoolRun, loading: listDesktopPoolLoading } = useRequest(listDesktopPool, {
    manual: true,
    onSuccess: (res: any) => {
      const poolList = res?.results;
      if (poolList?.length) {
        setDeskPoolList(poolList);
        formIns.setFieldsValue({
          deskPool: poolList[0]?.id || '',
        });
      } else {
        setDeskPoolList([]);
        formIns.setFieldsValue({
          deskPool: null,
        });
      }
    },
  });

  // 查桌面
  const { run: listResourceUserRun, loading: listResourceUserLoading } = useRequest(
    listResourceUser,
    {
      manual: true,
      onSuccess: (res: any) => {
        const list = res?.results || [];
        // 修改配置时，将共享池下桌面筛除
        const results =
          workflowTempValue == 'resizeDesktop'
            ? list?.filter(
                (i: any) => i?.desktopPool?.type != 'SHARE' && i?.os != 'Windows Server 2000',
              )
            : list;
        setDeskTopList(results);
        if (results.length) {
          formIns.setFieldsValue({
            deskTopId: results.find((item: any) => item.status !== 'Creating')?.id || null,
          });
        } else {
          formIns.setFieldsValue({
            deskTopId: null,
          });
        }
      },
    },
  );

  // 查应用库
  const { run: listAppLibRun, loading: listAppLibLoading } = useRequest(listAppLib, {
    manual: true,
    onSuccess: (res: any) => {
      const list = res?.results || [];
      let libList: any = [];
      if (desktopDetail?.storageType == 'LOCAL') {
        // local下 库的模板桌面hostId和所选桌面hostId相同才可以选择
        libList = list?.filter((i: any) => i?.modelDesktop?.hostId == desktopDetail?.hostId);
      }
      const result = desktopDetail?.storageType == 'LOCAL' ? libList : list;
      setAppLibList(result);
      formIns.setFieldsValue({
        appLibId: result[0]?.id || null,
      });
    },
  });

  const { run: createWorkflowRun, loading: createWorkflowLoading } = useRequest(createWorkflow, {
    manual: true,
    onSuccess: (_res: any) => {
      refresh();
      setVisible();
    },
  });

  const formRules = {
    newCpuNumbers: [
      {
        required: true,
        message: formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: formatMessage({ id: 'UpdateCPU' }) },
        ),
      },
    ],
    newMemSize: [
      {
        required: true,
        message: formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: formatMessage({ id: 'UpdateMemory' }) },
        ),
      },
    ],
  };

  // 生命周期
  useEffect(() => {
    if (visible) {
      formIns.setFieldsValue({
        workflowTemp: 'createDesktop', // 该变量被watch ，effect中会去请求桌面池
      });
    } else {
      formIns.resetFields();
      formIns.setFieldsValue({
        workflowTemp: 'createDesktop',
      });
      setDeskPoolList([]);
      setDeskTopList([]);
    }
  }, [formIns, visible]);

  // 桌面池detail
  const deskPoolDetial: any = useMemo(() => {
    if (deskPoolValue) {
      const list: any = deskPoolList.find((c: any) => c.id == deskPoolValue);
      const { os, flavor, name, network, disks = [], image } = list;
      const systemDisk = disks
        .filter((val: any) => val.isSystem && val.size != undefined)
        .map((val: any, index: any) => {
          return <div key={index}>{val.size} GB</div>;
        });
      const dataDisk = disks
        ?.filter((val: any) => !val.isSystem && val.size != undefined)
        ?.map((val: any, index: any) => {
          return <div key={index}>{val.size} GB</div>;
        });
      return {
        os,
        cpu: flavor?.cpu,
        memory: flavor?.memory,
        name,
        netWork: network?.subnets?.[0]?.cidr,
        systemDisk,
        dataDisk,
        image,
      };
    }
    return null;
  }, [deskPoolValue, deskPoolList]);

  const peripheralDetail = useMemo(() => {
    if (peripheralName) {
      return peripheralList.find(
        (peripheral: any) =>
          `${peripheral['DEVICE_NAME']}|${peripheral['PID']}|${peripheral['VID']}|${peripheral['DEVICE_TYPE']}` ===
          peripheralName,
      );
    }

    return null;
  }, [peripheralName, peripheralList]);

  // 查询应用库列表
  const queryAppLibList = useCallback(
    (desktopInfo: any) => {
      listAppLibRun({
        pageNum: 1,
        pageSize: 999,
        os: desktopInfo?.os,
        iaasId: desktopInfo?.iaas?.id,
        status: 'available',
      });
    },
    [listAppLibRun],
  );

  useEffect(() => {
    if (deskTopIdValue) {
      const desktopInfo = deskTopList.find((c: any) => c.id == deskTopIdValue);
      formIns.setFieldsValue({
        diskId: desktopInfo?.disks?.[0]?.id || null,
      });
      setDiskList(desktopInfo?.disks || []);
      if (workflowTempValue == 'updateApps') {
        // 获取应用库列表
        queryAppLibList(desktopInfo);
      }
      if (workflowTempValue == 'resizeDesktop') {
        // 切换桌面 清空 修改后选项
        formIns.setFieldsValue({
          newCpuNumbers: '',
          newMemSize: '',
        });
      }
    }
  }, [deskTopIdValue, deskTopList, formIns, queryAppLibList, workflowTempValue]);

  // 磁盘详情
  const diskDetial: any = useMemo(() => {
    if (diskIdvalue) {
      const info: any = diskList.length > 0 ? diskList.find((c: any) => c.id == diskIdvalue) : {};
      // createMaxNum
      // let maxNum = 200;
      // if (diskList[0] && diskList[0].isSystem) {
      //   // 系统盘最大扩容
      //   if (deskTopList[0].storageType === 'ARSTOR') {
      //     maxNum = 200;
      //   } else {
      //     maxNum = 2048;
      //   }
      // } else {
      //   // 数据盘最大扩容
      //   if (
      //     deskTopList[0].storageType === 'ARSTOR' ||
      //     deskTopList[0].storageType === 'LOCAL'
      //   ) {
      //     maxNum = 2048;
      //   } else if (
      //     deskTopList[0].storageType === 'FCSAN' ||
      //     deskTopList[0].storageType === 'IPSAN'
      //   ) {
      //     maxNum = 10240;
      //   }
      // }
      return {
        systemName: info?.isSystem ? '系统盘' : '数据盘',
        size: info?.size,
        preAllocation: info?.preAllocation,
        createMaxNum:
          desktopDetail?.storageType?.includes('SAN') && info?.preAllocation ? 4096 : 10240,
      };
    }
    return null;
  }, [desktopDetail?.storageType, diskIdvalue, diskList]);

  useEffect(() => {
    if (workflowTempValue == 'extendDisk' && !isEmptyValue(diskDetial)) {
      const sizeTemp =
        diskDetial?.size == 10240
          ? 10240
          : desktopDetail?.storageType?.includes('SAN') &&
              diskDetial?.preAllocation &&
              diskDetial?.size == 4096
            ? 4096
            : '';
      formIns.setFieldsValue({
        newSize: sizeTemp,
      });
      if (sizeTemp) {
        formIns.validateFields(['newSize']);
      }
    }
  }, [desktopDetail?.storageType, diskDetial, formIns, workflowTempValue]);

  // 查询桌面池列表
  const queryDesktopPoolList = useCallback(() => {
    listDesktopPoolRun({
      pageNumber: 1,
      pageSize: 999,
      poolTypes: ['EXCLUSIVE', 'RESTORE'],
      returnDetail: true,
    });
  }, [listDesktopPoolRun]);

  // 查询桌面列表数据
  const queryDesktopList = useCallback(
    (params: any) => {
      listResourceUserRun(params);
    },
    [listResourceUserRun],
  );

  // 查询usb外设列表
  const queryUsbPeripheralList = () => {
    // setPeripheralList(
    //   res.data,
    // );
    // formIns.setFieldsValue({
    //   peripheralName: `${res.data[0]['DEVICE_NAME']}|${res.data[0]['PID']}|${res.data[0]['VID']}|${res.data[0]['DEVICE_TYPE']}`,
    // });
  };

  // 更改配置 cpu和内存的校验文案
  const cpuAndMemErrorTip = useMemo(() => {
    if (workflowTempValue == 'resizeDesktop' && desktopDetail) {
      if (
        newCpuNumbersValue &&
        newMemSizeValue &&
        newCpuNumbersValue == desktopDetail?.cpu &&
        newMemSizeValue == desktopDetail?.memory
      ) {
        return formatMessage({ id: 'ResizeDesktopCPUorMemoryError' });
      }
    }
    return '';
  }, [workflowTempValue, desktopDetail, newCpuNumbersValue, newMemSizeValue, formatMessage]);

  // 创建
  const submitForm = () => {
    if (cpuAndMemErrorTip) {
      return;
    }
    formIns.validateFields().then((value) => {
      const {
        workflowTemp,
        reason,
        deskPool,
        deskTopId,
        size,
        newSize,
        diskId,
        newCpuNumbers,
        newMemSize,
        appLibId,
        softName,
        softVersion,
        peripheralName,
        desktopIds,
        applicationDeadline,
      } = value;
      const params = {
        workflowType: workflowTemp,
        reason: reason?.replace(/\s+/g, ' ').trim(),
        desktopPoolId: deskPool,
        desktopId: deskTopId,
        size,
        newSize,
        diskId,
        newCpuNumbers,
        newMemSize,
        appLibId,
        softName,
        softVersion,
        usbresource: peripheralName
          ? {
              name: peripheralName?.split('|')[0],
              type: peripheralName?.split('|')[3],
              PID: peripheralName?.split('|')[1],
              VID: peripheralName?.split('|')[2],
              desktopIds: desktopIds,
              startTime: applicationDeadline[0]?.format('YYYY-MM-DD HH:mm'),
              endTime: applicationDeadline[1]?.format('YYYY-MM-DD HH:mm'),
            }
          : undefined,
      };

      const desktop = deskTopList.find((item: any) => item.id == deskTopId) || {};
      if (workflowTemp == 'extendDisk' && desktop?.os?.includes('Windows Server 2000')) {
        message.error({
          content: formatMessage({ id: 'NotResizeDiskForWin2000' }),
        });
      } else {
        const realParam = buildWorkflowRequestPayload(params);
        createWorkflowRun(clearEmpty(realParam));
      }
    });
  };

  // 选中的应用库详情
  const appLibDetail = useMemo(() => {
    return appLibList?.find((i: any) => i?.id == appLibIdValue) || null;
  }, [appLibList, appLibIdValue]);

  useEffect(() => {
    if (workflowTempValue && visible) {
      formIns.resetFields(['reason']);
      if (workflowTempValue == 'createDesktop') {
        // 桌面池list
        queryDesktopPoolList();
      } else if (workflowTempValue == 'updateApps') {
        // 应用更新查询桌面列表过滤还原型桌面
        queryDesktopList({
          ...queryParams,
          isRestore: false,
          reverseDesktopPoolTypes: ['SHARE'],
        });
      } else if (workflowTempValue == 'applyUsb') {
        // 查询usb外设列表
        queryUsbPeripheralList();
        queryDesktopList(queryParams);
      } else {
        // 查询桌面列表
        queryDesktopList(queryParams);
      }
    }
  }, [formIns, queryDesktopList, queryDesktopPoolList, queryParams, visible, workflowTempValue]);

  const disableAdd = useMemo(() => {
    return (
      workflowTempValue == 'extendDisk' &&
      (diskDetial?.size == 10240 || (diskDetial?.size == 4096 && diskDetial?.preAllocation))
    );
  }, [workflowTempValue, diskDetial]);

  return (
    <Modal
      className="approval_modal_create"
      destroyOnHidden={true}
      open={visible}
      keyboard={false}
      transitionName="vd-modal-fade"
      title={formatMessage({ id: 'CreateWorkflow' })}
      onCancel={() => setVisible()}
      onOk={() => submitForm()}
      okButtonProps={{
        loading: createWorkflowLoading,
        disabled: disableAdd,
      }}
      okText={formatMessage({ id: 'Create' })}
      cancelText={formatMessage({ id: 'Cancel' })}
      centered
    >
      <Form form={formIns} colon={false} labelCol={{ span: 5 }}>
        <WorkflowTemplateField formatMessage={formatMessage} workflowTempList={workflowTempList} />
        {workflowTempValue == 'createDesktop' ? (
          <DeskPoolField
            formatMessage={formatMessage}
            loading={listDesktopPoolLoading}
            deskPoolList={deskPoolList}
            deskPoolDetail={deskPoolDetial}
          />
        ) : null}
        {workflowTempValue == 'extendDisk' ? (
          <>
            <DesktopField
              formatMessage={formatMessage}
              loading={listResourceUserLoading}
              workflowTempValue={workflowTempValue}
              desktopDetail={desktopDetail}
              deskTopList={deskTopList}
              formRules={formRules}
            />
            <DiskField formatMessage={formatMessage} diskList={diskList} diskDetail={diskDetial} />
            {diskDetial ? (
              <ExtendCapacityField formatMessage={formatMessage} diskDetail={diskDetial} />
            ) : null}
          </>
        ) : null}
        {workflowTempValue == 'addDisk' ? (
          <>
            <DesktopField
              formatMessage={formatMessage}
              loading={listResourceUserLoading}
              workflowTempValue={workflowTempValue}
              desktopDetail={desktopDetail}
              deskTopList={deskTopList}
              formRules={formRules}
            />
            <DiskCapacityField formatMessage={formatMessage} />
          </>
        ) : null}
        {workflowTempValue == 'resizeDesktop' ? (
          <DesktopField
            formatMessage={formatMessage}
            loading={listResourceUserLoading}
            workflowTempValue={workflowTempValue}
            desktopDetail={desktopDetail}
            deskTopList={deskTopList}
            formRules={formRules}
          />
        ) : null}
        {workflowTempValue == 'updateApps' ? (
          <>
            <DesktopField
              formatMessage={formatMessage}
              loading={listResourceUserLoading}
              workflowTempValue={workflowTempValue}
              desktopDetail={desktopDetail}
              deskTopList={deskTopList}
              formRules={formRules}
            />
            <AppLibField
              formatMessage={formatMessage}
              loading={listAppLibLoading}
              appLibList={appLibList}
              appLibDetail={appLibDetail}
            />
          </>
        ) : null}
        <CpuMemoryTip message={cpuAndMemErrorTip} />
        {workflowTempValue == 'addSoftware' ? <SoftwareFields formatMessage={formatMessage} /> : null}
        {workflowTempValue == 'applyUsb' ? (
          <UsbPeripheralFields
            formatMessage={formatMessage}
            peripheralList={peripheralList}
            peripheralDetail={peripheralDetail}
            deskTopList={deskTopList}
          />
        ) : null}
        <ReasonField
          formatMessage={formatMessage}
          workflowTempValue={workflowTempValue}
          disabled={disableAdd}
        />
      </Form>
    </Modal>
  );
};

export default forwardRef(CreateForm);
