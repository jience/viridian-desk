import type { ReactNode } from "react";

export interface DiagnosisData {
  diagnoseTime?: string;
  deviceInfo?: string;
  terminalVersion?: string;
  isConnNet?: string;
  internetRestriction?: ReactNode;
  internetType?: string;
  socketStatusInfo?: ReactNode;
  deviceIP?: string;
  gatewayAddress?: string;
  connTime?: string;
}

export interface DiagnosisItem {
  id: string;
  key: string;
  value: any;
  valueType: 'success' | 'warning';
}

export interface LinColor {
  from: string;
  to: string;
}

export interface InfoRenderItem {
  key: keyof DiagnosisData;
  content: string;
}
