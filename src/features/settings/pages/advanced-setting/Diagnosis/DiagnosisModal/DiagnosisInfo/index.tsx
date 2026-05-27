import { useEffect, useMemo, useRef, type FC } from 'react';
import './index.scss';

import type { DiagnosisData } from './types';
import { useInitData } from './initData';

interface DiagnosisInfoProps {
  diagnosing: boolean;
  info: DiagnosisData;
  pingContent: string;
}

export const DiagnosisInfo: FC<DiagnosisInfoProps> = (props) => {
  const { info, pingContent } = props;

  const { renderNetworkInfo } = useInitData();

  const resultRef = useRef<any>(null);

  useEffect(() => {
    // 自动滚动到底部
    const current = resultRef?.current;
    if (current) {
      //scrollHeight是页面的高度
      current.scrollTop = current?.scrollHeight;
    }
  }, [pingContent]);

  const renderPingContent = useMemo(() => {
    return <pre>{pingContent}</pre>;
  }, [pingContent]);

  return (
    <div className="diagnosisInfo">
      <div className="diagnosisInfo-content" ref={resultRef}>
        {renderNetworkInfo.map((infoRow) => {
          return (
            <div className="diagnosisInfo-content-row" key={infoRow.key}>
              <div className="diagnosisInfo-content-row-key">{infoRow.content}</div>
              <div className="diagnosisInfo-content-row-val" title={info[infoRow.key] + ''}>
                {info[infoRow.key]}
              </div>
            </div>
          );
        })}
        {renderPingContent}
      </div>
    </div>
  );
};
