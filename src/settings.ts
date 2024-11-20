export interface IweaverSettings {
  apiKey: string;
  platform: 'zhiwo' | 'iweaver';
  fetchUrl: string;
  syncAt: string;
  syncing: boolean;
  frequency: number;
  syncOnStart: boolean;
}
export const API_URLS = {
  DOMESTIC: 'https://kmai-test.xiaoduoai.com/api/v1/plugin/files',
  OVERSEAS: 'https://chat.iweaver.ai/api/v1/files'
} as const;
export const DEFAULT_SETTINGS: IweaverSettings = {
  apiKey: "",
  platform: 'zhiwo',
  fetchUrl: 'https://kmai.xiaoduoai.com/api/v1/plugin/files',
  syncAt: "04:00",
  syncing: false,
  frequency: 10,
  syncOnStart: true,
};
