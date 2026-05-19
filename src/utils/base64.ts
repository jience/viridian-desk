enum Base64DataPrefix {
  IMAGE_PNG = 'data:image/png;base64,',
  IMAGE_JPEG = 'data:image/jpeg;base64,',
  IMAGE_WEBP = 'data:image/webp;base64,',
  IMAGE_GIF = 'data:image/gif;base64,',
  APPLICATION_OCTET_STREAM = 'data:application/octet-stream;base64,',
}

const base64DataPrefixKv: Record<string, Base64DataPrefix> = {
  png: Base64DataPrefix.IMAGE_PNG,
  jpeg: Base64DataPrefix.IMAGE_JPEG,
  jpg: Base64DataPrefix.IMAGE_JPEG,
  webp: Base64DataPrefix.IMAGE_WEBP,
  gif: Base64DataPrefix.IMAGE_GIF,
  default: Base64DataPrefix.APPLICATION_OCTET_STREAM,
};

export const fetchImageUrlToBase64 = async (url: string) => {
  const { fetch } = await import('@tauri-apps/plugin-http');
  const response = await fetch(url, {
    method: 'GET',
    connectTimeout: 60000,
    danger: {
      acceptInvalidCerts: true,
      acceptInvalidHostnames: true,
    },
  });
  const blob = await response.blob();

  let prefix: string = Base64DataPrefix.APPLICATION_OCTET_STREAM;
  const contentType = response.headers.get('content-type');
  if (contentType) {
    prefix = `data:${contentType};base64,`;
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(`${prefix}${base64Data}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const readLocalFile = async (filePath: string, opt?: { prefix?: Base64DataPrefix }) => {
  let { prefix } = opt || {};
  if (!prefix) {
    prefix = suffixToBase64Prefix(filePath);
  }
  // 读取文件为二进制数据
  const { readFile } = await import('@tauri-apps/plugin-fs');
  const fileData = await readFile(filePath);
  // 转换为 base64
  const base64 = btoa(
    new Uint8Array(fileData).reduce((data, byte) => data + String.fromCharCode(byte), ''),
  );
  const dataUrl = `${prefix}${base64}`;
  return dataUrl;
};

export const suffixToBase64Prefix = (filePath: string) => {
  // 拿到文件后缀名
  const fileExtension = filePath.split('.').pop()?.toLowerCase();
  return (
    base64DataPrefixKv[fileExtension || 'default'] || Base64DataPrefix.APPLICATION_OCTET_STREAM
  );
};
