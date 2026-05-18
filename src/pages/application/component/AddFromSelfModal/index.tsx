import { useState, useEffect } from 'react';
import { Form, Input, Select, Modal, message } from '@/ui';
import regex from '@/utils/regex';
import './index.scss';
import { useInitData } from '../../initData';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store';
import { selectLanguage } from '@/store/feature/config';
import type { DefaultOptionType } from '@/ui';
import { listResourceUser } from '@/services/api/desktop';
import IconChoose from './IconChoose';
import type { CreateVappReq } from '@/services/api/vapp/types';
import { createVapp, VappApi } from '@/services/api/vapp';
import { useLoading } from '@/hooks/useLoading';
import { LanguageType } from '@/native/interfaces/config';

export interface AddFromSelfModalProps {
  visible: boolean;
  setVisible: (visible?: boolean) => void;
  OnRefresh: () => void;
}

export const AddFromSelfModal = (props: any) => {
  const { visible, setVisible } = props;
  const [form] = Form.useForm<CreateVappReq>();
  const [desktopList, setDesktopList] = useState<DefaultOptionType[]>([]);
  const createVappLoading = useLoading(VappApi.CREATE_VAPP);
  const { appCategoryList } = useInitData();
  const { t } = useTranslation();
  const language = useAppSelector(selectLanguage);

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
    await createVapp(res);
    message.success(t('application_page.publish_vapp_success'));
    props.OnRefresh();
    setVisible(false);
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
      destroyOnHidden
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
      <Form form={form} labelCol={language === LanguageType.EN_US ? { span: 7 } : { span: 4 }}>
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
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
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
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
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
