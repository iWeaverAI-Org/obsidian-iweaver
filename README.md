# Iweaver Plugin for Obsidian

这是一个用于 Obsidian 的 Iweaver 插件。该插件允许用户从 Iweaver 平台同步数据到 Obsidian 笔记中。

## 功能

- 添加一个左侧栏图标，点击后打开 Iweaver 视图。
- 提供一个命令 "Sync new changes" 来手动同步数据。
- 自动同步功能，用户可以设置同步频率。
- 支持根据日期或标签创建文件夹来存储同步的数据。
- 提供设置页面，用户可以配置 API Token、同步频率、文件夹路径等。

## 安装

1. 克隆此仓库到本地。
2. 确保您的 NodeJS 版本至少为 v16。
3. 运行 `npm i` 或 `yarn` 来安装依赖。
4. 运行 `npm run dev` 来启动编译。

## 使用

- 在 Obsidian 中启用插件。
- 在设置页面中输入您的 API Token 和其他配置。
- 使用左侧栏图标或命令来同步数据。

## 设置

- **Source platform**: 选择数据来源平台。
- **API Token**: 在 Iweaver 网页应用的设置页面创建 API 密钥。
- **Folder**: 选择数据存储的文件夹形式。
- **Frequency**: 输入自动同步的频率（以分钟为单位）。
- **Sync on startup**: 勾选此选项以在应用加载时自动同步。

## 手动安装插件

- 将 `main.js`、`styles.css`、`manifest.json` 复制到您的 vault `VaultFolder/.obsidian/plugins/your-plugin-id/`。

## 代码质量提升（可选）

- 使用 [ESLint](https://eslint.org/) 分析代码以快速发现问题。
- 安装 ESLint：`npm install -g eslint`
- 分析项目代码：`eslint main.ts`

## API 文档

请参阅 [Obsidian API 文档](https://github.com/obsidianmd/obsidian-api) 以获取更多信息。
