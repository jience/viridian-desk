import { useState, useEffect } from 'react';
import { Form, Input, Select, Modal, message } from '@/shared/ui';
import regex from '@/utils/regex';
import './index.scss';
import { useInitData } from '../../model/init-data';
import { useTranslation } from 'react-i18next';
import type { DefaultOptionType } from '@/shared/ui';
import { listResourceUser } from '@/services/api/desktop';
import IconChoose from './IconChoose';
import type { CreateVappReq } from '@/services/api/vapp/types';
import { createVapp } from '@/services/api/vapp';

export interface AddFromSelfModalProps {
  visible: boolean;
  setVisible: (visible?: boolean) => void;
  OnRefresh: () => void;
}

export const AddFromSelfModal = (props: any) => {
  const { visible, setVisible } = props;
  const [form] = Form.useForm<CreateVappReq>();
  const [desktopList, setDesktopList] = useState<DefaultOptionType[]>([]);
  const [createVappLoading, setCreateVappLoading] = useState(false);
  const { appCategoryList } = useInitData();
  const { t } = useTranslation();

  const getDeskList = async (_data = {}) => {
    const res = await listResourceUser({
      pageSize: 99999,
      pageNumber: 1,
      isPublishApp: true,
    });

    const desk: DefaultOptionType[] =
      res.data.results
        ?.filter((val) => val.os.includes('Windows 7'))
        .map((val) => ({
          value: val.id,
          label: val.name,
        })) || [];

    setDesktopList(desk);
    if (desk.length !== 0 && typeof desk[0].value === 'string') {
      form.setFieldsValue({
        desktopId: desk[0].value,
      });
    }
  };

  const submitForm = async () => {
    const res = await form.validateFields();
    setCreateVappLoading(true);
    try {
      await createVapp(res);
      message.success(t('application_page.publish_vapp_success'));
      await Promise.resolve(props.OnRefresh());
      setVisible(false);
    } finally {
      setCreateVappLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      getDeskList();
    }
  }, [visible]);

  return (
    <Modal
      className="add-self-Modal"
      keyboard={false}
      title={t('application_page.publish_application')}
      centered={true}
      open={visible}
      onCancel={() => setVisible()}
      okText={t('application_page.publish')}
      cancelText={t('application_page.cancel')}
      okButtonProps={{
        loading: createVappLoading,
      }}
      onOk={() => submitForm()}
    >
      <Form form={form}>
        <Form.Item
          name="desktopId"
          label={t('application_page.desktop')}
          rules={[
            {
              required: true,
              message: t('application_page.please_select_virtual_desktop'),
            },
          ]}
        >
          <Select
            placeholder={t('application_page.please_select_virtual_desktop')}
            options={desktopList}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label={t('application_page.vapp_name')}
          rules={[
            { required: true },
            {
              pattern: regex.isName,
              message: t('application_page.vapp_name_rule'),
            },
          ]}
        >
          <Input placeholder={t('application_page.vapp_name_placeholder')} />
        </Form.Item>
        <Form.Item name="icon" label={t('application_page.vapp_icon')}>
          <IconChoose />
        </Form.Item>
        <Form.Item
          name="target"
          label={t('application_page.vapp_path')}
          rules={[
            {
              required: true,
              validator: (_rule, value) =>
                new Promise<void>((resolve, reject) => {
                  if (!value) {
                    reject(new Error(t('application_page.vapp_path_placeholder')));
                  }

                  if (!/^[a-zA-Z].+\.(exe|EXE)$/.test(value))
                    reject(new Error(t('application_page.vapp_path_rule')));
                  if (value.includes('"')) reject(new Error(t('application_page.vapp_path_rule')));
                  return resolve();
                }),
            },
          ]}
        >
          <Input maxLength={300} placeholder={t('application_page.vapp_path_placeholder')} />
        </Form.Item>
        <Form.Item
          name="category"
          label={t('application_page.vapp_category')}
          rules={[
            {
              required: true,
              message: t('application_page.vapp_category_placeholder'),
            },
          ]}
        >
          <Select
            placeholder={t('application_page.vapp_category_placeholder')}
            options={appCategoryList}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label={t('application_page.vapp_description')}
          rules={[
            {
              pattern: /^(?!\s+$).{1,50}$/,
              message: t('application_page.vapp_description_rule'),
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder={t('application_page.vapp_description_placeholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
