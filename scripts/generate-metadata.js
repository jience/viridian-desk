import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import yaml from 'js-yaml';
import { getChangelogBody } from './parse-changelog.js';
import { encryptString } from './rsa-encrypt.js';


const supportModuleNamesMap = {
  'Client-L': 'Client-L',
  'Client-W': 'Client-W',
  'Client-X': 'Client-X90,Client-X200,Client-X300,Client-X400,Client-X410,Client-K60,Client-K100,Client-K200,Client-K80',
  'Client-R64': 'Client-R200',
}

async function generateMetadata() {
  // This script is designed to be called from the `build.sh` script.
  console.log('Running afterBundle hook: generate-metadata.js');

  // 1. Get bundle paths from environment variable
  const bundlePaths = process.env.TAURI_BUNDLER_OUTPUT_PATHS;
  if (!bundlePaths) {
    console.error('Error: TAURI_BUNDLER_OUTPUT_PATHS environment variable not set.');
    process.exit(1);
  }

  // The env var is a JSON string (e.g., "[\"/path/to/bundle.msi\"]"), so parse it
  let paths;
  try {
    const rawPaths = JSON.parse(bundlePaths);
    // On Windows Git Bash, paths might be in the format /c/path/to/file.
    // We need to convert them to a format Node.js understands (C:/path/to/file).
    paths = rawPaths.map(p => {
      if (os.platform() === 'win32' && p.match(/^\/[a-zA-Z]\//)) {
        const drive = p[1].toUpperCase();
        return `${drive}:${p.substring(2)}`;
      }
      return p;
    });
  } catch (e) {
    console.error('Error: Failed to parse TAURI_BUNDLER_OUTPUT_PATHS.', e);
    process.exit(1);
  }

  if (!paths || paths.length === 0) {
    console.error('Error: No bundle paths found in TAURI_BUNDLER_OUTPUT_PATHS.');
    process.exit(1);
  }

  // 2. Use the first bundle path as the primary artifact.
  const primaryArtifactPath = paths.find(p => !p.endsWith('.deb') && !p.endsWith('.exe')) || paths[0];
  const outputDir = path.dirname(primaryArtifactPath);
  const artifactFilename = path.basename(primaryArtifactPath);

  console.log(`Processing artifact: ${primaryArtifactPath}`);

  // 3. Calculate MD5 checksum and encrypt it
  const fileBuffer = fs.readFileSync(primaryArtifactPath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  const md5sum = hashSum.digest('hex');
  console.log("MD5 sum: ", md5sum);

  let encryptedMd5sum;
  try {
    encryptedMd5sum = await encryptString(md5sum);
  } catch (e) {
    console.error(`Error: Failed to encrypt MD5 sum using rsa-encrypt.js script.`);
    console.error(e);
    process.exit(1);
  }

  // 4. Get a version and module name from package.json
  const tauriConfJsonPath = path.resolve(import.meta.dirname, '../src-tauri/tauri.conf.json');
  const tauriConfJson = JSON.parse(fs.readFileSync(tauriConfJsonPath, 'utf-8'));
  const version = tauriConfJson.version;
  const moduleName = process.env.CLIENT_MODULE_NAME;

  // 5.Read updater signature from *.sig file
  const updaterSignaturePath = path.resolve(primaryArtifactPath + '.sig');
  let signature = "";
  try {
    if (fs.existsSync(updaterSignaturePath)) {
      signature = fs.readFileSync(updaterSignaturePath, 'utf-8');
    } else {
      console.log(`Warning: ${updaterSignaturePath} not found. signature will be empty string.`);
    }
  } catch (e) {
    console.error(`Error reading ${updaterSignaturePath}:`, e);
  }

  // 6. Read support-module-names from env
  const is_thin = process.env.CARGO_CFG_FEATURE_THIN_CLIENT;
  console.log("CARGO_CFG_FEATURE_THIN_CLIENT: ", is_thin)
  let support_module_names = supportModuleNamesMap[moduleName];
  if (os.type() === 'Linux') {
    if (is_thin !== undefined) {
      if (os.arch() === 'x64') {
        support_module_names = supportModuleNamesMap['Client-X'];
      } else if (os.arch() === 'arm64') {
        support_module_names = supportModuleNamesMap['Client-R64'];
      }
    }
  }

  // 7. Read CHANGELOG.md for the update description
  let updateDescription = "";
  try {
    updateDescription = await getChangelogBody();
  } catch (e) {
    console.error('Error reading CHANGELOG.md:', e);
  }

  // 8. Construct the metadata object
  const metadata = {
    'build-timestamp': Math.floor(Date.now() / 1000),
    'version': version,
    'md5sum': encryptedMd5sum,
    'signature': signature,
    'package-name': artifactFilename,
    'module-name': moduleName,
    'support-module-names': support_module_names,
    'update-description': updateDescription,
  };

  // 9. Write the metadata.json file
  const metadataFilePath = path.join(outputDir, 'metadata.yaml');
  try {
    const metadataYamlData = yaml.dump(metadata);
    fs.writeFileSync(metadataFilePath, metadataYamlData, 'utf8');
  } catch (e) {
    console.log('Error write metadata.yaml: ', e)
  }

  console.log(`Successfully generated metadata.json at ${metadataFilePath}`);
  console.log('Metadata content:');
  console.log(JSON.stringify(metadata, null, 2));

  // 10. Print the paths for the shell script to capture
  console.log(`ARTIFACT_PATH=${primaryArtifactPath}`);
  console.log(`METADATA_PATH=${metadataFilePath}`);
  console.log(`OUTPUT_DIR=${outputDir}`);
}

generateMetadata();
