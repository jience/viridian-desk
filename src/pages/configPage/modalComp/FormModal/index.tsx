import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import './index.scss';
import ConfigurationForm from '@/components/ConfigurationForm';
import { Modal } from '@/ui';
import { isEmpty } from 'lodash-es';

export interface modelProps {
  title: string;
  labelType?: string;
  visiable: boolean;
  setVisiable: any;
  transitionName: string;

  formFeatures: object; // 表单项配置对象
  setFormFeatures: any; // 表单项配置对象的setting
  defaultFormValues: object; // 表单默认值的配置对象
  setDefaultFormValues: any; // 表单默认值配置对象的setting
  initialValues: any;

  onOkRun: any;
}

const FormModal = (props: any) => {
  const {
    title,
    labelType = 'default',
    visiable,
    setVisiable,
    transitionName = 'ant-zoom-big-fast',

    formFeatures,
    setFormFeatures,
    defaultFormValues,
    setDefaultFormValues,
    initialValues,

    onOkRun,
    onCancelRun = () => {},

    closable,
    onKeyupEnter = false,
  } = props;
  const intl = useIntl();
  const [isSubmit, setIsSubmit] = useState(false);

  const titleSlot = (
    <div className="titleSlot-box">
      <div className="title">{title}</div>
    </div>
  );

  const formRef = useRef<any>(null);

  // 表单弹窗确定事件
  const formSubmit = useCallback(() => {
    formRef
      ?.current!.submitForm()
      .then((res: any) => {
        setIsSubmit(true);
        onOkRun(res, () => setIsSubmit(false));
      })
      .catch((_err: any) => {
        setIsSubmit(false);
      });
  }, [onOkRun]);

  const mointerEnterFunc = useCallback(
    (e: any) => {
      if (window.event) {
        e = window.event;
      }
      const code = e?.charCode || e?.keyCode;
      if (code == 13) {
        formSubmit();
      }
    },
    [formSubmit],
  );

  useEffect(() => {
    if (onKeyupEnter) {
      document.body.addEventListener('keyup', mointerEnterFunc);
    }
    return () => {
      document.body.removeEventListener('keyup', mointerEnterFunc);
    };
  }, [mointerEnterFunc, onKeyupEnter]);

  const allDisabled = useMemo(() => {
    if (isEmpty(formFeatures)) {
      return true;
    } else {
      return formFeatures.every((item: any) => item.comProps.disabled);
    }
  }, [formFeatures]);

  return (
    <Modal
      title={titleSlot}
      open={visiable}
      keyboard={false}
      transitionName={transitionName}
      onCancel={() => {
        setVisiable(false);
        setIsSubmit(false);
        onCancelRun();
      }}
      afterClose={() => {
        formRef?.current!.resetForm();
      }}
      onOk={formSubmit}
      okButtonProps={{ disabled: isSubmit || allDisabled }}
      centered
      closable={closable}
      className={'self_modal'}
      width={'50%'}
      // alertSlots={formFeatures?.[0]?.alertSlots || []}
      cancelText={intl.formatMessage({ id: 'Cancel' })}
      okText={intl.formatMessage({ id: 'Ok' })}
    >
      <ConfigurationForm
        ref={formRef}
        labelType={labelType}
        formFeatures={formFeatures}
        setFormFeatures={setFormFeatures}
        defaultFormValues={defaultFormValues}
        setDefaultFormValues={setDefaultFormValues}
        initialValues={initialValues}
      />
    </Modal>
  );
};

export default FormModal;
