import { ItemView, WorkspaceLeaf } from "obsidian";
import { IweaverSettings } from "./settings";

export const VIEW_TYPE_IWEAVER = "iweaver-view";

export class IweaverView extends ItemView {
    settings: IweaverSettings;
    constructor(leaf: WorkspaceLeaf,settings: IweaverSettings) {
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
        // 从settings获取apiKey
        const apiKey = this.settings.apiKey || "";
        if(this.settings.platform === 'iweaver'){
            iframe.src = `http://10.0.3.41:3080/dialogue?token=${apiKey}&i18n=en`;
        }else{
            iframe.src = `http://10.0.3.41:3080/dialogue?token=${apiKey}`;
        }
        iframe.style.width = "100%";
        iframe.style.filter = "grayscale(80%)"
        iframe.style.height = "99%";
        iframe.style.border = "none";
    }
} 
