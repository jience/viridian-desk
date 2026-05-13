import { FaultStatus, FaultType, type FaultListRequest } from '@/services/api/fault/types';
import type { SelectProps } from 'antd';
import { useIntl } from 'react-intl';

export const initQueryParams: FaultListRequest = {
  sortKey: 'createTime',
  sortOrder: 'Desc',
  pageNumber: 1,
  pageSize: 7,
};

export const useFaultStatus = () => {
  const intl = useIntl();

  const options: SelectProps['options'] = [
    {
      label: intl.formatMessage({ id: 'AllStatus' }),
      value: 'all',
    },
    {
      label: intl.formatMessage({ id: 'Pending' }),
      value: FaultStatus.UNRESOLVED,
    },
    {
      label: intl.formatMessage({ id: 'Solved' }),
      value: FaultStatus.SOLVED,
    },
    {
      label: intl.formatMessage({ id: 'Rejected' }),
      value: FaultStatus.REJECT,
    },
    {
      label: intl.formatMessage({ id: 'Withdrawn' }),
      value: FaultStatus.REVOKE,
    },
  ];

  const faultStatusKv: Record<FaultStatus, string> = {
    [FaultStatus.UNRESOLVED]: intl.formatMessage({ id: 'Pending' }),
    [FaultStatus.SOLVED]: intl.formatMessage({ id: 'Solved' }),
    [FaultStatus.REJECT]: intl.formatMessage({ id: 'Rejected' }),
    [FaultStatus.REVOKE]: intl.formatMessage({ id: 'Withdrawn' }),
  };

  const faultStatusStatusKv: Record<FaultStatus, string> = {
    [FaultStatus.UNRESOLVED]: 'processing',
    [FaultStatus.SOLVED]: 'success',
    [FaultStatus.REJECT]: 'warning',
    [FaultStatus.REVOKE]: 'error',
  };

  return { options, faultStatusKv, faultStatusStatusKv };
};

export const useFaultType = () => {
  const intl = useIntl();

  const options: SelectProps['options'] = [
    {
      label: intl.formatMessage({ id: 'AllTypes' }),
      value: 'all',
    },
    {
      label: intl.formatMessage({ id: 'DesktopIssues' }),
      value: FaultType.DESKTOP,
    },
    {
      label: intl.formatMessage({ id: 'TerminalIssues' }),
      value: FaultType.TERMINAL,
    },
    {
      label: intl.formatMessage({ id: 'OtherIssues' }),
      value: FaultType.OTHER,
    },
  ];

  const faultTypeKv: Record<FaultType, string> = {
    [FaultType.DESKTOP]: intl.formatMessage({ id: 'DesktopIssues' }),
    [FaultType.TERMINAL]: intl.formatMessage({ id: 'TerminalIssues' }),
    [FaultType.OTHER]: intl.formatMessage({ id: 'OtherIssues' }),
  };

  return { options, faultTypeKv };
};
