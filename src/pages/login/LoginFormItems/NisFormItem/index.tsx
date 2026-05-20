import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { UsernamePwd, type UsernamePwdProps } from '../../UsernamePwd';
import { Form, Select } from '@/ui';
import { selectConnected } from '@/store/feature/gateway';
import { bridge } from '@/native';
import type { NisServer } from '@/native/interfaces/api';
import { useTranslation } from 'react-i18next';

export interface NisFormItemProps extends UsernamePwdProps {}

export const NisFormItem = (props: NisFormItemProps) => {
  const { formIns } = props;
  const { t } = useTranslation();
  const connected = useAppSelector(selectConnected);

  const [listNisServerLoading, setListNisServerLoading] = useState(false);
  const [nisServerList, setNisServerList] = useState<NisServer[]>([]);

  const nisServerOption = nisServerList.map((item) => {
    return { label: item.domain, value: item.id };
  });

  const getNisIpList = async () => {
    setListNisServerLoading(true);

    const { data } = await bridge.api.nis
      .listNisServer({ pageNumber: 1, pageSize: 20 })
      .finally(() => {
        setListNisServerLoading(false);
      });
    const { results = [] } = data;

    if (results.length) {
      formIns?.setFieldValue('nisId', results[0].id);
    }
    setNisServerList(results);
  };

  useEffect(() => {
    if (!formIns || !connected) return;
    getNisIpList();
  }, [formIns, connected]);

  return (
    <>
      <Form.Item
        name="nisId"
        rules={[
          {
            required: true,
            message: t('login_page.nis_required'),
          },
        ]}
      >
        <Select
          options={nisServerOption}
          allowClear
          placeholder={t('login_page.nis_placeholder')}
          loading={listNisServerLoading}
        />
      </Form.Item>

      <UsernamePwd formIns={formIns} />
    </>
  );
};
