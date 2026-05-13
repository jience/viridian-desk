import { bridge } from '@/native';
import { useAppSelector } from '@/store';
import { selectLastLoginEntry } from '@/store/feature/app';
import { selectConnected } from '@/store/feature/gateway';
import { Form, Input, Select } from 'antd';
import { useEffect, useState, type FocusEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { UsernamePwd, type UsernamePwdProps } from '../../UsernamePwd';
import './index.scss';

export interface DomainFormItemProps extends UsernamePwdProps {}

export const DomainFormItem = (props: DomainFormItemProps) => {
  const { formIns } = props;
  const { t } = useTranslation();

  const connected = useAppSelector(selectConnected);
  const lastLoginInfo = useAppSelector(selectLastLoginEntry);

  const [orgs, setOrgs] = useState<string[]>([]);
  const [listAdLoading, setListAdLoading] = useState(false);

  const getDomain = async (value: string) => {
    setListAdLoading(true);
    const res = await bridge.api.listAd({ name: value }).finally(() => {
      setListAdLoading(false);
    });
    const orgs = res.data.results?.map((it) => it.ou) || [];
    setOrgs(orgs);
    const { ou, domainServerName } = lastLoginInfo || {};
    // 如果上次登录的域服务器和组织机构在当前列表中，则默认选中
    if (domainServerName === value && ou && orgs.includes(ou)) {
      formIns?.setFieldValue('ou', ou);
    } else {
      formIns?.setFieldValue('ou', orgs[0]);
    }
  };

  const handleDomainServerNameBlur: FocusEventHandler<HTMLInputElement> = async (e) => {
    const value = e.target.value;
    if (value) {
      await getDomain(value);
    }
  };

  // 初始化时，设置域服务器名称和组织机构
  useEffect(() => {
    if (!formIns) return;
    formIns?.resetFields(['domainServerName']);
    formIns?.resetFields(['ou']);
    const { domainServerName } = lastLoginInfo || {};
    if (domainServerName) formIns.setFieldValue('domainServerName', domainServerName);
  }, [formIns]);

  // 当与网关连接成功后，获取重新域信息
  useEffect(() => {
    if (!formIns || !connected) return;
    const { domainServerName } = lastLoginInfo || {};
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
