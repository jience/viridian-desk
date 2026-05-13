import { useMemo, type FC } from 'react';
import { useNavigate } from 'react-router';
import { Tooltip, Modal } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import './index.scss';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { selectDeveloperMode, selectIntegration } from '@/store/feature/config';
import { selectMsgDot, setMsgDot, setMsgModalShow } from '@/store/feature/app';
import { useTranslation } from 'react-i18next';
import { GatewaySelect } from '../GatewaySelect';
import { bridge } from '@/native';

const Footer: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();

  const dispatch = useAppDispatch();

  const isThin = useAppSelector(selectIsThin);

  const developerMode = useAppSelector(selectDeveloperMode);

  const isIntegratedMode = useAppSelector(selectIntegration);
  const msgDot = useAppSelector(selectMsgDot);

  const shutdown = async () => {
    const confirmed = await modal.confirm({
      title: t('common.warning'),
      content: t('common.warning_shutdown_msg'),
    });
    if (confirmed) {
      await bridge.cmd.shutdownLocalDevice();
    }
  };

  const leftOptionButton = useMemo(() => {
    return [
      {
        key: 'setting',
        zh_cn_tip: t('login_page.setting'),
        icon: <i className="iconfont icon-setting client-button" />,
        callBack: () => {
          navigate('/configPage/serverSetting');
        },
        hidden: false,
      },
      {
        key: 'network',
        zh_cn_tip: t('login_page.network'),
        icon: <i className="iconfont icon-net client-button" />,
        callBack: () => {
          console.log('触发网络设置');
          invoke('open_network_settings');
        },
        hidden: !isIntegratedMode,
      },
      {
        key: 'msg',
        zh_cn_tip: t('login_page.message_announcement'),
        icon: <i className="iconfont icon-message client-button" />,
        callBack: () => {
          dispatch(setMsgDot(false));
          dispatch(
            setMsgModalShow({
              msgModalShow: true,
              msgId: '',
            }),
          );
        },
        hidden: false,
      },
      {
        key: 'question',
        zh_cn_tip: t('login_page.help_document'),
        icon: <i className="iconfont icon-c_question-s client-button" />,
        callBack: () => {
          invoke('open_docs');
        },
        hidden: false,
      },
      {
        key: 'shatDown',
        zh_cn_tip: t('login_page.shutdown'),
        icon: <i className="iconfont icon-power-off-filled client-button" />,
        callBack: shutdown,
        // 非一体化隐藏
        hidden: !isIntegratedMode && !isThin,
      },
    ].filter((item: any) => !item.hidden);
  }, [isIntegratedMode, isThin, navigate, dispatch]);

  return (
    <div className="footer-content">
      <div className="login-footer-content">
        <div className="footer-left">
          {/* 跳转到设置页 */}
          {leftOptionButton.map((i: any) => {
            return (
              <div
                key={i.key}
                className={`option-button ${i.key === 'msg' && msgDot && 'msgdot'}`}
                onClick={() => i.callBack()}
              >
                <Tooltip
                  className={i?.name ? 'haveName' : ''}
                  placement="top"
                  title={i.zh_cn_tip}
                  arrow={false}
                >
                  {i.icon}
                  <span className="opt-name">{i?.name}</span>
                </Tooltip>
              </div>
            );
          })}
          {/* 开发者模式 */}
          {developerMode && (
            <div className="develop-mode">
              <i className="iconfont icon-ConfigMap" />
              <span>{t('login_page.developer_mode_enabled')}</span>
            </div>
          )}
        </div>
        <div className="footer-right">
          <GatewaySelect />
        </div>
      </div>
      <>{contextHolder}</>
    </div>
  );
};

export default Footer;
