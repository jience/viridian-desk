import type { ThemeConfig } from 'antd';

// 基础主题配置
const baseTheme: ThemeConfig = {
  token: {
    motion: false,
    colorPrimary: '#2491FF',
    borderRadius: 4,
    fontFamily: 'SourceHanSansSC-Regular',
  },
  components: {
    Radio: {
      colorPrimary: '#2491FF',
      colorPrimaryHover: '#64AFFA',
      colorPrimaryActive: '#4690DB',
      fontSize: 12,
      controlHeight: 28,
    },
    Form: {
      fontSize: 12,
      itemMarginBottom: 20,
    },
  },
};

// 浅色主题特有配置
const lightThemeComponents: ThemeConfig['components'] = {
  Table: {
    headerBg: '#F5F8FA',
    borderColor: '#DFE3EB',
    cellPaddingBlockMD: 8,
    cellPaddingInlineMD: 16,
    headerColor: '#33475B',
    fontWeightStrong: 400,
  },
  Button: {
    paddingInline: 16,
    paddingInlineSM: 12,
    contentFontSizeSM: 12,
    defaultHoverBg: '#F5F8FA',
    defaultHoverBorderColor: '#CBD6E2',
    defaultHoverColor: '#516F90',
    defaultColor: '#516F90',
    defaultActiveBg: '#F5F8FA',
    defaultActiveBorderColor: '#CBD6E2',
    defaultActiveColor: '#516F90',
    colorPrimaryBgHover: '#64AFFA',
    colorPrimaryActive: '#4690DB',
    controlHeight: 28,
    controlHeightLG: 32,
    contentFontSize: 12,
    contentLineHeightSM: 12,
    contentFontSizeLG: 14,
    colorTextDisabled: '#B0C1D4',
    borderColorDisabled: 'transparent',
    colorBgContainerDisabled: '#EAF0F6',
    textTextColor: '#4C8CCA',
    textTextHoverColor: '#4C8CCA',
    textHoverBg: 'transparent',
  },
  Input: {
    colorBorder: '#C9DAE5',
    colorTextPlaceholder: '#B0C1D4',
    fontSize: 12,
    paddingInline: 10,
    paddingBlock: 4,
    lineHeight: 22 / 12,
  },
  Select: {
    colorBorder: '#C9DAE5',
    colorTextPlaceholder: '#B0C1D4',
    fontSize: 12,
  },
  Dropdown: {
    fontSize: 12,
  },
  InputNumber: {
    colorBorder: '#C9DAE5',
    colorTextPlaceholder: '#B0C1D4',
    fontSize: 12,
  },
  Tooltip: {
    colorBgSpotlight: '#516F90',
  },
};

// 暗色主题特有配置
const darkThemeComponents: ThemeConfig['components'] = {
  Table: {
    headerBg: '#656A99',
    borderColor: '#7075a2',
    cellPaddingBlockMD: 8,
    cellPaddingInlineMD: 16,
    headerColor: '#fff',
    fontWeightStrong: 400,
    colorBgContainer: '#555C84',
    colorText: '#fff',
  },
  Empty: {
    colorTextDescription: '#fff',
  },
  Button: {
    paddingInline: 16,
    paddingInlineSM: 12,
    contentFontSizeSM: 12,
    defaultBg: '#696D9D',
    defaultBorderColor: '#9094B9',
    defaultHoverBg: '#696d9d',
    defaultHoverBorderColor: '#CBD6E2',
    defaultHoverColor: '#ffffff',
    defaultColor: '#9AA6B7',
    defaultActiveBg: '#696d9d',
    defaultActiveBorderColor: '#CBD6E2',
    defaultActiveColor: '#ffffff',
    colorPrimaryBgHover: '#64AFFA',
    colorPrimaryActive: '#4690DB',
    controlHeight: 28,
    controlHeightLG: 32,
    contentFontSize: 12,
    contentLineHeightSM: 12,
    contentFontSizeLG: 14,
    colorTextDisabled: '#5C6B7D',
    borderColorDisabled: 'transparent',
    colorBgContainerDisabled: '#2A2D3A',
    textTextColor: '#C9CDD4',
    textTextHoverColor: '#64AFFA',
    textHoverBg: 'transparent',
  },
  Input: {
    colorBorder: '#9094B9',
    colorTextPlaceholder: '#fff',
    colorBgContainer: 'rgba(105,109,157,0.20)',
    colorText: '#fff',
    fontSize: 12,
    paddingInline: 10,
    paddingBlock: 4,
    lineHeight: 22 / 12,
  },
  Select: {
    colorBorder: '#9094B9',
    colorTextPlaceholder: '#fff',
    colorBgElevated: 'rgba(105, 109, 157)',
    selectorBg: '#555c84',
    optionSelectedBg: '#696d9d',
    colorText: '#fff',
    fontSize: 12,
    lineHeight: 22 / 12,
  },
  Dropdown: {
    colorBgElevated: 'rgba(105, 109, 157)',
    colorText: '#fff',
    fontSize: 12,
  },
  InputNumber: {
    colorBorder: '#9094B9',
    colorTextPlaceholder: '#fff',
    colorBgContainer: 'rgba(105,109,157,0.20)',
    colorText: '#fff',
    fontSize: 12,
  },
  Tooltip: {
    colorBgSpotlight: '#F5F8FA',
    colorTextLightSolid: '#5E6AB8',
    fontSize: 12,
  },
  Form: {
    colorBgContainer: 'rgba(105,109,157,0.20)',
    fontSize: 12,
    labelColor: '#fff',
  },
};

export const lightAntdTheme: ThemeConfig = {
  ...baseTheme,
  components: {
    ...baseTheme.components,
    ...lightThemeComponents,
  },
};

export const darkAntdTheme: ThemeConfig = {
  ...baseTheme,
  components: {
    ...baseTheme.components,
    ...darkThemeComponents,
  },
};
