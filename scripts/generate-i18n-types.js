import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取中文语言文件作为基准
const zhCNPath = path.join(__dirname, '../src/assets/locales/zh-CN.json');
const zhCN = JSON.parse(fs.readFileSync(zhCNPath, 'utf-8'));

// 生成类型定义
const keys = Object.keys(zhCN);

// 生成 i18next-resource.d.ts
const translationObj = keys.reduce((acc, key) => {
  return acc + `    "${key}": string;\n`;
}, '');

const resourceContent = `interface Resources {
  translation: {
${translationObj}  };
}

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
