import { Notice, Plugin, moment } from "obsidian";
import { IweaverSettings, DEFAULT_SETTINGS } from "./settings";
import { getArticles } from "./api";
import { IweaverSettingTab } from "./settingsTab";
import {
	VIEW_TYPE_IWEAVER,
	IweaverView,
	IweaverPreviewView,
	VIEW_TYPE_IWEAVER_PREVIEW,
} from "./IweaverView";

export default class IweaverPlugin extends Plugin {
	settings: IweaverSettings;
	private syncIntervalId: NodeJS.Timeout | null = null;

	async onload() {
		await this.loadSettings();
		await this.resetSyncingStateSetting();

		if (this.settings.syncOnStart) {
			setTimeout(() => {
				this.fetchIweaver();
			}, 3000);
		}

		this.setupAutoSync();

		this.addCommand({
			id: "sync",
			name: "Sync new changes",
			callback: async () => {
				await this.fetchIweaver();
			},
		});
		// 注册视图
		this.registerView(
			VIEW_TYPE_IWEAVER_PREVIEW,
			(leaf) => new IweaverPreviewView(leaf)
		);
		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file) {
					this.app.fileManager.processFrontMatter(
						file,
						async (frontmatter) => {
							if (frontmatter && frontmatter?.SourceURL) {
								const { workspace } = this.app;
								const existingView = workspace.getLeavesOfType(
									VIEW_TYPE_IWEAVER_PREVIEW
								)[0];

								if (existingView) {
									const container =
										// @ts-ignore
										existingView.containerEl as HTMLDivElement;
									const iframe =
										container.querySelector("iframe");
									if (iframe) {
										iframe.src = frontmatter.SourceURL;
									}
									return;
								}
								const rightLeaf = workspace.getRightLeaf(false);
								if (rightLeaf) {
									await rightLeaf.setViewState({
										type: VIEW_TYPE_IWEAVER_PREVIEW,
										active: true,
									});
									const existingView =
										workspace.getLeavesOfType(
											VIEW_TYPE_IWEAVER_PREVIEW
										)[0];
									const container =
										// @ts-ignore
										existingView.containerEl as HTMLDivElement;
									const iframe =
										container.querySelector("iframe");
									if (iframe) {
										iframe.src = frontmatter.SourceURL;
									}
								}
							}
						}
					);
				}
			})
		);

		this.addSettingTab(new IweaverSettingTab(this.app, this));

		// 注册视图
		this.registerView(
			VIEW_TYPE_IWEAVER,
			(leaf) => new IweaverView(leaf, this.settings)
		);

		// 添加图标按钮到左侧栏
		this.addRibbonIcon("bot", "Open Iweaver", async () => {
			if (!this.settings.apiKey) {
				const ifEn = this.settings.platform === "iweaver";
				new Notice(ifEn ? "Missing API Token" : "API Token 未配置");
				return;
			}

			const { workspace } = this.app;

			// 如果视图已经打开，激活它
			const existingView =
				workspace.getLeavesOfType(VIEW_TYPE_IWEAVER)[0];
			if (existingView) {
				workspace.revealLeaf(existingView);
				return;
			}

			// 在右侧打开新视图
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({
					type: VIEW_TYPE_IWEAVER,
					active: true,
				});
			}
		});
	}

	private setupAutoSync() {
		if (this.syncIntervalId) {
			clearInterval(this.syncIntervalId);
			this.syncIntervalId = null;
		}

		if (this.settings.frequency > 0) {
			const interval = this.settings.frequency * 60 * 1000;
			this.syncIntervalId = setInterval(() => {
				this.fetchIweaver();
			}, interval);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.setupAutoSync();
	}

	private async resetSyncingStateSetting() {
		this.settings.syncing = false;
		await this.saveSettings();
	}

	onunload() {
		if (this.syncIntervalId) {
			clearInterval(this.syncIntervalId);
			this.syncIntervalId = null;
		}

		// 关闭所有视图
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_IWEAVER);
	}

	private getFolderPath(create_time: string, tags: any[]): string {
		let folderPath = "iweaver";
		if (this.settings.folder.includes("{{date}}")) {
			const date = moment(create_time).format("YYYY-MM-DD");
			folderPath = this.settings.folder.replace("{{date}}", date);
		} else if (this.settings.folder.includes("{{tag}}")) {
			const tagName = tags[0]?.name;
			folderPath = this.settings.folder.replace("{{tag}}", tagName || "");
		}
		return folderPath;
	}

	async fetchIweaver() {
		const { apiKey, syncing } = this.settings;
		if (syncing) {
			new Notice("Already syncing ...");
			return;
		}
		if (!apiKey) {
			new Notice("Missing Iweaver api key");
			return;
		}
		this.settings.syncing = true;
		await this.saveSettings();

		try {
			new Notice("🚀 Fetching items ...");
			let total = 1000;
			let page = 1;
			const items = [];

			// 获取第一页数据来验证 token
			const firstResponse = await getArticles(
				apiKey,
				15,
				page,
				this.settings.fetchUrl as any
			);

			if (firstResponse.code !== 0) {
				new Notice(`Token Error`);
				return;
			}

			total = firstResponse.data.total;
			page += 1;
			items.push(...firstResponse.data.items);

			// 获取剩余数据
			for (let i = 15; i < total; i += 15) {
				const response = await getArticles(
					apiKey,
					15,
					page,
					this.settings.fetchUrl as any
				);
				const { code, data } = response;
				if (code !== 0) {
					new Notice(`Fetch Error`);
					continue;
				}
				page += 1;
				items.push(...data.items);
			}

			let skippedCount = 0;
			let createdCount = 0;
			let failedCount = 0;
			new Notice(`Found ${items.length} items`);

			for (const item of items) {
				try {
					const {
						alias,
						content,
						tags,
						type,
						file_url,
						create_time,
						summary,
						id,
					} = item;
					const sanitizedTitle = alias.replace(/[\\/:*?"<>|]/g, "");

					// 使用新函数获取文件夹路径
					const folderPath = this.getFolderPath(create_time, tags);

					// 确保文件夹存在
					if (!this.app.vault.getAbstractFileByPath(folderPath)) {
						await this.app.vault.createFolder(folderPath);
					}

					const pdfFileName = `${folderPath}/${sanitizedTitle}.pdf`;
					const mdFileName = `${folderPath}/${sanitizedTitle}.md`;

					const pdfFile =
						this.app.vault.getAbstractFileByPath(pdfFileName);
					const mdFile =
						this.app.vault.getAbstractFileByPath(mdFileName);

					if (pdfFile && mdFile) {
						skippedCount++;
						continue;
					}

					if (type === "pdf") {
						if (!pdfFile) {
							await this.createPdfFile(
								pdfFileName,
								file_url,
								alias
							);
						}
						if (!mdFile) {
							await this.createMarkdownFile(
								mdFileName,
								file_url,
								summary,
								content,
								id
							);
						}
					} else {
						if (!mdFile) {
							await this.createMarkdownFile(
								mdFileName,
								file_url,
								summary,
								content,
								id
							);
						}
					}
					createdCount++;
				} catch (err) {
					failedCount++;
					console.error(`Failed to create file`);
				}
			}

			new Notice(
				`✨ Sync completed!\nCreated: ${createdCount}\nSkipped: ${skippedCount}\nFailed: ${failedCount}`
			);
		} catch (error) {
			new Notice("Failed to fetch articles");
		} finally {
			await this.resetSyncingStateSetting();
		}
	}

	private async createPdfFile(
		fileName: string,
		fileUrl: string,
		alias: string
	) {
		try {
			const response = await fetch(fileUrl);
			if (!response.ok) throw new Error("Failed to download Source File");
			const buffer = await response.arrayBuffer();
			const fileContent = new Uint8Array(buffer);
			return await this.app.vault.createBinary(
				fileName,
				fileContent as ArrayBuffer
			);
		} catch (err) {
			console.error(`Failed to download Source File: ${alias}`, err);
		}
	}

	private async createMarkdownFile(
		fileName: string,
		fileUrl: string,
		summary: any,
		content: string,
		fileId: string
	) {
		const downloadLink = fileUrl;
		const fileContent = `---
SourceURL: ${downloadLink}
_id: ${fileId || "unknown"}
---
${summary?.template || content}`;
		await this.app.vault.create(fileName, fileContent);
	}
}
