import './index.scss';
import { InfoCircleFilled } from '@/ui/icons';
import { Tooltip, Empty } from '@/ui';
import type { ReactNode } from 'react';

export interface InfoItem {
  id: string;
  key: string;
  keyInfo?: string;
  value?: ReactNode;
}

export interface InfoTableProps {
  rows: InfoItem[];
  showEdit?: boolean;
  editOperate?: ReactNode;
}

const InfoTable = (props: InfoTableProps) => {
  const { rows, showEdit = false, editOperate } = props;

  /**
   * @author QL
   * @date 2022-11-17 10:35:49
   * @version V..
   * @description VDOM
   */
  return (
    <div className="info-table">
      {rows && rows.length === 0 ? (
        <Empty />
      ) : (
        rows.map((row) => {
          return (
            <div className="row-item" key={row.id}>
              <div className="key">
                {row.key}
                {row.keyInfo && (
                  <Tooltip title={row.keyInfo}>
                    <InfoCircleFilled className="key-tip-icon" />
                  </Tooltip>
                )}
              </div>
              <div className="value">{row.value || '-'}</div>
            </div>
          );
        })
      )}
      {showEdit && editOperate && <div className="operates-area">{editOperate}</div>}
    </div>
  );
};

export default InfoTable;
