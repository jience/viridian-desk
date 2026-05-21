# 国际化语言文件管理

## 概述

项目的国际化文件为单个平铺结构的 JSON 文件。每种语言只有一个 JSON 文件。

## 文件结构

```
src/assets/locales/
├── zh-CN.json      # 简体中文
├── en-US.json      # 美式英语
└── zh-TW.json      # 繁体中文
```

## 键命名规范

所有翻译键使用点号 (`.`) 分隔，格式为：`<namespace>.<key>`

例如：

- `application_page.category_all`
- `config_page.server_setting.gateway_name`
- `common.warning`

### 键的结构

1. **第一部分**：原文件名（namespace）
   - `application_page` - 应用页面相关
   - `approval_page` - 审批页面相关
   - `config_page` - 配置页面相关
   - `common` - 通用文本
   - `login_page` - 登录页面相关
   - `translation` - 其他翻译

2. **后续部分**：原嵌套对象的路径
   - 使用点号连接
   - 保持语义清晰

## 使用方法

在代码中使用 `t()` 函数：

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      {t('application_page.category_all')}
      {t('common.warning')}
      {t('config_page.server_setting.gateway_name')}
    </div>
  );
}
```

## 维护指南

### 添加新的翻译键

1. 直接在对应语言的 JSON 文件中添加键值对
2. 遵循命名规范：`<namespace>.<key>`
3. 确保所有语言文件都添加了相同的键

### 修改现有翻译

直接编辑对应语言文件中的值即可。

### 从旧格式迁移（参考）

如果需要从多文件格式重新生成，可以：

1. 将语言文件放回 `src/assets/locales/<language>/` 目录
2. 运行合并脚本：
   ```bash
   node scripts/merge-locales.js
   ```
3. 重新生成类型定义：
   ```bash
   node scripts/generate-i18n-types.js
   ```

## 脚本说明

### generate-i18n-types.js

根据语言文件自动生成 TypeScript 类型定义。

**功能**：

- 读取 `zh-CN.json` 作为基准
- 生成 `src/@types/i18next-resource.d.ts`
- 更新 `src/@types/i18next.d.ts`

## 配置说明

在 `src/utils/i18n.ts` 中的关键配置：

```typescript
i18next.init({
  nsSeparator: false, // 不使用 namespace 分隔符
  keySeparator: '.', // 使用点号作为键分隔符
  fallbackLng: 'zh', // 回退语言
  // ...
});
```
