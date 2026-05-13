import { useAppDispatch, useAppSelector } from '@/store';
import { logoutCurrentUser, selectIsLogin } from '@/store/feature/app';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { type FC } from 'react';
import './index.scss';

export interface ControlWindowProps {
  exist?: boolean;
  hiddenMini?: boolean;
  iconClass?: string;
}

const ControlWindow: FC<ControlWindowProps> = (props) => {
  const { exist, hiddenMini } = props;

  const appDispatch = useAppDispatch();
  const isThin = useAppSelector(selectIsThin);
  const isLogin = useAppSelector(selectIsLogin);

  function miniWindow() {
    getCurrentWindow().minimize();
  }

  async function closeWindow() {
    if (isLogin) {
      await appDispatch(logoutCurrentUser(false));
    }
    getCurrentWindow().close();
  }

  return !isThin || exist ? (
    <div className="control-window-content">
      {!hiddenMini && <i tabIndex={1} className="iconfont icon-minus" onClick={miniWindow}></i>}

      <i tabIndex={2} className="iconfont icon-error" onClick={closeWindow}></i>
    </div>
  ) : null;
};

export default ControlWindow;
