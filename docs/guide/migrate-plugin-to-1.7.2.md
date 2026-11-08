# 迁移插件到 1.7.2 或更高版本

从 MoeKoe Music **1.7.2** 开始，客户端默认不再在本机 `6521` 端口开放 Web API 服务。

如果你的插件是这样请求接口的：

```js
const response = await fetch('http://127.0.0.1:6521/playlist/detail?ids=collection_3_25230245_24_0')
const data = await response.json()
```

那么在 1.7.2 及更高版本中，这段代码会直接失败：连接被拒绝、抛出 `Failed to fetch`，或者拿到一个空响应。依赖它的功能（歌单详情、搜索结果、用户信息、上传头像等）随之失效。

::: warning 适用范围
本文面向插件开发者。普通用户无需做任何操作，也不建议为了旧插件而手动开放本地端口。
:::

## 为什么不再默认开放

旧方案要求客户端在启动时常驻一个本地 HTTP 服务，这带来两个问题：

- **安全性**：本机任意程序、任意网页脚本都能直接访问该端口，绕过插件的权限体系。
- **可靠性**：端口可能被占用，服务可能启动失败，用户也需要多开一个后台进程。

因此客户端把「开放本地 API」改成了需要用户显式开启的能力（API 模式），并给插件提供了不依赖端口的调用方式。

## 两种迁移方式

| 方式 | 推荐 | 需要声明权限 | 需要用户开启 API 模式 |
| --- | --- | --- | --- |
| 方案一：`kugouapi.request()` | ✅ 推荐 | 否 | 否 |
| 方案二：`electronAPI.getApiModeUrl()` | ❌ 不推荐 | `moekoe:apiMode` | 是 |

## 方案一：改用 `kugouapi.request()`（推荐）

`kugouapi` 是客户端通过 preload 注入到页面主世界的全局对象，它把请求直接交给客户端内置的 API 服务处理，**不经过任何网络端口**。因此没有端口占用、没有 CORS、也不会因为用户没开 API 模式而失败。

目前提供三个方法：

- `kugouapi.request(path, payload?)`：调用内置 API 服务。
- `kugouapi.getDevice()`：读取当前设备信息。
- `kugouapi.generateNewDevice()`：重置设备信息（只能在萌音设置页操作，插件内调用会被拒绝）。

调用 `kugouapi.request()` 不需要在 `manifest.json` 中声明任何额外权限。

### GET 请求

把地址里的协议、域名和端口去掉，只保留以 `/` 开头的路径，查询串可以原样保留：

```js
// 旧写法
fetch('http://127.0.0.1:6521/playlist/detail?ids=collection_3_25230245_24_0'); // [!code --]
// 新写法
kugouapi.request('/playlist/detail?ids=collection_3_25230245_24_0'); // [!code ++]

// 旧写法：还要手动解析响应
const response = await fetch('http://127.0.0.1:6521/playlist/detail?ids=collection_3_25230245_24_0') // [!code --]
const data = await response.json() // [!code --]
// 新写法：返回的已经是解析好的对象
const { body } = await kugouapi.request('/playlist/detail?ids=collection_3_25230245_24_0') // [!code ++]
```

::: tip 不要再调用 `.json()`
`kugouapi.request()` 返回的是已经解析完成的接口结果，不是 `Response` 对象。对结果调用 `.json()` 会得到 `undefined is not a function` 之类的错误。
:::

### POST 请求与请求体

需要发送请求体时，把它放进 `payload.params`。旧的 `method`、`Content-Type` 会自动由内置请求处理，不需要再手写：

```js
fetch('http://127.0.0.1:6521/user/update/avatar', { // [!code --]
	method: 'POST', // [!code --]
	headers: { Authorization: '...', 'Content-Type': 'application/octet-stream' }, // [!code --]
	body: JSON.stringify({ imgFile: 'data:image/png;base64,...' }) // [!code --]
}); // [!code --]
kugouapi.request('/user/update/avatar', { // [!code ++]
	params: { imgFile: 'data:image/png;base64,...' }, // [!code ++]
	headers: { Authorization: '...' } // [!code ++]
}); // [!code ++]
```

### 参数说明

`kugouapi.request(path, payload?)` 的第二个参数支持以下字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `params` | `object` | 接口请求体参数。路径查询串里的参数会与它合并，`params` 优先 |
| `cookie` | `string \| object` | 认证 Cookie，支持 Cookie 字符串或键值对象 |
| `headers` | `object` | 请求头。其中 `Authorization` / `authorization` 会被当作 Cookie 解析 |

几点需要注意：

- **查询参数写在路径里**。`/playlist/detail?ids=xxx` 中的 `ids` 会被解析成参数，与 `params` 合并后一起提交。
- **设备信息自动注入**。客户端会自动补上设备标识（`dev`、`uuid`、`mac`、`mid`、`webgl`、`platform`），并保留 `KUGOU_API_*` 兼容字段，不需要自己伪造设备信息。
- **登录态走 `cookie` 或 `headers.Authorization`**。旧的 `fetch` 写法里把登录票据放在 `Authorization` 头中的习惯可以原样保留。

### 返回值

返回的是内置 API 模块的原始结果，通常形如：

```js
{
	status: 200,
	body: { /* 接口数据 */ },
	cookie: [ /* 服务端下发的 Cookie */ ],
	headers: { /* 响应头 */ }
}
```

两个容易踩的点：

- **路径不存在时不会报错**，而是返回 `status: 404`、`body.error_msg: 'Not Found'`。请检查路径是否拼错、是否多写了域名和端口。
- **请求过程中出错时，返回的是错误对象本身**，不会向调用方抛出异常。所以业务代码里要先判断 `status`，再读取 `body`。

```js
const result = await kugouapi.request('/playlist/detail?ids=collection_3_25230245_24_0')
if (result?.status !== 200) {
	// 404、参数错误或请求失败
	throw new Error(result?.body?.error_msg || '请求失败')
}
const detail = result.body
```

### 在哪里可以使用

`kugouapi` 挂在**页面主世界的 `window`** 上，所以：

- ✅ 插件弹窗页（`action.default_popup`）、插件自己的独立页面：可以直接用。
- ✅ 注入到页面主世界的脚本：可以用（`content_scripts` 声明 `"world": "MAIN"`，或通过 `chrome.scripting.executeScript` 指定 `world: 'MAIN'`）。
- ❌ 默认的 content script 运行在**隔离世界**，访问不到 `window.kugouapi`。
- ❌ 后台 service worker 里没有 `window`，同样用不了。

如果请求只能从隔离世界或后台发起，可以二选一：

1. 把请求挪到插件页面或 `MAIN` 世界的脚本里，用 `chrome.runtime.sendMessage` 把结果转发回去。
2. 或改用下面的方案二。

::: warning 常见报错
在隔离世界或 service worker 中调用会得到 `kugouapi is not defined`。这不是插件没加载成功，而是运行环境不对。
:::

## 方案二：继续使用本地 HTTP 服务（不推荐）

如果你确实需要保留原来的 `fetch` 写法（例如插件以 iframe / 外部页面方式工作），可以让插件申请打开 API 模式的能力。

::: warning 不推荐的理由
这种方式仍然需要用户手动开启 API 模式、仍然会暴露本地端口，并且一旦用户关闭 API 模式，插件**不会被加载**。新插件请优先选择方案一。
:::

### 第一步：声明权限

在 `manifest.json` 的 `moekoe_permissions` 中申请 `apiMode`：

```jsonc
{
	// ...,
	"minversion": "1.7.2", // 推荐提高最低版本要求
	// ...,
	"moekoe_permissions": [
		// ...,
		"apiMode" // 或者 "moekoe:apiMode"
	],
	// ...,
}
```

两种写法等价，客户端都会归一化成 `moekoe:apiMode`。插件权限声明的更多说明见 [进阶插件开发教程](/guide/advanced-plugin-development)。

### 第二步：获取 API 终结点

在主世界中调用 `electronAPI.getApiModeUrl()`：

```js
const apiModeUrl = await electronAPI.getApiModeUrl(); // { http: string, ws: string } | null

const webApiEndpoint = apiModeUrl?.http;
await fetch(`${webApiEndpoint}/playlist/detail?ids=collection_3_25230245_24_0`);
```

返回值说明：

- `http`：形如 `http://127.0.0.1:<端口>` 的 HTTP 终结点。
- `ws`：形如 `ws://127.0.0.1:<端口><路径>` 的 WebSocket 终结点。
- 端口与 WebSocket 路径取自客户端的 `apiModeConfig`（默认端口 `6520`、路径 `/moekoe`），可能被用户改过，所以**不要写死 `6521` 或任何固定端口**。
- 用户关闭 API 模式时返回 `null`。

### 用户侧的行为

API 模式由用户在客户端设置中控制（`设置` → `系统` → `API模式`，修改后需重启生效），共有三种状态：

| 设置值 | 行为 |
| --- | --- |
| `off`（关闭） | 不启动本地服务；申请了 `moekoe:apiMode` 的插件**不会被加载** |
| `auto`（自动） | 只要检测到有插件申请了 `moekoe:apiMode`，就自动启动本地服务 |
| `on`（开启） | 始终启动本地服务 |

::: tip 不必处理 `null`
插件申请了该权限后，API 模式关闭时插件根本不会被加载，所以 `getApiModeUrl()` 返回 `null` 的情况通常不会发生。做一次兜底判断也不算错，但不要指望用户会因此看到提示。
:::

## 常见问题

### `kugouapi is not defined`

调用环境不是页面主世界。content script 默认运行在隔离世界，service worker 中没有 `window`，两者都访问不到 `kugouapi`。请把请求改到插件页面或 `MAIN` 世界的脚本中发起。

### 接口一直返回 `status: 404`

`path` 写错了。注意路径必须以 `/` 开头、需要去掉域名和端口，并且要和内置 API 的路径完全一致（例如 `/playlist/detail`，而不是 `/api/playlist/detail`）。

### 登录态丢了

旧的 `fetch` 依赖浏览器自动带 Cookie，新接口不会。请把登录票据显式放进 `payload.cookie`，或保持旧习惯放进 `payload.headers.Authorization`。

### `params` 传了但服务端没收到

检查参数应该放在查询串还是请求体：能被路径查询串表达的参数，和旧 `fetch` 一样写在路径里最稳妥（`/xx/detail?ids=...`）；请求体参数才放进 `params`。

## 相关文档

- [基础插件开发教程](/guide/basic-plugin-development)
- [进阶插件开发教程](/guide/advanced-plugin-development)
- [Web API 文档](/api-docs)
