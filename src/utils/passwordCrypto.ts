import * as CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';
import { LEGACY_PASSWORD_PREFIX } from './passwordPrefix';

const CRYPTION_PUBLIC_KEY = 'QWER1234asdf5678';

export { LEGACY_PASSWORD_PREFIX };

export const encryption = (str: string) => {
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(btoa(str)),
    CryptoJS.enc.Utf8.parse(CRYPTION_PUBLIC_KEY),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
      iv: '',
      key: 128,
    },
  );
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
};

export const encryptionPassword = (password: string) => {
  return encryption(`${LEGACY_PASSWORD_PREFIX}-${password}_${new Date().getTime()}`);
};

export const decryption = (data: string, key = CRYPTION_PUBLIC_KEY) => {
  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(data),
    },
    CryptoJS.enc.Utf8.parse(key),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
      iv: '',
      key: 128,
    },
  );
  return atob(decrypted.toString(CryptoJS.enc.Utf8));
};

export const pkcs7 = (data: string, digit: number) => {
  if (typeof data === 'string' && typeof digit === 'number' && data.length > 0) {
    const differenceCount = digit - (data.length % digit);
    return data + Array(differenceCount + 1).join('\x07');
  }
  return data;
};

export const pkcs7Password = (password: string) => {
  if (password === '') return '';
  return pkcs7(
    Buffer.from(`${LEGACY_PASSWORD_PREFIX}-${password}_${new Date().getTime()}`).toString(
      'base64',
    ),
    16,
  );
};
