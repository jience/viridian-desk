import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), 'utf-8'));
}

// 读取中文语言文件作为基准
const zhCN = readJson('../src/assets/locales/zh-CN.json');
const redesignResources = {
  common: readJson('../src/ui/i18n/locales/zh-CN/common.json'),
  assistant: readJson('../src/ui/i18n/locales/zh-CN/assistant.json'),
};

// 生成类型定义
const keys = Object.keys(zhCN);

// 生成 i18next-resource.d.ts
const translationObj = keys.reduce((acc, key) => {
  return acc + `    "${key}": string;\n`;
}, '');

const redesignNamespaceObj = Object.entries(redesignResources)
  .map(([namespace, resource]) => {
    const namespaceObj = Object.keys(resource).reduce((acc, key) => {
      return acc + `    "${key}": string;\n`;
    }, '');
    return `  ${namespace}: {\n${namespaceObj}  };\n`;
  })
  .join('');

const resourceContent = `interface Resources {
  translation: {
${translationObj}  };
${redesignNamespaceObj}}

export default Resources;
`;

const resourcePath = path.join(__dirname, '../src/@types/i18next-resource.d.ts');
fs.writeFileSync(resourcePath, resourceContent, 'utf-8');

console.log(`✓ 已生成 i18next-resource.d.ts (${keys.length} 个键)`);

// 更新 i18next.d.ts
const i18nextContent = `import type Resources from './i18next-resource';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: Resources;
  }
}
`;

const i18nextPath = path.join(__dirname, '../src/@types/i18next.d.ts');
fs.writeFileSync(i18nextPath, i18nextContent, 'utf-8');

console.log('✓ 已更新 i18next.d.ts');
console.log('\n类型定义生成完成！');
