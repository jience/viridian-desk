import React from 'react';
import './index.scss';

function DeskLoading(props) {
  return (
    <div className="loginLoading-background-mask">
      <div className="loginLoading-mid">
        <i className="iconfont icon-loading"></i>
        <span>自动登录中...</span>
      </div>
    </div>
  );
}

export default DeskLoading;
