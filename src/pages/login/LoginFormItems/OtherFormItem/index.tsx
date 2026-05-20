import { useEffect, useState } from 'react';
import { UsernamePwd, type UsernamePwdProps } from '../../UsernamePwd';
import { Form, Select } from '@/ui';
import type { CorpItem } from '@/native/interfaces/api';
import { bridge } from '@/native';
import { useAppSelector } from '@/store';
import { selectConnected } from '@/store/feature/gateway';
import { useTranslation } from 'react-i18next';

export interface OtherFormItemProps extends UsernamePwdProps {
  setThreeChannel: (value: string) => void;
}

export const OtherFormItem = (props: OtherFormItemProps) => {
  const { formIns, setThreeChannel } = props;
  const { t } = useTranslation();

  const connected = useAppSelector(selectConnected);

  const [cropListLoading, setCropListLoading] = useState(false);
  const [corpList, setCorpList] = useState<CorpItem[]>([]);

  const corpListOption = corpList.map((item) => {
    return { label: item.name, value: item.id };
  });

  const fetchCorpList = async () => {
    setCropListLoading(true);
    const { data } = await bridge.api.listCorp({ pageNumber: 1, pageSize: 20 }).finally(() => {
      setCropListLoading(false);
    });
    const filteredCorpList = data.results?.filter((i) => i?.type == 'wechat') || [];

    if (filteredCorpList.length) {
      formIns?.setFieldValue('corpId', filteredCorpList[0].id);
    }
    setCorpList(filteredCorpList);
    setThreeChannel('wechat');
  };

  useEffect(() => {
    if (!formIns || !connected) return;
    fetchCorpList();
  }, [formIns, connected]);

  return (
    <>
      <Form.Item
        name="corpId"
        rules={[
          {
            required: true,
            message: t('login_page.corp_required'),
          },
        ]}
      >
        <Select
          placeholder={t('login_page.corp_placeholder')}
          loading={cropListLoading}
          allowClear
          options={corpListOption}
        />
      </Form.Item>

      <UsernamePwd formIns={formIns} />
    </>
  );
};
