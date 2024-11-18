export interface IweaverSettings {
  apiKey: string;
  syncAt: string;
  syncing: boolean;
  frequency: number;
  syncOnStart: boolean;
}

export const DEFAULT_SETTINGS: IweaverSettings = {
  apiKey: "",
  syncAt: "04:00",
  syncing: false,
  frequency: 1,
  syncOnStart: true,
};
