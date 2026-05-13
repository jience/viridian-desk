import { Outlet } from 'react-router';
import Sidebar from '@/components/Sidebar';
import './index.scss';
import { GatewaySelect } from '@/components/GatewaySelect';

export const BasicLayout = () => {
  return (
    <div className="basic-layout">
      <div className="app-side">
        <Sidebar></Sidebar>
      </div>
      <div className="app-body-container">
        <div className="app-main">
          <Outlet />
        </div>
        <div className="app-footer">
          <GatewaySelect readonly />
        </div>
      </div>
    </div>
  );
};
