import { Notice, Plugin } from "obsidian";
import { IweaverSettings, DEFAULT_SETTINGS } from "./settings";
import { getArticles } from "./api";
import { IweaverSettingTab } from "./settingsTab";
import { VIEW_TYPE_IWEAVER, IweaverView } from "./IweaverView";

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
      id: 'sync',
      name: 'Sync new changes',
      callback: async () => {
        await this.fetchIweaver();
      },
    });
    
    this.addSettingTab(new IweaverSettingTab(this.app, this));

    // 注册视图
    this.registerView(
      VIEW_TYPE_IWEAVER,
      (leaf) => new IweaverView(leaf,this.settings)
    );

    // 添加图标按钮到左侧栏
    this.addRibbonIcon("bot", "Open Iweaver", async () => {
      const { workspace } = this.app;
      
      // 如果视图已经打开，激活它
      const existingView = workspace.getLeavesOfType(VIEW_TYPE_IWEAVER)[0];
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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.setupAutoSync();
  }

  private async resetSyncingStateSetting() {
    this.settings.syncing = false
    await this.saveSettings()
  }

  onunload() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }

    // 关闭所有视图
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_IWEAVER);
  }

  async fetchIweaver() {
    const { apiKey, syncing } = this.settings
    if (syncing) {
      new Notice('Already syncing ...')
      return
    }
    if (!apiKey) {
      new Notice('Missing Iweaver api key')
      return
    }
    this.settings.syncing = true
    await this.saveSettings()

    try {
      new Notice('🚀 Fetching items ...')
      let total = 1000
      let page = 1
      const items = []
      
      // 获取第一页数据来验证 token
      const firstResponse = await getArticles(
        apiKey, 
        15, 
        page,
        this.settings.fetchUrl as any
      )
      
      if (firstResponse.code !== 0) {
        new Notice(`Token Error`)
        return
      }

      total = firstResponse.data.total
      page += 1
      items.push(...firstResponse.data.items)

      // 获取剩余数据
      for (let i = 15; i < total; i += 15) {
        const response = await getArticles(
          apiKey, 
          15, 
          page,
          this.settings.fetchUrl as any
        )
        const { code, data } = response
        if (code !== 0) {
          new Notice(`Fetch Error`)
          continue
        }
        page += 1
        items.push(...data.items)
      }

      // 确保 iweaver 文件夹存在
      const folderPath = 'iweaver'
      if (!this.app.vault.getAbstractFileByPath(folderPath)) {
        await this.app.vault.createFolder(folderPath)
      }

      let skippedCount = 0;
      let createdCount = 0;
      let failedCount = 0;
      new Notice(`Found ${items.length} items`);
      
      for (const item of items) {
        const { alias, innerHTML, id, type, file_url } = item
        const sanitizedTitle = alias.replace(/[\\/:*?"<>|]/g, '')
        
        // 根据类型确定文件名
        const fileName = type === 'pdf' 
          ? `${folderPath}/${sanitizedTitle}-${id}.pdf`
          : `${folderPath}/${sanitizedTitle}-${id}.html`;
        
        const file = this.app.vault.getAbstractFileByPath(fileName)
        if (file) {
          skippedCount++;
          continue;
        }

        let fileContent;
        if (type === 'pdf') {
          try {
            const response = await fetch(file_url);
            if (!response.ok) throw new Error('Failed to download PDF');
            const buffer = await response.arrayBuffer();
            fileContent = new Uint8Array(buffer);
          } catch (err) {
            failedCount++;
            console.error(`Failed to download PDF: ${alias}`, err);
            continue;
          }
        } else {
          fileContent = innerHTML;
        }

        try {
          await this.app.vault.createBinary(fileName, fileContent as ArrayBuffer);
          createdCount++;
        } catch (err) {
          failedCount++;
          console.error(`Failed to create file: ${fileName}`, err);
        }
      }
      
      new Notice(`✨ Sync completed!\nCreated: ${createdCount}\nSkipped: ${skippedCount}\nFailed: ${failedCount}`);
    } catch (error) {
      new Notice('Failed to fetch articles')
    } finally {
      await this.resetSyncingStateSetting()
    }
  }
}
