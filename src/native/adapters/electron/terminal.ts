import type {
  GetClientAboutResp,
  GetClientConfigResp,
  GetTerminalInfoResp,
  ITerminalModule,
} from '@/native/interfaces/terminal';
import type { NativeResponse } from '@/native/interfaces/types';
import { success } from '@/native/utils';

export const terminal_module: ITerminalModule = {
  getClientAbout: async function (): Promise<NativeResponse<GetClientAboutResp>> {
    return success({
      buildId: 'electron_test_build_id',
      clientId: 'electron_test_client_id',
      clientName: 'Electron Test Client',
      clientType: 'electron-desktop',
      clientVersion: '1.0.0',
      copyright: '© 2024 Test Company',
      license: 'Test License',
    });
  },
  getClientConfig: async function (): Promise<NativeResponse<GetClientConfigResp>> {
    return success({
      backgroundImage: '',
      clientIconIco: '',
      clientIconPng: '',
      clientPrefix: 'test_prefix',
      clientTheme: 'light',
      companyEmail: '',
      companyName: 'Test Company',
      companyPhone: '',
      copyright: '© 2024 Test Company',
      deskToolbar: 'default',
      deskToolbarPosition: 'top',
      displayVersion: '1.0.0',
      gatewayAddrShowSwitch: '1',
      isUpdate: '0',
      license: 'Test License',
      logo: '',
      logoWhite: '',
      terminalRememberPasswordSwitch: 'Enabled',
      timeout: '30',
      loginTypes: 'password,otp',
      firstLoginResetPasswordSwitch: 'Disabled',
      floatBall: 'Disabled',
      oneTimePasswordSwitch: 'Disabled',
      publicityImage: '',
      securityPassword: '',
      securityPasswordSwitch: 'Disabled',
      smsResetPasswordSwitch: 'Disabled',
      terminalGraphAuthenticationSwitch: 'Disabled',
      terminalLoginErrorTimes: '5',
      terminalLoginMeteringMinute: '15',
      terminalMultiFactorAuthenticationSwitch: 'Disabled',
      terminalPasswordRemainingValidity: '90',
      terminalPasswordValidDays: '180',
      terminalStrongPasswordSwitch: 'Enabled',
      warnLoginFromDifferentLocationSwitch: 'Disabled',
    });
  },
  getTerminalInfo: async function (): Promise<NativeResponse<GetTerminalInfoResp>> {
    return success({
      clientIp: '',
      clientOsVersion: 'Windows 10',
      clientTerminalModel: 'Electron Test Terminal',
      clientVersion: '1.0.0',
      clientType: 'electron-desktop',
      cpuInfo: 'Intel Core i7',
      memoryInfo: '16GB',
      id: 'electron_test_terminal_id',
      isThin: false,
      mac: '00:1A:2B:3C:4D:5E',
      osType: 'Windows',
      platform: 'x64',
      platformCode: 'electron_x64',
      versionCode: '100',
      versionName: '1.0.0',
      memInfo: 16384,
      sku: 'TEST-SKU-001',
    });
  },
};
