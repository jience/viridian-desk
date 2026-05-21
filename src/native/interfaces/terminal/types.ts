export interface GetClientAboutResp {
  clientId: string;
  clientName: string;
  clientVersion: string;
  clientType: string;
  license: string;
  copyright: string;
  buildId: string;
  sku?: string;
}

export interface GetClientConfigResp {
  logo: string;
  logoWhite: string;
  license: string;
  clientIconPng: string;
  clientIconIco: string;
  companyName: string;
  isUpdate: string;
  copyright: string;
  clientPrefix: string;
  timeout: string;
  clientTheme: string;
  deskToolbar: string;
  deskToolbarPosition: string;
  companyPhone: string;
  companyEmail: string;
  gatewayAddrShowSwitch: string;
  displayVersion: string;
  backgroundImage: string;
  publicityImage: string;
  floatBall: string;
  securityPassword: string;
  securityPasswordSwitch: string;
}

export interface GetTerminalInfoResp {
  id: string;
  osType: string;
  platform: string;
  platformCode: string;
  versionCode: string;
  versionName: string;
  // 考虑删除
  clientIp: string;
  cpuInfo: string;
  mac: string;
  memInfo: number;
  clientType: string;
  clientOsVersion: string;
  isThin: boolean;
  sku?: string;
}
