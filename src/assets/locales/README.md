# 国际化语言文件管理

## 结构

翻译资源按语言目录和功能分块存放，避免首屏一次性加载单个大 JSON。

```
src/assets/locales/
├── zh-CN/
│   ├── core.json
│   ├── error.json
│   ├── login.json
│   ├── settings.json
│   └── workspace.json
├── zh-TW/
└── en-US/
```

## 分块规则

- `core.json`: 通用文案和未归类的旧键。
- `login.json`: 登录页、认证入口和登录状态文案。
- `settings.json`: 设置页、服务器、网络、日志、主题等文案。
- `workspace.json`: 登录后的桌面、应用、审批、工单等业务文案。
- `error.json`: `error_code.*` 错误码文案。

## 维护要求

新增文案时放到对应功能分块，并在 `zh-CN`、`zh-TW`、`en-US` 三种语言中保持相同键名。键名仍使用平铺格式，例如 `application_page.refresh`、`config_page.server_setting.gateway_name`。

更新资源后运行：

```bash
pnpm run update-i18n
```

`src/utils/i18n.ts` 通过 `import.meta.glob` 按语言聚合这些分块；`scripts/generate-i18n-types.js` 会读取 `zh-CN` 目录生成类型定义。
