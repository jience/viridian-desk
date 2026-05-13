import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

export function encryptString(stringToEncrypt) {
  return new Promise((resolve, reject) => {
    const publicKeyPath = path.resolve(import.meta.dirname, './public_key.pem');
    const command = 'openssl';
    const args = ['rsautl', '-encrypt', '-pubin', '-inkey', publicKeyPath];
    const openssl = spawn(command, args);
    const encryptedData = [];

    openssl.stdout.on('data', (chunk) => {
      encryptedData.push(chunk);
    });

    openssl.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    openssl.on('close', (code) => {
      if (code === 0) {
        const buffer = Buffer.concat(encryptedData);
        const base64Result = buffer.toString('base64');
        resolve(base64Result);
      } else {
        reject(new Error(`openssl process exited with code ${code}`));
      }
    });

    openssl.stdin.write(stringToEncrypt);
    openssl.stdin.end();
  });
}

// This part only runs if the script is executed directly
async function main() {
    const stringToEncrypt = process.argv[2];
    if (!stringToEncrypt) {
      console.error('Please provide a string to encrypt as an argument.');
      process.exit(1);
    }
    try {
        const encrypted = await encryptString(stringToEncrypt);
        console.log(encrypted);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
