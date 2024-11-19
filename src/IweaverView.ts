import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_IWEAVER = "iweaver-view";

export class IweaverView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
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
        iframe.src = "https://iweaver.com"; // 替换成你需要嵌入的网页地址
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
    }
} 
