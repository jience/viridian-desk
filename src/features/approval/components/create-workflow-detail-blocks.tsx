import type { ReactNode } from 'react';
import { Divider, Form, Input } from '@/shared/ui';
import { EmptyText } from '@/utils/constant';
import type { MessageFormatterShape } from '@/utils/message-format';
import { getDeviceTypeLabels } from '../model/create-workflow';

interface DeskPoolInfoProps {
  detail: {
    cpu?: string | number;
    memory?: string | number;
    netWork?: string;
    systemDisk?: ReactNode[];
    dataDisk?: ReactNode[];
    image?: { name?: string };
  };
  formatMessage: MessageFormatterShape['formatMessage'];
}

export function DeskPoolInfo({ detail, formatMessage }: DeskPoolInfoProps) {
  return (
    <Form.Item className="basic-form-item" label=" ">
      <div className="deskpool-info">
        <div className="item-info">
          <div className="title">{formatMessage({ id: 'DESK_STANDARD' })}</div>
          <div className="deskpool-spec">
            <div>
              {detail.cpu} {formatMessage({ id: 'DESK_CPU_UNIT' })}{' '}
              <Divider className="vertical-line" type="vertical" /> {detail.memory} GB
            </div>
          </div>
        </div>
        <div className="item-info">
          <div className="title">{formatMessage({ id: 'DESK_IMAGE' })}</div>
          <div className="deskpool-image" title={detail?.image?.name || EmptyText}>
            {detail?.image?.name || EmptyText}
          </div>
        </div>
        <div className="item-info">
          <div className="title">{formatMessage({ id: 'DESK_NETWORK' })}</div>
          <div className="deskpool-network" title={detail.netWork || EmptyText}>
            {detail.netWork ? detail.netWork : EmptyText}
          </div>
        </div>
        <div className="item-info">
          <div className="title">{formatMessage({ id: 'DESK_VOLUME_SYSTEM' })}</div>
          <div className="deskpool-sys-disk">
            {detail.systemDisk?.length ? detail.systemDisk : EmptyText}
          </div>
        </div>
        <div className="item-info">
          <div className="title">{formatMessage({ id: 'DESK_VOLUME_COMMON' })}</div>
          <div className="deskpool-data-disk">
            {detail.dataDisk?.length ? detail.dataDisk : EmptyText}
          </div>
        </div>
      </div>
    </Form.Item>
  );
}

interface DiskInfoProps {
  detail: {
    systemName?: string;
    size?: string | number;
  };
  formatMessage: MessageFormatterShape['formatMessage'];
}

export function DiskInfo({ detail, formatMessage }: DiskInfoProps) {
  return (
    <>
      <Form.Item label={formatMessage({ id: 'DiskType' })} className="basic-form-item">
        <Input value={detail?.systemName || ''} disabled />
      </Form.Item>
      <Form.Item label="当前配置" className="basic-form-item">
        <Input value={detail?.size || ''} disabled suffix="GB" />
      </Form.Item>
    </>
  );
}

interface PeripheralInfoProps {
  detail: Record<string, string | undefined>;
}

export function PeripheralInfo({ detail }: PeripheralInfoProps) {
  const deviceTypeLabels = getDeviceTypeLabels(detail['DEVICE_TYPE']).join(',');

  return (
    <Form.Item className="basic-form-item" label=" ">
      <div className="deskpool-info">
        <div className="item-info">
          <div className="title">外设类型</div>
          <div className="deskpool-network" title={deviceTypeLabels || EmptyText}>
            {detail['DEVICE_TYPE'] ? deviceTypeLabels : EmptyText}
          </div>
        </div>

        <div className="item-info">
          <div className="title">PID</div>
          <div className="deskpool-network" title={detail['PID'] || EmptyText}>
            {detail['PID'] ? detail['PID'] : EmptyText}
          </div>
        </div>

        <div className="item-info">
          <div className="title">VID</div>
          <div className="deskpool-network" title={detail['VID'] || EmptyText}>
            {detail['VID'] ? detail['VID'] : EmptyText}
          </div>
        </div>
      </div>
    </Form.Item>
  );
}
