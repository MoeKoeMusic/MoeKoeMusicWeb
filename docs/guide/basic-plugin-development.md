# 基础插件开发教程

MoeKoe Music 的基础插件基于 Chromium / Chrome Extension 机制，使用 Manifest V3 格式。适合开发界面增强、快捷入口、页面辅助、数据展示等基础功能的插件。

示例插件： [MoeKoeMusic/moekoe-helper](https://github.com/MoeKoeMusic/moekoe-helper)

## 参考文档

- Chrome 插件开发文档： [Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- Manifest V3 文档： [Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- Electron 扩展文档： [Electron Extensions](https://www.electronjs.org/docs/latest/api/extensions)

MoeKoe Music 运行在 Electron 中，所以插件能力以 Chromium 扩展能力为基础，但最终兼容性以 MoeKoe Music 客户端实际加载结果为准。

## 插件目录结构

一个基础插件至少需要 `manifest.json`。常见结构如下：

```text
moekoe-helper/
├─ manifest.json
├─ popup.html
├─ popup.js
├─ background.js
└─ icons/
   └─ icon.png
```

`manifest.json` 是插件清单文件，MoeKoe Music 会读取它来识别插件名称、版本、权限、弹窗入口等信息。

## 最小 manifest 示例

```json
{
  "manifest_version": 3,
  "name": "MoeKoe Helper",
  "version": "1.0.0",
  "description": "一个 MoeKoe Music 基础插件示例",
  "author": {
    "name": "MoeKoe Music",
    "url": "https://github.com/MoeKoeMusic"
  },
  "moekoe": true,
  "plugin_id": "moekoe-helper",
  "minversion": "1.6.6",
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "128": "icons/icon.png"
  },
  "permissions": [
    "storage"
  ]
}
```

字段说明：

- `manifest_version`：必须为 `3`。
- `name`：插件名称，会显示在插件管理页。
- `version`：插件版本。
- `description`：插件描述。
- `author`：插件作者信息。
- `moekoe`：建议设置为 `true`，表示插件已针对 MoeKoe Music 适配。
- `plugin_id`：稳定插件 ID，建议使用仓库名或包名。
- `minversion`：插件要求的 MoeKoe Music 最低版本。
- `action.default_popup`：插件弹窗页面。
- `permissions`：插件需要的 Chrome 扩展权限。

## 编写弹窗页面

`popup.html` 可以是普通 HTML 页面：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>MoeKoe Helper</title>
</head>
<body>
  <button id="save">保存设置</button>
  <script src="popup.js"></script>
</body>
</html>
```

`popup.js` 可以使用 Chrome 扩展 API：

```js
document.getElementById('save').addEventListener('click', async () => {
  await chrome.storage.local.set({
    enabled: true
  })
})
```

如果插件声明了 `action.default_popup`，MoeKoe Music 的插件管理页会显示“打开弹窗”按钮。

## 安装和调试

开发时可以通过插件目录安装：

1. 打开 MoeKoe Music。
2. 进入 **设置**。
3. 进入 **插件** 分类。
4. 点击 **打开插件目录**。
5. 将插件文件夹放入该目录。
6. 点击 **刷新插件**。

也可以将插件打包为 zip，通过 **安装插件** 选择 zip 文件安装。

插件 zip 包需要包含一个顶层插件目录，并且该目录下必须存在 `manifest.json`：

```text
moekoe-helper.zip
└─ moekoe-helper/
   ├─ manifest.json
   ├─ popup.html
   └─ popup.js
```

## 适合基础插件的功能

- 添加一个插件弹窗，用于展示信息或保存插件配置。
- 通过 Chrome 扩展 API 保存本地插件设置。
- 对页面做增强的主题类。
- 提供常用链接、辅助工具或状态展示。

如果插件需要启动本地程序、访问系统级能力或与外部二进制程序通信，请参考 [进阶插件开发教程](/guide/advanced-plugin-development)。
