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
const ifEn = !(window.localStorage.getItem("language") || "")
	.toLocaleLowerCase()
	.includes("zh");
export const DEFAULT_SETTINGS: IweaverSettings = {
	apiKey: "",
	platform: ifEn ? "iweaver" : "zhiwo",
	fetchUrl: ifEn ? API_URLS.OVERSEAS : API_URLS.DOMESTIC,
	syncAt: "",
	syncing: false,
	frequency: 10,
	syncOnStart: true,
	folder: ifEn ? "iWeaver/{{date}}" : "zhiwo/{{date}}",
};
