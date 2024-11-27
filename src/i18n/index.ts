import * as zh_CN from './zh-CN.json';
import * as en from './en.json';
// 添加中文资源
i18next.addResourceBundle('zh', 'plugin-iweaver-sync', zh_CN);
// 添加英文资源 
i18next.addResourceBundle('en', 'plugin-iweaver-sync', en);

export const t = i18next.getFixedT(null, 'plugin-iweaver-sync', null);
