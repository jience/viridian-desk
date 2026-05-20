import { bridge } from '@/native';
import { useAppSelector } from '@/store';
import { selectConnected } from '@/store/feature/gateway';
import { Form, Input, Select } from '@/ui';
import { useEffect, useState, type FocusEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { UsernamePwd, type UsernamePwdProps } from '../../UsernamePwd';
import './index.scss';

export interface DomainFormItemProps extends UsernamePwdProps {}

export const DomainFormItem = (props: DomainFormItemProps) => {
  const { formIns } = props;
  const { t } = useTranslation();

  const connected = useAppSelector(selectConnected);

  const [orgs, setOrgs] = useState<string[]>([]);
  const [listAdLoading, setListAdLoading] = useState(false);

  const getDomain = async (value: string) => {
    setListAdLoading(true);
    const res = await bridge.api.listAd({ name: value }).finally(() => {
      setListAdLoading(false);
    });
    const orgs = res.data.results?.map((it) => it.ou) || [];
    setOrgs(orgs);
    formIns?.setFieldValue('ou', orgs[0]);
  };

  const handleDomainServerNameBlur: FocusEventHandler<HTMLInputElement> = async (e) => {
    const value = e.target.value;
    if (value) {
      await getDomain(value);
    }
  };

  // 初始化时，清空域服务器名称和组织机构
  useEffect(() => {
    if (!formIns) return;
    formIns?.resetFields(['domainServerName']);
    formIns?.resetFields(['ou']);
  }, [formIns]);

  // 当与网关连接成功后，按当前输入重新获取域信息
  useEffect(() => {
    if (!formIns || !connected) return;
    const domainServerName = formIns.getFieldValue('domainServerName');
    if (domainServerName) getDomain(domainServerName);
  }, [connected, formIns]);

  return (
    <>
      <div className="domain-form-item-wrapper">
        <Form.Item
          name="domainServerName"
          className="domain-server-name-item"
          rules={[
            {
              required: true,
              message: t('login_page.domain_required'),
            },
          ]}
        >
          <Input
            placeholder={t('login_page.domain_placeholder')}
            onBlur={handleDomainServerNameBlur}
          />
        </Form.Item>
        <Form.Item
          name="ou"
          className="ou-item"
          rules={[
            {
              required: true,
              message: t('login_page.org_required'),
            },
          ]}
        >
          <Select
            placeholder={t('login_page.org_placeholder')}
            allowClear
            loading={listAdLoading}
            options={orgs.map((it) => ({ label: it, value: it }))}
          />
        </Form.Item>
      </div>
      <UsernamePwd formIns={formIns} />
    </>
  );
};
