import { useCallback, useEffect, useRef, useState } from 'react';
import './index.scss';
import BaseForm from './BaseForm';
import { Modal } from 'antd';

const CreatedModal = (props: any) => {
  const {
    title,
    labelType = 'left',
    visiable,
    setVisiable,
    transitionName = 'ant-zoom-big-fast',

    formFeatures,
    setFormFeatures,
    defaultFormValues,
    setDefaultFormValues,
    initialValues,
    formatMessage,
    onOkRun,
    onCancelRun = () => {},

    closable,
    onKeyupEnter = false,
    createFaultLoading = false,
  } = props;

  const [_isSubmit, setIsSubmit] = useState(false);

  const titleSlot = (
    <div className="titleSlot-box">
      <div className="title">{title}</div>
    </div>
  );

  const formRef = useRef<any>(null);

  // 表单弹窗确定事件
  const formSubmit = useCallback(() => {
    setIsSubmit(true);
    formRef
      ?.current!.submitForm()
      .then((res: any) => {
        const param = {
          ...res,
          description: res?.description?.replace(/\s+/g, ' ').trim(),
        };
        onOkRun(param, () => setIsSubmit(false));
      })
      .catch(() => {
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
      okButtonProps={{ loading: createFaultLoading }}
      centered
      // showCancelButton={showCancelButton}
      closable={closable}
      className={'self_modal'}
      // alertSlots={formFeatures?.[0]?.alertSlots || []}
      cancelText={formatMessage({ id: 'Cancel' })}
    >
      <BaseForm
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

export default CreatedModal;
