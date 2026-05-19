import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const scanRoots = ['src', 'index.html'];
const sourceExtensions = new Set(['.css', '.html', '.js', '.jsx', '.json', '.scss', '.ts', '.tsx']);

const ignoredDirectories = new Set(['node_modules', 'dist', 'src-tauri/gen']);

const allowedUrlPatterns = [
  /^https?:\/\/www\.w3\.org\//,
  /^https?:\/\/electronjs\.org\/docs\//,
  /^https?:\/\/schema\.tauri\.app\//,
  /^https?:\/\/open\.work\.weixin\.qq\.com(?:\/|$)/,
  /^https?:\/\/open\.wecom\.tencent\.com(?:\/|$)/,
  /^https?:\/\/\$\{/,
  /^http:\/\/localhost:/,
  /^http:\/\/ipc\.localhost$/,
  /^https:\/\/asset\.localhost$/,
];

const urlPattern = /(?:https?:\/\/|\/\/(?=[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))[^\s"'`)<>]+/g;

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(targetPath) {
  const fileStat = await stat(targetPath);
  if (fileStat.isFile()) return [targetPath];

  const entries = await readdir(targetPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(targetPath, entry.name);
      if (entry.isDirectory()) {
        const relative = path.relative(process.cwd(), entryPath);
        if (ignoredDirectories.has(relative)) return [];
        return listFiles(entryPath);
      }
      return [entryPath];
    }),
  );

  return files.flat();
}

function isAllowedUrl(url) {
  const normalized = url.startsWith('//') ? `https:${url}` : url;
  return allowedUrlPatterns.some((pattern) => pattern.test(normalized));
}

async function checkOfflineAssets() {
  const rootFiles = (
    await Promise.all(
      scanRoots.map(async (root) => {
        if (!(await pathExists(root))) return [];
        return listFiles(root);
      }),
    )
  ).flat();

  const sourceFiles = rootFiles.filter((file) => sourceExtensions.has(path.extname(file)));
  const violations = [];

  for (const file of sourceFiles) {
    const content = await readFile(file, 'utf8');
    const matches = content.match(urlPattern) || [];

    for (const url of matches) {
      if (isAllowedUrl(url)) continue;
      violations.push(`${path.relative(process.cwd(), file)} -> ${url}`);
    }
  }

  if (violations.length) {
    console.error('Unexpected remote URL references found:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    console.error('Bundle required static assets locally, or add a documented runtime allowlist.');
    process.exit(1);
  }

  console.log(`Offline asset check ok: scanned ${sourceFiles.length} source files`);
}

checkOfflineAssets().catch((error) => {
  console.error(error);
  process.exit(1);
});
