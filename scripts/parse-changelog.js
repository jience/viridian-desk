import fs from 'fs';
import path from 'path';
import parseChangelog from 'changelog-parser';

function getVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../package.json'), 'utf-8'));
  return pkg.version;
}

/**
 * Parses the CHANGELOG.md file and returns the body for a specific version.
 * @param {string} [targetVersion] - The version to look for. If not provided, it uses the version from package.json.
 * @returns {Promise<string>} A promise that resolves with the changelog body for the specified version.
 */
export function getChangelogBody(targetVersion) {
  const version = targetVersion || getVersion();
  console.log(`Parsing changelog for version: ${version}`);

  const changelogPath = path.resolve(import.meta.dirname, '../CHANGELOG.md');

  return new Promise((resolve, reject) => {
    parseChangelog({
      filePath: changelogPath,
      removeMarkdown: true,
    }, function (err, result) {
      if (err) {
        reject(`Error parsing changelog: ${err}`);
        return;
      }

      const release = result.versions.find(v => v.version === version);

      if (release) {
        resolve(release.body);
      } else {
        reject(`Version ${version} not found in CHANGELOG.md`);
      }
    });
  });
}

// Example of how to run it if the file is executed directly
// This part will not run when imported as a module.
if (import.meta.url.endsWith(process.argv[1])) {
  (async () => {
    try {
      const versionFromArgv = process.argv[2];
      const body = await getChangelogBody(versionFromArgv);
      console.log(body);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}
