import { App, PluginSettingTab, Setting } from "obsidian";
import IweaverPlugin from "./main";
import { API_URLS } from "./settings";

export class IweaverSettingTab extends PluginSettingTab {
	plugin: IweaverPlugin;
	OpenApiKey: string;
	constructor(app: App, plugin: IweaverPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		this.OpenApiKey = this.plugin.settings.apiKey;

		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h3", { text: "Sync settings" });

		new Setting(containerEl)
			.setName("Source platform")
			.setDesc(
				"Choose the source platform of the data, which is where you get the Token."
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("zhiwo", "Zhiwo")
					.addOption("iweaver", "IWeaver")
					.setValue(this.plugin.settings.platform)
					.onChange(async (value) => {
						this.plugin.settings.platform =
							value === "iweaver" ? "iweaver" : "zhiwo";
						this.plugin.settings.fetchUrl =
							value === "iweaver"
								? API_URLS.OVERSEAS
								: API_URLS.DOMESTIC;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("API Token")
			.setDesc(
				"Create an API key at settings page on iWeaver web app. It's a secret!"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your API token")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Folder")
			.setDesc("Choose the form of folder where the data will be stored")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("iWeaver/{{tag}}", "iWeaver/{{tag}}")
					.addOption("iWeaver/{{date}}", "iWeaver/{{date}}")
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Frequency")
			.setDesc("Enter the frequency in minutes to sync automatically.")
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
			.setName("Sync on startup")
			.setDesc(
				"Check this box if you want to sync with Iweaver when the app is loaded"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.syncOnStart)
					.onChange(async (value) => {
						this.plugin.settings.syncOnStart = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Last Sync")
			.setDesc(
				"Last time the plugin synced with iWeaver. The 'Sync' command fetches articles updated after this timestamp"
			)
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
