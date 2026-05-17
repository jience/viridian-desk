import type { ThemeConfig } from 'antd';

// 基础主题配置
const baseTheme: ThemeConfig = {
  token: {
    motion: false,
    colorPrimary: '#4D7C3F',
    borderRadius: 4,
    fontFamily: 'SourceHanSansSC-Regular',
  },
  components: {
    Radio: {
      colorPrimary: '#4D7C3F',
      colorPrimaryHover: '#5F9350',
      colorPrimaryActive: '#315F2D',
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
    headerBg: '#EEE8DC',
    borderColor: 'rgba(82, 72, 52, 0.16)',
    cellPaddingBlockMD: 8,
    cellPaddingInlineMD: 16,
    headerColor: '#20231E',
    fontWeightStrong: 400,
  },
  Button: {
    paddingInline: 16,
    paddingInlineSM: 12,
    contentFontSizeSM: 12,
    defaultHoverBg: '#EEE8DC',
    defaultHoverBorderColor: 'rgba(82, 72, 52, 0.24)',
    defaultHoverColor: '#20231E',
    defaultColor: '#6C7268',
    defaultActiveBg: '#E5DDCE',
    defaultActiveBorderColor: 'rgba(82, 72, 52, 0.24)',
    defaultActiveColor: '#20231E',
    colorPrimaryBgHover: '#5F9350',
    colorPrimaryActive: '#315F2D',
    controlHeight: 28,
    controlHeightLG: 32,
    contentFontSize: 12,
    contentLineHeightSM: 12,
    contentFontSizeLG: 14,
    colorTextDisabled: '#A9A99D',
    borderColorDisabled: 'transparent',
    colorBgContainerDisabled: '#EEE8DC',
    textTextColor: '#4D7C3F',
    textTextHoverColor: '#315F2D',
    textHoverBg: 'transparent',
  },
  Input: {
    colorBorder: 'rgba(82, 72, 52, 0.2)',
    colorTextPlaceholder: '#8A9187',
    fontSize: 12,
    paddingInline: 10,
    paddingBlock: 4,
    lineHeight: 22 / 12,
  },
  Select: {
    colorBorder: 'rgba(82, 72, 52, 0.2)',
    colorTextPlaceholder: '#8A9187',
    fontSize: 12,
  },
  Dropdown: {
    fontSize: 12,
  },
  InputNumber: {
    colorBorder: 'rgba(82, 72, 52, 0.2)',
    colorTextPlaceholder: '#8A9187',
    fontSize: 12,
  },
  Tooltip: {
    colorBgSpotlight: '#20231E',
  },
};

// 暗色主题特有配置
const darkThemeComponents: ThemeConfig['components'] = {
  Radio: {
    colorPrimary: '#8EF2BD',
    colorPrimaryHover: '#A7F7CC',
    colorPrimaryActive: '#6EE7B7',
    fontSize: 12,
    controlHeight: 28,
  },
  Table: {
    headerBg: '#242B27',
    borderColor: 'rgba(209, 255, 229, 0.12)',
    cellPaddingBlockMD: 8,
    cellPaddingInlineMD: 16,
    headerColor: '#E9EEE8',
    fontWeightStrong: 400,
    colorBgContainer: '#1C211F',
    colorText: '#E9EEE8',
  },
  Empty: {
    colorTextDescription: '#8D978E',
  },
  Button: {
    paddingInline: 16,
    paddingInlineSM: 12,
    contentFontSizeSM: 12,
    defaultBg: '#242B27',
    defaultBorderColor: 'rgba(209, 255, 229, 0.12)',
    defaultHoverBg: '#2B332E',
    defaultHoverBorderColor: 'rgba(142, 242, 189, 0.32)',
    defaultHoverColor: '#EEF5EF',
    defaultColor: '#8D978E',
    defaultActiveBg: '#202925',
    defaultActiveBorderColor: 'rgba(142, 242, 189, 0.38)',
    defaultActiveColor: '#EEF5EF',
    colorPrimaryBgHover: '#A7F7CC',
    colorPrimaryActive: '#6EE7B7',
    controlHeight: 28,
    controlHeightLG: 32,
    contentFontSize: 12,
    contentLineHeightSM: 12,
    contentFontSizeLG: 14,
    colorTextDisabled: '#59635C',
    borderColorDisabled: 'transparent',
    colorBgContainerDisabled: '#171D1A',
    textTextColor: '#8EF2BD',
    textTextHoverColor: '#A7F7CC',
    textHoverBg: 'transparent',
  },
  Input: {
    colorBorder: 'rgba(209, 255, 229, 0.14)',
    colorTextPlaceholder: '#8D978E',
    colorBgContainer: 'rgba(255, 255, 255, 0.045)',
    colorText: '#E9EEE8',
    fontSize: 12,
    paddingInline: 10,
    paddingBlock: 4,
    lineHeight: 22 / 12,
  },
  Select: {
    colorBorder: 'rgba(209, 255, 229, 0.14)',
    colorTextPlaceholder: '#8D978E',
    colorBgElevated: '#1C211F',
    selectorBg: 'rgba(255, 255, 255, 0.045)',
    optionSelectedBg: 'rgba(142, 242, 189, 0.12)',
    colorText: '#E9EEE8',
    fontSize: 12,
    lineHeight: 22 / 12,
  },
  Dropdown: {
    colorBgElevated: '#1C211F',
    colorText: '#E9EEE8',
    fontSize: 12,
  },
  InputNumber: {
    colorBorder: 'rgba(209, 255, 229, 0.14)',
    colorTextPlaceholder: '#8D978E',
    colorBgContainer: 'rgba(255, 255, 255, 0.045)',
    colorText: '#E9EEE8',
    fontSize: 12,
  },
  Tooltip: {
    colorBgSpotlight: '#EEF5EF',
    colorTextLightSolid: '#151917',
    fontSize: 12,
  },
  Form: {
    colorBgContainer: 'rgba(255, 255, 255, 0.045)',
    fontSize: 12,
    labelColor: '#E9EEE8',
  },
};

export const lightAntdTheme: ThemeConfig = {
  ...baseTheme,
  token: {
    ...baseTheme.token,
    colorPrimary: '#4D7C3F',
    colorBgContainer: '#FFFDF8',
    colorBgElevated: '#FFFDF8',
    colorText: '#20231E',
    colorTextSecondary: '#6C7268',
    colorBorder: 'rgba(82, 72, 52, 0.16)',
  },
  components: {
    ...baseTheme.components,
    ...lightThemeComponents,
  },
};

export const darkAntdTheme: ThemeConfig = {
  ...baseTheme,
  token: {
    ...baseTheme.token,
    colorPrimary: '#8EF2BD',
    colorBgContainer: '#1C211F',
    colorBgElevated: '#1C211F',
    colorText: '#E9EEE8',
    colorTextSecondary: '#8D978E',
    colorBorder: 'rgba(209, 255, 229, 0.12)',
  },
  components: {
    ...baseTheme.components,
    ...darkThemeComponents,
  },
};
