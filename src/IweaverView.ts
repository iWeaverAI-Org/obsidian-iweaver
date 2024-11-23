import { ItemView, WorkspaceLeaf } from "obsidian";
import { IweaverSettings } from "./settings";

export const IWEAVER_BOT_VIEW = "iweaver-view";
export const IWEAVER_PREVIEW_VIEW = "iweaver-preview-view";
export class IweaverBotView extends ItemView {
	settings: IweaverSettings;
	constructor(leaf: WorkspaceLeaf, settings: IweaverSettings) {
		super(leaf);
		this.settings = settings;
	}

	getViewType() {
		return IWEAVER_BOT_VIEW;
	}

	getDisplayText() {
		return "Iweaver View";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		const iframe = container.createEl("iframe");
		const apiKey = this.settings.apiKey || "";
		const ifEn = this.settings.platform === "iweaver";
		const isDarkTheme = document.body.classList.contains("theme-dark");
		const hostName =
			process.env.MODE === "dev"
				? "https://kmai-sdk-test.xiaoduoai.com"
				: "https://kmai-sdk.xiaoduoai.com";
		let src = `${hostName}/dialogue?token=${apiKey}${
			ifEn ? "&i18n=en" : ""
		}${isDarkTheme ? "" : "&background_img=0"}`;
		iframe.classList.add("iweaver_iframe");
		if (isDarkTheme) {
			iframe.classList.add("dark");
		}

		const file = this.app.workspace.getActiveFile();
		if (!file) {
			iframe.src = src;
			return;
		}
		this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			if (frontmatter?._id) {
				const file_id = frontmatter._id;
				src = `${src}&file_id=${file_id}`;
			}
			iframe.src = src;
		});
	}
}

export class IweaverPreviewView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}
	getViewType() {
		return IWEAVER_PREVIEW_VIEW;
	}
	getDisplayText() {
		return "Iweaver Preview";
	}
	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		const iframe = container.createEl("iframe");
		iframe.src = this.getState().SourceURL as string;
		iframe.classList.add("iweaver_iframe");
	}
}
