import { App, PluginSettingTab, Setting } from "obsidian";
import IweaverPlugin from "./main";
import { API_URLS } from "./settings";
import { t } from "./i18n";

export class IweaverSettingTab extends PluginSettingTab {
	plugin: IweaverPlugin;
	OpenApiKey: string;
	constructor(app: App, plugin: IweaverPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		
		const platformName = this.plugin.settings.platform === "iweaver" ? "IWeaver" : "知我";

		containerEl.createEl("h3", { text: t("setting.title.sync") });

		new Setting(containerEl)
			.setName(t("setting.title.platform"))
			.setDesc(t("setting.desc.platform"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("zhiwo", t("setting.option.zhiwo"))
					.addOption("iweaver", t("setting.option.iweaver"))
					.setValue(this.plugin.settings.platform)
					.onChange(async (value) => {
						const prefix = this.plugin.settings.platform === "iweaver" ? "iWeaver" : "zhiwo";
						const preFolder = this.plugin.settings.folder;
						if(preFolder===`${prefix}/{{tag}}`){
							this.plugin.settings.folder = value === "iweaver" ? "iWeaver/{{date}}" : "zhiwo/{{tag}}";
						}else if(preFolder===`${prefix}/{{date}}`){
							this.plugin.settings.folder = value === "iweaver" ? "iWeaver/{{tag}}" : "zhiwo/{{date}}";
						}
						this.plugin.settings.platform =
							value === "iweaver" ? "iweaver" : "zhiwo";
						this.plugin.settings.fetchUrl =
							value === "iweaver"
								? API_URLS.OVERSEAS
								: API_URLS.DOMESTIC;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName(t("setting.title.token"))
			.setDesc(t("setting.desc.token", { platform: platformName }))
			.addText((text) =>
				text
					.setPlaceholder(t("setting.placeholder.token"))
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("setting.title.folder"))
			.setDesc(t("setting.desc.folder", { platform: platformName }))
			.addDropdown((dropdown) => {
				const prefix = this.plugin.settings.platform === "iweaver" ? "iWeaver" : "zhiwo";
				return dropdown
					.addOption(`${prefix}/{{tag}}`, `${prefix}/{{tag}}`)
					.addOption(`${prefix}/{{date}}`, `${prefix}/{{date}}`)
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(t("setting.title.frequency"))
			.setDesc(t("setting.desc.frequency"))
			.addText((text) =>
				text
					.setPlaceholder("10")
					.setValue(this.plugin.settings.frequency.toString())
					.onChange(async (value) => {
						this.plugin.settings.frequency = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("setting.title.syncOnStartup"))
			.setDesc(t("setting.desc.syncOnStartup", { platform: platformName }))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.syncOnStart)
					.onChange(async (value) => {
						this.plugin.settings.syncOnStart = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("setting.title.lastSync"))
			.setDesc(t("setting.desc.lastSync", { platform: platformName }))
			.addMomentFormat((momentFormat) =>
				momentFormat
					.setPlaceholder("Last Sync")
					.setValue(this.plugin.settings.syncAt)
					.setDefaultFormat("yyyy-MM-dd HH:mm:ss")
					.onChange(async (value) => {
						this.plugin.settings.syncAt = value;
						await this.plugin.saveSettings();
					})
			);
	}

	hide(): void {
		if (this.OpenApiKey !== this.plugin.settings.apiKey) {
			this.plugin.fetchIweaver();
		}
	}
}
