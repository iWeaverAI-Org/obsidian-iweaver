import { ItemView, WorkspaceLeaf } from "obsidian";
import { IweaverSettings } from "./settings";
import { isLocal } from "./env";

export const VIEW_TYPE_IWEAVER = "iweaver-view";
export const VIEW_TYPE_IWEAVER_PREVIEW = "iweaver-preview-view";
export class IweaverView extends ItemView {
	settings: IweaverSettings;
	constructor(leaf: WorkspaceLeaf, settings: IweaverSettings) {
		super(leaf);
		this.settings = settings;
	}

	getViewType() {
		return VIEW_TYPE_IWEAVER;
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
		let hostName = "https://kmai-sdk-test.xiaoduoai.com";
		if (isLocal()) {
			hostName = "http://10.0.3.41:3080";
		}
		let src = `${hostName}/dialogue?token=${apiKey}${
			ifEn ? "&i18n=en" : ""
		}${isDarkTheme ? "" : "&background_img=0"}`;
		if (isDarkTheme) {
			iframe.style.filter = "grayscale(100%) invert(100%)";
		}
		iframe.style.width = "100%";
		iframe.style.height = "99%";
		iframe.style.border = "none";

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
		return VIEW_TYPE_IWEAVER_PREVIEW;
	}
	getDisplayText() {
		return "Iweaver Preview";
	}
	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		const iframe = container.createEl("iframe");
		iframe.src = this.getState().SourceURL as string;
		iframe.style.width = "100%";
		iframe.style.height = "99%";
		iframe.style.border = "none";
	}
}
