export interface FetchUpdateResp {
  /**
   * 当前版本
   */
  currentVersion: string;
  /**
   * 最新版本
   */
  version: string;
  /**
   * 更新说明
   */
  notes: string;
}

export interface StartedEventData {
  /** 总大小 */
  contentLength: number;
}

export interface ProgressEventData {
  /** 当前下载大小 */
  chunkLength: number;
  /** 已下载大小 */
  downloadedLength: number;
}

export type DownloadEvent =
  | {
      event: 'Started';
      data?: StartedEventData;
    }
  | {
      event: 'Progress';
      data?: ProgressEventData;
    }
  | {
      event: 'Finished';
      data?: null;
    };

export type OnEventType = (event: DownloadEvent) => void;
