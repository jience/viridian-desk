import * as WwLoginNew from '@/assets/js/wwLogin-1.2.7';
import { bridge } from '@/native';
import { Modal } from 'antd';
import { useEffect, useImperativeHandle, useRef, useState, type FC, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';
import type { OrgScanLoginModalShowOpt, WxConfig } from './types';

export interface OrgScanLoginModalRef {
  show: (opt: OrgScanLoginModalShowOpt) => Promise<void>;
}

export interface OrgScanLoginModalProps {
  ref?: Ref<OrgScanLoginModalRef>;
}

export const OrgScanLoginModal: FC<OrgScanLoginModalProps> = (props) => {
  const { ref } = props;
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [threeChannel, setThreeChannel] = useState('');
  const [corpId, setCorpId] = useState('');

  const wxObjRef = useRef<{ destroyed: () => void } | null>(null);
  const promiseHandlesRef = useRef<{
    resolve: () => void;
    reject: (reason?: any) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    show: (values) => {
      setVisible(true);
      setThreeChannel(values.threeChannel);
      setCorpId(values.corpId);
      return new Promise<void>((resolve, reject) => {
        promiseHandlesRef.current = { resolve, reject };
      });
    },
  }));

  const handleCancel = () => {
    setVisible(false);
    promiseHandlesRef.current?.reject(); // 用户取消，reject Promise
  };

  const afterClose = () => {
    wxObjRef.current?.destroyed();
  };

  const fetchQrCodeUrl = async (id: string) => {
    const { data } = await bridge.api.getQrCodeUrl({ id });
    const res = data.data;
    const config: WxConfig = {
      id: 'wb',
      appid: res.corpId,
      agentid: res.appId,
      redirect_uri: res.redirectUrl,
      state: res.state,
      href: 'data:text/css;base64,Ly8g6Ieq5a6a5LmJ5LqM57u056CB5qC35byPCi5pbXBvd2VyQm94IC50aXRsZSB7CiBkaXNwbGF5OiBub25lOwp9Ci5pbXBvd2VyQm94IC5pbmZvewogZGlzcGxheTogbm9uZQp9Ci5pbXBvd2VyQm94IC5zdGF0dXMuc3RhdHVzX2Jyb3dzZXIgewogZGlzcGxheTogbm9uZTsKfQouaW1wb3dlckJveCAucGFuZWxDb250ZW50IHsKIHdpZHRoOiAxNjBweDsKIG1hcmdpbjogYXV0bzsKfQouaW1wb3dlckJveCAucXJjb2RlIHsKIGJvcmRlcjogbm9uZTsKIHdpZHRoOiAxNjBweDsKfQo=',
      lang: 'zh',
      self_redirect: true,
    };
    /** @ts-ignore */
    wxObjRef.current = new WwLoginNew(config);
  };

  useEffect(() => {
    if (visible && corpId) {
      fetchQrCodeUrl(corpId);
    }
  }, [visible, corpId]);

  return (
    <Modal
      open={visible}
      keyboard={true}
      className="scan-modal"
      onCancel={handleCancel}
      footer={null}
      title={t('login_page.scan_login_modal.title', { channel: threeChannel })}
      centered={true}
      afterClose={afterClose}
    >
      <div className="scan-code-content" id="wb"></div>
      <p className="login-tip">{t('login_page.scan_login_modal.tip', { channel: threeChannel })}</p>
    </Modal>
  );
};
