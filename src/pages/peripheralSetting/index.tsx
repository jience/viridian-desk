import { useEffect, useMemo, useState } from 'react';
import './index.scss';
import { Empty, Tooltip } from '@/ui';
import IntegratedCard from '@/components/IntegratedCard';
import { deviceTransLocal } from '@/utils/constant';
import { _list_usb_devices } from '@/services/invokeServices';
import { listUsbDevices } from '@/services/invoke/shell';
import type { ListUsbDevicesResp } from '@/services/invoke/shell/types';

export function Component() {
  const [deviceList, setDeviceList] = useState<ListUsbDevicesResp>([]);

  const fetchUsbDeviceList = async () => {
    const resp = await listUsbDevices();
    setDeviceList(resp);
  };

  useEffect(() => {
    fetchUsbDeviceList();
  }, []);

  // 构建卡片组件的标准配置对象
  const cardDataFormat = useMemo(() => {
    const transDeviceType = (typeStr: string) => {
      return typeStr?.split(',').map((val) => {
        return {
          color: 'var(--vd-info-soft-bg)',
          textColor: 'var(--vd-info-soft-text)',
          optIcon: '',
          name: deviceTransLocal[val as keyof typeof deviceTransLocal],
        };
      });
    };

    return deviceList.map((device, index) => {
      return {
        cardType: 'overSize',
        titleConfig: {
          key: device.PID + index,
          mainTitle: <Tooltip title={device.DEVICE_NAME}>{device.DEVICE_NAME}</Tooltip>,
          mainTitle_tags: transDeviceType(device.DEVICE_TYPE),
          subTitle: [
            {
              color: '',
              textColor: '',
              name: `PID:${device.PID} VID:${device.VID}`,
            },
          ],
        },
      };
    });
  }, [deviceList]);

  return (
    <div className="peripheralSetting" key="peripheralSetting">
      {!deviceList.length && <Empty className="centered" />}
      <div className="mainContent">
        {cardDataFormat.map((card: any) => (
          <IntegratedCard
            key={card.titleConfig.key}
            title={card.titleConfig.title}
            type={card.cardType}
            titleConfig={card.titleConfig}
            content={card.content}
          />
        ))}
      </div>
    </div>
  );
}
