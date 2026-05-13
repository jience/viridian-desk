import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Outlet, useNavigate } from 'react-router';
import './index.scss';
import { Button, Space } from 'antd';
import FormModal from './modalComp/FormModal';

export default function ConfigPage(_props: any) {
  const intl = useIntl();
  const navigate = useNavigate();

  const [chooseTab, setChooseTab] = useState('/configPage/serverSetting');

  const [formModalVisible, setFormModalVisible] = useState(false);

  const [_isUseSecurity, _setIsUseSecurity] = useState(true);
  const [_isPassedSecurity, _setIsPassedSecurity] = useState(false);

  // 页签子页面组件渲染
  // const subPages = React.Children.map(props.children, (child) => {
  //   if (React.isValidElement(child)) {
  //     return React.cloneElement(child, {
  //       goBack,
  //       type: 'configPage',
  //     } as object);
  //   }
  //   return child;
  // });

  // const isCheckedSecurity = useMemo(() => {
  //   if (
  //     !isUseSecurity ||
  //     isPassedSecurity ||
  //     !(localStorage.getItem('isLeaveSetting')
  //       ? localStorage.getItem('isLeaveSetting') === 'true'
  //       : true)
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }, [isUseSecurity, isPassedSecurity]);
  // 表单特征项配置对象
  const [formFeatures, setFormFeatures] = useState([
    {
      key: 'securityPassword',
      name: 'securityPassword',
      label: intl.formatMessage({ id: 'SecurityPassword' }),
      rules: [
        {
          required: true,
          message: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'SecurityPassword' }) },
          ),
        },
      ],
      comType: 'input.password',
      comProps: {
        prefix: '',
        suffix: '',
        placeholder: `请输入${intl.formatMessage({ id: 'SecurityPassword' })}`,
      },
      // alertSlots: [
      //   {
      //     type: 'info',
      //     message: intl.formatMessage({ id: 'SecurityPasswordTip' }),
      //   },
      // ],
    },
  ]);
  const initialValues = {
    securityPassword: '',
  };
  const [defaultFormValues, setDefaultFormValues] = useState(initialValues);

  //otherData
  const tabButtons = useMemo(() => {
    return [
      {
        name: intl.formatMessage({ id: 'Server' }),
        icon: <i className="iconfont icon-net icon-style" />,
        path: '/configPage/serverSetting',
        hidden: false,
      },
      {
        // 通用
        name: intl.formatMessage({ id: 'COMMONSETUP' }),
        icon: <i className="iconfont icon-stencil icon-style" />,
        path: '/configPage/commonSetting',
        hidden: false,
      },
      {
        // 高级
        name: intl.formatMessage({ id: 'Senior' }),
        icon: <i className="iconfont icon-log icon-style" />,
        path: '/configPage/advancedSetting',
        hidden: false,
      },
      {
        // 关于
        name: intl.formatMessage({ id: 'SystemSetting' }),
        icon: <i className="iconfont icon-wrench icon-style" />,
        path: '/configPage/systemSetting',
        hidden: true,
      },
      {
        name: intl.formatMessage({ id: 'ABOUT' }),
        icon: <i className="iconfont icon-info-s icon-style" />,
        path: '/configPage/about',
        hidden: false,
      },
    ].filter((item) => !item.hidden);
  }, [intl]);

  /**
   * @author QL
   * @date 2022-11-03 09:32:01
   * @version V..
   * @description useEffect & useMemo & other
   */
  useEffect(() => {
    // window.ipcRenderer.send(globalAjax.GetDecurityPasswordInfo, {});
    // globalAjax.GetDecurityPasswordInfoRes({
    //   success: (res: any) => {
    //     // console.log('res:',res);
    //     setIsUseSecurity(res.saveSecurityPasswordSwitch === 'Enabled');
    //     if (
    //       res.saveSecurityPasswordSwitch === 'Enabled' &&
    //       (localStorage.getItem('isLeaveSetting')
    //         ? localStorage.getItem('isLeaveSetting') === 'true'
    //         : true)
    //     ) {
    //       setFormModalVisible(true);
    //     }
    //   },
    //   error: (err: any) => {},
    // });
  }, []);

  useEffect(() => {
    // console.log('chooseTab:', chooseTab);
    navigate(chooseTab);
  }, [chooseTab, navigate]);

  /**
   * @author QL
   * @date 2022-11-03 09:33:20
   * @version V..
   * @description other methods
   */
  // 返回登陆页
  const goBack = () => {
    // let backPath = localStorage.getItem('fromUrl') || '';
    // localStorage.setItem('isLeaveSetting', 'true');
    navigate('/login');
  };

  // 更改页签
  const tabChoose = (path: any) => {
    setChooseTab(path);
  };

  // 安全口令弹窗表单 提交方法
  const submitDistributor = (_params: any, _cb: any) => {
    // console.log("提交安全口令：", params);
    // window.ipcRenderer.send(globalAjax.CheckSecurityPassword, { ...params });
    // globalAjax.CheckSecurityPasswordRes({
    //   success: (res: any) => {
    //     // console.log("提交安全口令res：", res);
    //     setIsPassedSecurity(res.result);
    //     if (!res.result) {
    //       // window.messageError({
    //       //   content: intl.formatMessage({
    //       //     id: 'SecurityPasswordNotPassedError',
    //       //   }),
    //       //   style: {
    //       //     marginLeft:
    //       //       history.location.pathname.indexOf('/app') > -1 ? '216px' : 0,
    //       //   },
    //       // });
    //     } else {
    //       setFormModalVisible(false);
    //       localStorage.setItem('isLeaveSetting', 'false');
    //     }
    //     cb();
    //   },
    //   error: (err: any) => {
    //     // console.log("提交安全口令err：", err);
    //     cb();
    //   },
    // });
  };

  /**
   * @author QL
   * @date 2022-11-03 09:31:34
   * @version V..
   * @description VDOM
   */
  return (
    <div className="configPage">
      <div className="exit-button" onClick={goBack}>
        <i className="iconfont icon-signout icon-style" />
        {intl.formatMessage({ id: 'ExitSetting' })}
      </div>

      <div className="configPage-middle">
        <div className="tabBox nav-drag">
          <Space.Compact className="ant-btn-group">
            {tabButtons.map((button: any, index: any) => (
              <Button
                key={index}
                type="text"
                size="large"
                icon={button.icon}
                className={`${chooseTab === button.path ? 'tabActive tab-button' : 'tab-button'}`}
                onClick={() => tabChoose(button.path)}
              >
                {button.name}
              </Button>
            ))}
          </Space.Compact>
        </div>
        <div className="chidBox">
          <Outlet />
        </div>
      </div>

      {/* 表单弹窗 */}
      {formModalVisible && (
        <FormModal
          title={`${intl.formatMessage({ id: 'SecurityPassword' })}`}
          visiable={formModalVisible}
          setVisiable={setFormModalVisible}
          formFeatures={formFeatures}
          setFormFeatures={setFormFeatures}
          defaultFormValues={defaultFormValues}
          setDefaultFormValues={setDefaultFormValues}
          initialValues={initialValues}
          onOkRun={submitDistributor}
          onCancelRun={() => goBack()}
          onKeyupEnter={true} // 是否监听enter事件
        ></FormModal>
      )}
    </div>
  );
}
