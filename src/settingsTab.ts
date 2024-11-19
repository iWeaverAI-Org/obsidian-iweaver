import { App, PluginSettingTab, Setting } from "obsidian"
import IweaverPlugin from "./main"
import { API_URLS } from "./settings"

export class IweaverSettingTab extends PluginSettingTab {
  plugin: IweaverPlugin
  constructor(app: App, plugin: IweaverPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }
  display(): void {
    const { containerEl } = this
    containerEl.empty()
    new Setting(containerEl)
      .setName('API Key')
      .setDesc(
        createFragment((fragment) => {
          fragment.append(
            'You can create an API key at ',
            fragment.createEl('a', {
              text: 'https://iweaver.app/settings/api',
              href: 'https://iweaver.app/settings/api',
            }),
          )
        }),
      )
      .addText((text) =>
        text
          .setPlaceholder('Enter your Iweaver Api Key')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value
            await this.plugin.saveSettings()
          }),
      )
    containerEl.createEl('h3', { text: 'Sync Settings' })
    new Setting(containerEl)
      .setName('Sync frequency')
      .setDesc('The frequency to sync articles (minutes)')
      .addText((text) =>
        text.setPlaceholder('1').setValue(this.plugin.settings.frequency.toString()).onChange(async (value) => {
          this.plugin.settings.frequency = parseInt(value)
          await this.plugin.saveSettings()
        }),
      )
    new Setting(containerEl)
      .setName('Sync on start')
      .setDesc('Whether to sync articles on start')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.syncOnStart).onChange(async (value) => {
          this.plugin.settings.syncOnStart = value
          await this.plugin.saveSettings()
        }),
      )
    new Setting(containerEl)
      .setName('Platform')
      .setDesc('Select the platform to use')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('zhiwo', '知我')
          .addOption('iweaver', 'IWeaver')
          .setValue(this.plugin.settings.platform)
          .onChange(async (value) => {
            this.plugin.settings.platform = value === 'iweaver' ? 'iweaver' : 'zhiwo'
            this.plugin.settings.fetchUrl = value === 'iweaver' ? API_URLS.OVERSEAS : API_URLS.DOMESTIC
            await this.plugin.saveSettings()
          }),
      )
  }
}
