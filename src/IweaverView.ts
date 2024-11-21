import { ItemView, WorkspaceLeaf, Notice, Menu } from "obsidian";
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
        const container = this.containerEl.children[1]
        container.empty();
        const iframe = container.createEl("iframe");
        // 从settings获取apiKey
        const apiKey = this.settings.apiKey || "";
        if(this.settings.platform === 'iweaver'){
            iframe.src = `https://kmai-sdk-test.xiaoduoai.com/dialogue?token=${apiKey}&i18n=en`;
        }else{
            iframe.src = `https://kmai-sdk-test.xiaoduoai.com/dialogue?token=${apiKey}`;
        }
        if(document.body.classList.contains('theme-dark')){
            iframe.style.filter = "grayscale(100%) invert(100%)"
        }else{
            iframe.style.filter = "grayscale(80%)"
        }
        iframe.style.width = "100%";
        iframe.style.height = "99%";
        iframe.style.border = "none";
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
        const container = this.containerEl.children[1]
        container.empty();
        const iframe = container.createEl("iframe");
        iframe.src = this.getState().SourceURL as string;
        iframe.style.width = "100%";
        iframe.style.height = "99%";
        iframe.style.border = "none";
    }
}
