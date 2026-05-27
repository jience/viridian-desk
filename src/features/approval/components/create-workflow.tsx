import { forwardRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Form,
  Select,
  Input,
  InputNumber,
  Modal,
  Divider,
  Row,
  Col,
  DatePicker,
  Tag,
  message,
} from '@/shared/ui';
import { EmptyText, deviceTransLocal } from '@/utils/constant';
import './workflow-modal.scss';
import Regex from '@/utils/regex';
import { clearEmpty } from '@/utils/utils';
import dayjs from 'dayjs';
import { listDesktopPool, listResourceUser, listAppLib, createWorkflow } from '@/services/resource';
import useRequest from '@/hooks/useRequest';
import { isEmptyValue } from '@/utils/value';

const { Option } = Select;
const { RangePicker } = DatePicker;

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

  const workflowTempList = [
    {
      id: 'createDesktop',
      name: formatMessage({ id: 'ApplyForDesk' }),
    },
    {
      id: 'extendDisk',
      name: formatMessage({ id: 'ResizeDisk' }),
    },
    {
      id: 'addDisk',
      name: formatMessage({ id: 'ApplyDataDisk' }),
    },
    {
      id: 'resizeDesktop',
      name: formatMessage({ id: 'ChangeConfig' }),
    },
    {
      id: 'addSoftware',
      name: formatMessage({ id: 'ApplySoftware' }),
    },
    {
      id: 'applyUsb',
      name: formatMessage({ id: 'ApplyUSB' }),
    },
  ];

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

  const transfor = (params: any) => {
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
    } else if (params.workflowType == 'addSoftware') {
      resource = {
        name: params.softName,
        version: params.softVersion,
      };
    } else if (params.workflowType == 'applyUsb') {
      resource = {
        ...params.usbresource,
      };
    }
    return {
      workflowType: params.workflowType,
      reason: params.reason,
      resource: resource,
    };
  };
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
        const realParam = transfor(params);
        createWorkflowRun(clearEmpty(realParam));
      }
    });
  };

  // 桌面池详情
  const renderDeskPoolInfo = () => {
    return (
      <Form.Item className="basic-form-item" label=" ">
        <div className="deskpool-info">
          <div className="item-info">
            <div className="title">{formatMessage({ id: 'DESK_STANDARD' })}</div>
            <div className="deskpool-spec">
              <div>
                {deskPoolDetial.cpu} {formatMessage({ id: 'DESK_CPU_UNIT' })}{' '}
                <Divider className="vertical-line" type="vertical" /> {deskPoolDetial.memory} GB
              </div>
            </div>
          </div>
          <div className="item-info">
            <div className="title">{formatMessage({ id: 'DESK_IMAGE' })}</div>
            <div className="deskpool-image" title={deskPoolDetial?.image?.name || EmptyText}>
              {deskPoolDetial?.image?.name || EmptyText}
            </div>
          </div>
          <div className="item-info">
            <div className="title">{formatMessage({ id: 'DESK_NETWORK' })}</div>
            <div className="deskpool-network" title={deskPoolDetial.netWork || EmptyText}>
              {deskPoolDetial.netWork ? deskPoolDetial.netWork : EmptyText}
            </div>
          </div>
          <div className="item-info">
            <div className="title">{formatMessage({ id: 'DESK_VOLUME_SYSTEM' })}</div>
            <div className="deskpool-sys-disk">
              {deskPoolDetial.systemDisk.length ? deskPoolDetial.systemDisk : EmptyText}
            </div>
          </div>
          <div className="item-info">
            <div className="title">{formatMessage({ id: 'DESK_VOLUME_COMMON' })}</div>
            <div className="deskpool-data-disk">
              {deskPoolDetial.dataDisk.length ? deskPoolDetial.dataDisk : EmptyText}
            </div>
          </div>
        </div>
      </Form.Item>
    );
  };
  // 桌面池
  const renderDeskPool = () => {
    return (
      <>
        <Form.Item
          name="deskPool"
          label={formatMessage({ id: 'DeskPools' })}
          className="basic-form-item basic-form-item-deskPools"
          rules={[
            {
              required: true,
              message: `${formatMessage({
                id: 'PleaseSelect',
              })}${formatMessage({ id: 'DeskPools' })}`,
            },
          ]}
        >
          <Select
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            loading={listDesktopPoolLoading}
          >
            {deskPoolList.map((it: any) => (
              <Option key={it.id}>{it.name}</Option>
            ))}
          </Select>
        </Form.Item>
        {deskPoolDetial ? renderDeskPoolInfo() : null}
      </>
    );
  };

  // 桌面
  const renderDeskTop = () => {
    return (
      <>
        <Form.Item
          name="deskTopId"
          label={formatMessage({ id: 'DESK' })}
          className="basic-form-item"
          rules={[
            {
              required: true,
              message: `${formatMessage({
                id: 'PleaseSelect',
              })}${formatMessage({ id: 'DESK' })}`,
            },
          ]}
          tooltip={
            workflowTempValue == 'resizeDesktop'
              ? formatMessage({ id: 'Win2000NotForUpdateConfig' })
              : ''
          }
        >
          <Select getPopupContainer={(node) => node.parentNode} loading={listResourceUserLoading}>
            {deskTopList.map((it: any) =>
              it.status === 'Creating' ? '' : <Option key={it.id}>{it.name}</Option>,
            )}
          </Select>
        </Form.Item>
        {workflowTempValue == 'resizeDesktop' && desktopDetail ? (
          <>
            <Form.Item label={formatMessage({ id: 'CurrentCPU' })}>
              <Input disabled value={desktopDetail?.flavor?.cpu} />
            </Form.Item>
            <Form.Item
              label={formatMessage({ id: 'UpdateCPU' })}
              name="newCpuNumbers"
              rules={formRules['newCpuNumbers']}
            >
              <InputNumber precision={0} min={1} step={1} max={128} />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'CurrentMemory' })}>
              <Input disabled value={desktopDetail?.flavor?.memory} />
            </Form.Item>
            <Form.Item
              label={formatMessage({ id: 'UpdateMemory' })}
              name="newMemSize"
              rules={formRules['newMemSize']}
            >
              <InputNumber precision={0} min={1} step={1} max={512} />
            </Form.Item>
          </>
        ) : null}
      </>
    );
  };

  // 磁盘
  const renderDisk = () => {
    return (
      <>
        <Form.Item
          name="diskId"
          label={formatMessage({ id: 'Disk' })}
          className="basic-form-item"
          rules={[
            {
              required: true,
              message: `${formatMessage({
                id: 'PleaseSelect',
              })}${formatMessage({ id: 'Disk' })}`,
            },
          ]}
        >
          <Select getPopupContainer={(node) => node.parentNode}>
            {diskList.length > 0 &&
              diskList.map((it: any) => <Option key={it.id}>{it.name}</Option>)}
          </Select>
        </Form.Item>
        {diskDetial ? renderDiskInfo() : null}
      </>
    );
  };

  // 磁盘详情
  const renderDiskInfo = () => {
    return (
      <>
        <Form.Item label={formatMessage({ id: 'DiskType' })} className="basic-form-item">
          <Input value={diskDetial?.systemName || ''} disabled />
        </Form.Item>
        <Form.Item label="当前配置" className="basic-form-item">
          <Input value={diskDetial?.size || ''} disabled suffix="GB" />
        </Form.Item>
      </>
    );
  };

  // 扩容
  const renderCapacity = () => {
    return (
      <Form.Item
        name="newSize"
        label={formatMessage({ id: 'DiskCapacity' })}
        className="basic-form-item"
        rules={[
          {
            required: true,
          },
          {
            validator: (_, value) => {
              if (
                value &&
                value == diskDetial?.size &&
                (diskDetial?.size == 10240 ||
                  (diskDetial?.size == 4096 && diskDetial.preAllocation))
              ) {
                return Promise.reject(new Error('已达到扩容上限'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <InputNumber
          className="approval-form-full-width"
          precision={0}
          min={
            (diskDetial?.size + 1 > diskDetial?.createMaxNum
              ? diskDetial?.size
              : diskDetial?.size + 1) || 0
          }
          max={diskDetial?.createMaxNum}
          disabled={diskDetial?.size == 10240}
          suffix="GB"
          placeholder={formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: formatMessage({ id: 'DiskCapacity' }) },
          )}
        />
      </Form.Item>
    );
  };
  // 容量
  const renderDiskCapacity = () => {
    return (
      <Form.Item
        name="size"
        label={formatMessage({ id: 'DiskSize' })}
        className="basic-form-item"
        rules={[
          {
            required: true,
            message: `请${formatMessage({
              id: 'Write',
            })}${formatMessage({ id: 'DiskSize' })}`,
          },
        ]}
      >
        <InputNumber
          className="approval-form-full-width"
          precision={0}
          min={10}
          max={10240}
          suffix="GB"
          placeholder={formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: formatMessage({ id: 'DiskSize' }) },
          )}
        />
      </Form.Item>
    );
  };

  // 应用库选择
  const renderAppLib = () => {
    return (
      <>
        <Form.Item
          name="appLibId"
          label={formatMessage({ id: 'AppLib' })}
          className="basic-form-item"
          rules={[
            {
              required: true,
              message: `${formatMessage({
                id: 'PleaseSelect',
              })}${formatMessage({ id: 'AppLib' })}`,
            },
          ]}
        >
          <Select getPopupContainer={(node) => node.parentNode} loading={listAppLibLoading}>
            {appLibList.map((it: any) => (
              <Option key={it.id}>{it.name}</Option>
            ))}
          </Select>
        </Form.Item>
        {/* 展示选中的应用库详情 */}
        {appLibDetail && (
          <Form.Item label={formatMessage({ id: 'AppLibDesc' })}>
            <div className="appLibDetail-desc">{appLibDetail?.description || '-'}</div>
          </Form.Item>
        )}
      </>
    );
  };

  // 选中的应用库详情
  const appLibDetail = useMemo(() => {
    return appLibList?.find((i: any) => i?.id == appLibIdValue) || null;
  }, [appLibList, appLibIdValue]);

  // 渲染软件申请表单项
  const renderSoft = () => {
    return (
      <>
        <Form.Item
          key={'softName'}
          name={'softName'}
          label={formatMessage({ id: 'SoftName' })}
          className="form_soft_right_item"
          rules={[
            {
              required: true,
              validator: (_rule: any, val: any, callback: any) => {
                if (!val || val.trim().length < 1) {
                  callback(`请输入${formatMessage({ id: 'SoftName' })}`);
                } else if (/^[^\u4e00-\u9fa5a-zA-Z0-9]+$/.test(val)) {
                  callback(
                    `输入的${formatMessage({
                      id: 'SoftName',
                    })}不能全是特殊符号`,
                  );
                } else {
                  callback();
                }
              },
            },
          ]}
          htmlFor={'false'} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
        >
          <Input maxLength={20} placeholder={formatMessage({ id: 'SoftNamePlaceHolder' })} />
        </Form.Item>
        <Form.Item
          key={'softVersion'}
          name={'softVersion'}
          label={formatMessage({ id: 'SoftVersion' })}
          className="form_soft_right_item"
          htmlFor={'false'} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
        >
          <Input maxLength={20} placeholder={formatMessage({ id: 'SoftVersionPlaceHolder' })} />
        </Form.Item>
      </>
    );
  };

  const transDeviceType = (typeStr: string) => {
    return typeStr.split(',').map((val) => {
      const v = val as keyof typeof deviceTransLocal;
      return deviceTransLocal[v];
    });
  };

  // usb外设详情
  const renderPeripheralDetail = useMemo(() => {
    if (peripheralDetail) {
      return (
        <Form.Item className="basic-form-item" label=" ">
          <div className="deskpool-info">
            <div className="item-info">
              <div className="title">外设类型</div>
              <div
                className="deskpool-network"
                title={transDeviceType(peripheralDetail['DEVICE_TYPE']).join(',') || EmptyText}
              >
                {peripheralDetail['DEVICE_TYPE']
                  ? transDeviceType(peripheralDetail['DEVICE_TYPE']).join(',')
                  : EmptyText}
              </div>
            </div>

            <div className="item-info">
              <div className="title">PID</div>
              <div className="deskpool-network" title={peripheralDetail['PID'] || EmptyText}>
                {peripheralDetail['PID'] ? peripheralDetail['PID'] : EmptyText}
              </div>
            </div>

            <div className="item-info">
              <div className="title">VID</div>
              <div className="deskpool-network" title={peripheralDetail['VID'] || EmptyText}>
                {peripheralDetail['VID'] ? peripheralDetail['VID'] : EmptyText}
              </div>
            </div>
          </div>
        </Form.Item>
      );
    }
  }, [peripheralDetail]);

  // usb外设使用申请
  const renderUsbPeripheral = useMemo(() => {
    return (
      <>
        <Form.Item
          key={'peripheralName'}
          name={'peripheralName'}
          label={formatMessage({ id: 'PeripheralName' })}
          className="form_usb_select"
          rules={[
            {
              required: true,
              message: `请选择${formatMessage({ id: 'PeripheralName' })}`,
            },
          ]}
          htmlFor={'false'} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
        >
          <Select getPopupContainer={(node) => node.parentNode}>
            {peripheralList.map((it: any) => (
              <Option key={`${it['DEVICE_NAME']}|${it['PID']}|${it['VID']}|${it['DEVICE_TYPE']}`}>
                <div
                  className="approval-peripheral-option"
                  title={`${it['DEVICE_NAME']}|${transDeviceType(it['DEVICE_TYPE']).join(',')}`}
                >
                  {`${it['DEVICE_NAME']}`}
                  {transDeviceType(it['DEVICE_TYPE']).map((type: any) => {
                    return (
                      <Tag key={type} className="usb-type-tag">
                        {type}
                      </Tag>
                    );
                  })}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        {peripheralDetail ? renderPeripheralDetail : null}
        <Form.Item
          name="desktopIds"
          label={formatMessage({ id: 'DESK' })}
          className="basic-form-item"
          rules={[
            {
              required: true,
              message: `${formatMessage({
                id: 'PleaseSelect',
              })}${formatMessage({ id: 'DESK' })}`,
            },
          ]}
        >
          <Select mode="multiple" getPopupContainer={(node) => node.parentNode}>
            {deskTopList.map((it: any) =>
              it.status === 'Creating' ? '' : <Option key={it.id}>{it.name}</Option>,
            )}
          </Select>
        </Form.Item>

        <Form.Item
          key={'applicationDeadline'}
          name={'applicationDeadline'}
          label={formatMessage({ id: 'ApplicationDeadline' })}
          rules={[
            {
              required: true,
              validator: (_rul: any, val: any) =>
                new Promise((resolve, reject) => {
                  if (!Array.isArray(val) || isEmptyValue(val)) {
                    reject(`请选择${formatMessage({ id: 'ApplicationDeadline' })}`);
                  } else if (dayjs(val[0]).add(3599, 's') > dayjs(val[1])) {
                    reject('起止时间间隔至少1小时');
                  }

                  resolve(true);
                }),
            },
          ]}
        >
          <RangePicker
            showTime
            allowClear={false}
            format={'YYYY-MM-DD HH:mm'}
            disabledDate={(current: any) => {
              return current < dayjs().startOf('minute');
            }}
          />
        </Form.Item>
      </>
    );
  }, [formatMessage, peripheralList, peripheralDetail, renderPeripheralDetail, deskTopList]);

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
        {/* 流程类型 */}
        <Form.Item
          name="workflowTemp"
          label={formatMessage({ id: 'WorkflowTemplate' })}
          rules={[
            {
              required: true,
              message: `${formatMessage({
                id: 'PleaseSelect',
              })}${formatMessage({ id: 'WorkflowTemplate' })}`,
            },
          ]}
        >
          <Select getPopupContainer={(node) => node.parentNode}>
            {workflowTempList.map((it: any) => (
              <Option key={it.id}>{it.name}</Option>
            ))}
          </Select>
        </Form.Item>
        {/* 桌面池 */}
        {workflowTempValue == 'createDesktop' ? renderDeskPool() : null}
        {workflowTempValue == 'extendDisk' ? (
          <>
            {renderDeskTop()}
            {renderDisk()}
            {diskDetial ? renderCapacity() : null}
          </>
        ) : null}
        {workflowTempValue == 'addDisk' ? (
          <>
            {renderDeskTop()}
            {renderDiskCapacity()}
          </>
        ) : null}
        {/* 修改配置 */}
        {workflowTempValue == 'resizeDesktop' ? <>{renderDeskTop()}</> : null}
        {/* 更新软件 */}
        {workflowTempValue == 'updateApps' ? (
          <>
            {renderDeskTop()}
            {renderAppLib()}
          </>
        ) : null}
        {cpuAndMemErrorTip ? (
          <Row className="cpu-mem-tip">
            <Col span={19} offset={5}>
              {cpuAndMemErrorTip}
            </Col>
          </Row>
        ) : null}
        {/* 软件申请 */}
        {workflowTempValue == 'addSoftware' ? <>{renderSoft()}</> : null}
        {/* USB外设申请 */}
        {workflowTempValue == 'applyUsb' ? <>{renderUsbPeripheral}</> : null}
        {/* 申请原因 */}
        <Form.Item
          name="reason"
          rules={[
            {
              required: [
                'createDesktop',
                'extendDisk',
                'addDisk',
                'resizeDesktop',
                'addSoftware',
              ].includes(workflowTempValue),
            },
            {
              pattern: Regex.isAllParse,
              message: formatMessage({
                id: 'allParseIsNotApprove',
              }),
            },
          ]}
          label={formatMessage({ id: 'ApplyReason' })}
        >
          <Input.TextArea
            defaultValue={''}
            showCount
            minLength={0}
            maxLength={200}
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={disableAdd}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default forwardRef(CreateForm);
