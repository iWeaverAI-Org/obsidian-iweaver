import { ItemView, WorkspaceLeaf, Notice, Menu } from "obsidian";
import { IweaverSettings } from "./settings";
import { isLocal } from "./env";

export const VIEW_TYPE_IWEAVER = "iweaver-view";

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
		const apiKey = this.settings.apiKey || "";
		if (!apiKey) {
			new Notice("Missing Iweaver API Token");
			return;
		}

		const container = this.containerEl.children[1];
		container.empty();
		const iframe = container.createEl("iframe");
		// 从settings获取apiKey

		let hostName = "https://kmai-sdk-test.xiaoduoai.com";
		if (isLocal()) {
			hostName = "http://10.0.3.41:3080";
		}
		if (this.settings.platform === "iweaver") {
			iframe.src = `${hostName}/dialogue?token=${apiKey}&i18n=en`;
		} else {
			iframe.src = `${hostName}/dialogue?token=${apiKey}`;
		}
		if (document.body.classList.contains("theme-dark")) {
			iframe.style.filter = "grayscale(100%) invert(100%)";
		} else {
			iframe.style.filter = "grayscale(80%)";
		}
		iframe.style.width = "100%";
		iframe.style.height = "99%";
		iframe.style.border = "none";
	}
}
