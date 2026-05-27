import dayjs from 'dayjs';
import { Col, DatePicker, Form, Input, InputNumber, Row, Select, Tag } from '@/shared/ui';
import Regex from '@/utils/regex';
import { isEmptyValue } from '@/utils/value';
import type { MessageFormatterShape } from '@/utils/message-format';
import { getDeviceTypeLabels } from '../model/create-workflow';
import { DeskPoolInfo, DiskInfo, PeripheralInfo } from './create-workflow-detail-blocks';

const { RangePicker } = DatePicker;

type FormatMessage = MessageFormatterShape['formatMessage'];

interface WorkflowTemplateFieldProps {
  formatMessage: FormatMessage;
  workflowTempList: Array<{ id: string; name: string }>;
}

export function WorkflowTemplateField({
  formatMessage,
  workflowTempList,
}: WorkflowTemplateFieldProps) {
  return (
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
      <Select options={workflowTempList.map((item) => ({ value: item.id, label: item.name }))} />
    </Form.Item>
  );
}

interface DeskPoolFieldProps {
  formatMessage: FormatMessage;
  loading: boolean;
  deskPoolList: any[];
  deskPoolDetail: any;
}

export function DeskPoolField({
  formatMessage,
  loading,
  deskPoolList,
  deskPoolDetail,
}: DeskPoolFieldProps) {
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
          loading={loading}
          options={deskPoolList.map((item) => ({ value: item.id, label: item.name }))}
        />
      </Form.Item>
      {deskPoolDetail ? (
        <DeskPoolInfo detail={deskPoolDetail} formatMessage={formatMessage} />
      ) : null}
    </>
  );
}

interface DesktopFieldProps {
  formatMessage: FormatMessage;
  loading: boolean;
  workflowTempValue?: string;
  desktopDetail: any;
  deskTopList: any[];
  formRules: Record<string, any[]>;
}

export function DesktopField({
  formatMessage,
  loading,
  workflowTempValue,
  desktopDetail,
  deskTopList,
  formRules,
}: DesktopFieldProps) {
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
        <Select
          loading={loading}
          options={deskTopList
            .filter((item) => item.status !== 'Creating')
            .map((item) => ({ value: item.id, label: item.name }))}
        />
      </Form.Item>
      {workflowTempValue == 'resizeDesktop' && desktopDetail ? (
        <>
          <Form.Item label={formatMessage({ id: 'CurrentCPU' })}>
            <Input disabled value={desktopDetail?.flavor?.cpu} />
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'UpdateCPU' })}
            name="newCpuNumbers"
            rules={formRules.newCpuNumbers}
          >
            <InputNumber precision={0} min={1} step={1} max={128} />
          </Form.Item>
          <Form.Item label={formatMessage({ id: 'CurrentMemory' })}>
            <Input disabled value={desktopDetail?.flavor?.memory} />
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'UpdateMemory' })}
            name="newMemSize"
            rules={formRules.newMemSize}
          >
            <InputNumber precision={0} min={1} step={1} max={512} />
          </Form.Item>
        </>
      ) : null}
    </>
  );
}

interface DiskFieldProps {
  formatMessage: FormatMessage;
  diskList: any[];
  diskDetail: any;
}

export function DiskField({ formatMessage, diskList, diskDetail }: DiskFieldProps) {
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
        <Select options={diskList.map((item) => ({ value: item.id, label: item.name }))} />
      </Form.Item>
      {diskDetail ? <DiskInfo detail={diskDetail} formatMessage={formatMessage} /> : null}
    </>
  );
}

interface ExtendCapacityFieldProps {
  formatMessage: FormatMessage;
  diskDetail: any;
}

export function ExtendCapacityField({ formatMessage, diskDetail }: ExtendCapacityFieldProps) {
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
              value == diskDetail?.size &&
              (diskDetail?.size == 10240 || (diskDetail?.size == 4096 && diskDetail.preAllocation))
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
          (diskDetail?.size + 1 > diskDetail?.createMaxNum
            ? diskDetail?.size
            : diskDetail?.size + 1) || 0
        }
        max={diskDetail?.createMaxNum}
        disabled={diskDetail?.size == 10240}
        suffix="GB"
        placeholder={formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: formatMessage({ id: 'DiskCapacity' }) },
        )}
      />
    </Form.Item>
  );
}

interface DiskCapacityFieldProps {
  formatMessage: FormatMessage;
}

export function DiskCapacityField({ formatMessage }: DiskCapacityFieldProps) {
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
}

interface AppLibFieldProps {
  formatMessage: FormatMessage;
  loading: boolean;
  appLibList: any[];
  appLibDetail: any;
}

export function AppLibField({
  formatMessage,
  loading,
  appLibList,
  appLibDetail,
}: AppLibFieldProps) {
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
        <Select
          loading={loading}
          options={appLibList.map((item) => ({ value: item.id, label: item.name }))}
        />
      </Form.Item>
      {appLibDetail && (
        <Form.Item label={formatMessage({ id: 'AppLibDesc' })}>
          <div className="appLibDetail-desc">{appLibDetail?.description || '-'}</div>
        </Form.Item>
      )}
    </>
  );
}

interface SoftwareFieldsProps {
  formatMessage: FormatMessage;
}

export function SoftwareFields({ formatMessage }: SoftwareFieldsProps) {
  return (
    <>
      <Form.Item
        key="softName"
        name="softName"
        label={formatMessage({ id: 'SoftName' })}
        className="form_soft_right_item"
        rules={[
          {
            required: true,
            validator: (_rule: any, value: string, callback: any) => {
              if (!value || value.trim().length < 1) {
                callback(`请输入${formatMessage({ id: 'SoftName' })}`);
              } else if (/^[^\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
                callback(`输入的${formatMessage({ id: 'SoftName' })}不能全是特殊符号`);
              } else {
                callback();
              }
            },
          },
        ]}
        htmlFor="false"
      >
        <Input maxLength={20} placeholder={formatMessage({ id: 'SoftNamePlaceHolder' })} />
      </Form.Item>
      <Form.Item
        key="softVersion"
        name="softVersion"
        label={formatMessage({ id: 'SoftVersion' })}
        className="form_soft_right_item"
        htmlFor="false"
      >
        <Input maxLength={20} placeholder={formatMessage({ id: 'SoftVersionPlaceHolder' })} />
      </Form.Item>
    </>
  );
}

interface UsbPeripheralFieldsProps {
  formatMessage: FormatMessage;
  peripheralList: any[];
  peripheralDetail: any;
  deskTopList: any[];
}

export function UsbPeripheralFields({
  formatMessage,
  peripheralList,
  peripheralDetail,
  deskTopList,
}: UsbPeripheralFieldsProps) {
  return (
    <>
      <Form.Item
        key="peripheralName"
        name="peripheralName"
        label={formatMessage({ id: 'PeripheralName' })}
        className="form_usb_select"
        rules={[
          {
            required: true,
            message: `请选择${formatMessage({ id: 'PeripheralName' })}`,
          },
        ]}
        htmlFor="false"
      >
        <Select
          options={peripheralList.map((item) => {
            const deviceTypes = getDeviceTypeLabels(item['DEVICE_TYPE']);
            const value = `${item['DEVICE_NAME']}|${item['PID']}|${item['VID']}|${item['DEVICE_TYPE']}`;

            return {
              value,
              label: (
                <div
                  className="approval-peripheral-option"
                  title={`${item['DEVICE_NAME']}|${deviceTypes.join(',')}`}
                >
                  {`${item['DEVICE_NAME']}`}
                  {deviceTypes.map((type) => (
                    <Tag key={type} className="usb-type-tag">
                      {type}
                    </Tag>
                  ))}
                </div>
              ),
            };
          })}
        />
      </Form.Item>
      {peripheralDetail ? <PeripheralInfo detail={peripheralDetail} /> : null}
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
        <Select
          mode="multiple"
          options={deskTopList
            .filter((item) => item.status !== 'Creating')
            .map((item) => ({ value: item.id, label: item.name }))}
        />
      </Form.Item>

      <Form.Item
        key="applicationDeadline"
        name="applicationDeadline"
        label={formatMessage({ id: 'ApplicationDeadline' })}
        rules={[
          {
            required: true,
            validator: (_rule: any, value: any) =>
              new Promise((resolve, reject) => {
                if (!Array.isArray(value) || isEmptyValue(value)) {
                  reject(`请选择${formatMessage({ id: 'ApplicationDeadline' })}`);
                } else if (dayjs(value[0]).add(3599, 's') > dayjs(value[1])) {
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
          format="YYYY-MM-DD HH:mm"
          disabledDate={(current: any) => {
            return current < dayjs().startOf('minute');
          }}
        />
      </Form.Item>
    </>
  );
}

interface CpuMemoryTipProps {
  message?: string;
}

export function CpuMemoryTip({ message }: CpuMemoryTipProps) {
  if (!message) return null;

  return (
    <Row className="cpu-mem-tip">
      <Col span={19} offset={5}>
        {message}
      </Col>
    </Row>
  );
}

interface ReasonFieldProps {
  formatMessage: FormatMessage;
  workflowTempValue?: string;
  disabled?: boolean;
}

export function ReasonField({ formatMessage, workflowTempValue, disabled }: ReasonFieldProps) {
  return (
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
          ].includes(workflowTempValue || ''),
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
        defaultValue=""
        minLength={0}
        maxLength={200}
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={disabled}
      />
    </Form.Item>
  );
}
