import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST_ASSETS_DIR = path.resolve('dist/assets');

const KB = 1024;
const MB = 1024 * KB;

const budgets = {
  totalAssets: 4 * MB,
  js: 450 * KB,
  css: 350 * KB,
  image: 300 * KB,
  font: 180 * KB,
  other: 200 * KB,
};

const extensionGroups = new Map([
  ['.js', 'js'],
  ['.css', 'css'],
  ['.png', 'image'],
  ['.jpg', 'image'],
  ['.jpeg', 'image'],
  ['.gif', 'image'],
  ['.webp', 'image'],
  ['.svg', 'image'],
  ['.woff', 'font'],
  ['.woff2', 'font'],
  ['.ttf', 'font'],
  ['.otf', 'font'],
]);

const legacyFontExtensions = new Set(['.woff', '.ttf']);

function formatBytes(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  return `${(bytes / KB).toFixed(1)} KB`;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(entryPath);
      return entryPath;
    }),
  );

  return files.flat();
}

async function checkBuildBudget() {
  const files = await listFiles(DIST_ASSETS_DIR);
  const violations = [];
  let totalAssets = 0;

  for (const file of files) {
    const fileStat = await stat(file);
    const size = fileStat.size;
    totalAssets += size;

    const ext = path.extname(file).toLowerCase();
    const group = extensionGroups.get(ext) || 'other';
    const limit = budgets[group];

    if (legacyFontExtensions.has(ext)) {
      violations.push(`${path.relative(process.cwd(), file)} uses ${ext}; Use woff2 instead`);
    }

    if (size > limit) {
      violations.push(
        `${path.relative(process.cwd(), file)} is ${formatBytes(size)}; budget is ${formatBytes(
          limit,
        )}`,
      );
    }
  }

  if (totalAssets > budgets.totalAssets) {
    violations.push(
      `dist/assets total is ${formatBytes(totalAssets)}; budget is ${formatBytes(
        budgets.totalAssets,
      )}`,
    );
  }

  if (violations.length) {
    console.error('Build budget exceeded:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  const gzipJsSize = files
    .filter((file) => path.extname(file).toLowerCase() === '.js')
    .reduce(async (totalPromise, file) => {
      const total = await totalPromise;
      const source = await readFile(file);
      return total + gzipSync(source).length;
    }, Promise.resolve(0));

  console.log(
    `Build budget ok: ${formatBytes(totalAssets)} assets, ${formatBytes(await gzipJsSize)} gzipped JS`,
  );
}

checkBuildBudget().catch((error) => {
  console.error(error);
  process.exit(1);
});
