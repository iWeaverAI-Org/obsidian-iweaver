export interface IweaverSettings {
	apiKey: string;
	platform: "zhiwo" | "iweaver";
	fetchUrl: string;
	syncAt: string;
	syncing: boolean;
	frequency: number;
	syncOnStart: boolean;
	folder: string;
}
export const API_URLS = {
	DOMESTIC:
		process.env.MODE === "dev"
			? "https://kmai-test.xiaoduoai.com/api/v1/files"
			: "https://kmai.xiaoduoai.com/api/v1/files",
	OVERSEAS:
		process.env.MODE === "dev"
			? "https://test.iweaver.ai/api/v1/files"
			: "https://chat.iweaver.ai/api/v1/files",
} as const;
export const DEFAULT_SETTINGS: IweaverSettings = {
	apiKey: "",
	platform: "zhiwo",
	fetchUrl:
		process.env.MODE === "dev"
			? "https://kmai-test.xiaoduoai.com/api/v1/files"
			: "https://kmai.xiaoduoai.com/api/v1/files",
	syncAt: "04:00",
	syncing: false,
	frequency: 10,
	syncOnStart: true,
	folder: "iWeaver/{{tag}}",
};
