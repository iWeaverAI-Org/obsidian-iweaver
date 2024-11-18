import { Notice, Plugin } from "obsidian";
import { IweaverSettings, DEFAULT_SETTINGS } from "./settings";
import { getArticles } from "./api";
import { IweaverSettingTab } from "./settingsTab";

export default class IweaverPlugin extends Plugin {
  settings: IweaverSettings;
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: 'sync',
      name: 'Sync new changes',
      callback: async () => {
        await this.fetchIweaver();
      },
    })
    this.addSettingTab(new IweaverSettingTab(this.app, this))
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
 
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {}
  async fetchIweaver() {
    const {
      apiKey,
      syncing,
    } = this.settings
    if (syncing) {
      new Notice('🐢 Already syncing ...')
      return
    }
    if (!apiKey) {
      new Notice('Missing Iweaver api key')
      return
    }
    this.settings.syncing = true
    await this.saveSettings()
    let total = 0
    let page = 1
    const items = []
    for (let i = 0; i < total; i += 15) {
      const { code, data } = await getArticles(apiKey, 15, page)
      if (code !== 0) {
      new Notice('Failed to fetch articles')
        continue
      }
      total = data.total
      page += 1
      items.push(...data.items)
    }
    // 通过items创建笔记
    for (const item of items) {
      const { title, content, id } = item
      await this.app.vault.create(`iweaver/${title}_${id}.md`, content)
    }
  }

}
