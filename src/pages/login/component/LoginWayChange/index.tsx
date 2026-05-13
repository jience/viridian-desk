import type { LoginAuthType } from '@/native/interfaces/login_history';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectCurrentLoginType, setCurrentLoginType } from '@/store/feature/app';
import { selectLoginTypes } from '@/store/feature/client';
import { Divider } from 'antd';
import { useMemo, type FC } from 'react';
import './index.scss';
import { useLoginWay } from './initData';

export interface LoginWayChangeProps {
  onChange: (way: LoginAuthType) => void;
}

const LoginWayChange: FC<LoginWayChangeProps> = (props) => {
  const { onChange } = props;
  const loginTypes = useAppSelector(selectLoginTypes);
  const currentLoginType = useAppSelector(selectCurrentLoginType);
  const appDispatch = useAppDispatch();

  const { loginWays } = useLoginWay();

  const changeLoginWay = (key: LoginAuthType) => {
    appDispatch(setCurrentLoginType(key));
    onChange(key);
  };

  const renderLoginWay: any = useMemo(() => {
    let ways: any = [];
    if (loginTypes) {
      ways = loginWays.filter((em: any) => loginTypes.includes(em?.key));
      if (ways.length === 0) {
        ways.push(loginWays[0]);
      }
      return ways.map((i: any) => {
        return (
          <li
            key={i.key}
            onClick={() => {
              changeLoginWay(i.key);
            }}
            className={currentLoginType === i.key ? 'on' : ''}
          >
            <div className="left-icon">
              <i className={`iconfont ${i.iconType}`} />
            </div>
            <Divider orientation="vertical" />
            <p>{i.name}</p>
            <div className="right-icon">
              <i className="iconfont minus icon-minus"></i>
              <i className="iconfont right icon-right"></i>
            </div>
          </li>
        );
      });
    }
  }, [loginTypes, loginWays, currentLoginType]);

  return (
    <div className="login-way-change">
      <ul>{renderLoginWay}</ul>
    </div>
  );
};

export default LoginWayChange;
