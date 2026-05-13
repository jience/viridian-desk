/**
 * localStorage 封装
 *
 * @author 俞杰
 * @email 158392613@qq.com
 */
import { isJSON } from 'validator';
import type { StorageData } from './types';

export class StorageUtil {
  /**
   * 设置键值对到对应的命名空间下存储到 localStorage 中
   *
   * @param key 键
   * @param value 值
   */
  static setItem<K extends keyof StorageData>(key: K, value: StorageData[K]) {
    if (!value) return;
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    }
    localStorage.setItem(key, value as string);
  }

  /**
   * 通过传入的键，拿到 localStorage下相应的值
   *
   * @param key 键
   * @returns 对应键下的值
   */
  static getItem<K extends keyof StorageData>(key: K): StorageData[K] | undefined {
    const data = localStorage.getItem(key);
    if (data) {
      if (isJSON(data)) return JSON.parse(data);
      return data as StorageData[K];
    }
  }

  /**
   * 通过传入的键，删除对应 localStorage下的值
   * @param key 键
   */
  static removeItem<K extends keyof StorageData>(key: K) {
    localStorage.removeItem(key);
  }

  /**
   * 清除localStorage下所有的内容
   */
  static clearAll<K extends keyof StorageData>(whiteList?: K[]) {
    if (whiteList && whiteList.length > 0) {
      const a = {} as Record<K, StorageData[K]>;
      whiteList.forEach((k) => {
        const value = this.getItem(k);
        if (value) {
          a[k] = value;
        }
      });
      localStorage.clear();
      (Object.keys(a) as K[]).forEach((k) => this.setItem(k, a[k]));
    } else {
      localStorage.clear();
    }
  }
}
