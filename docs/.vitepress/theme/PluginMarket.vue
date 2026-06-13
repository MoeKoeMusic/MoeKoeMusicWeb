<template>
  <section class="plugin-market">
    <div class="market-toolbar">
      <div class="market-search">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input
          v-model.trim="marketSearch"
          type="search"
          placeholder="搜索插件名称、作者、标签或描述"
          aria-label="搜索插件"
        >
      </div>

      <div class="market-actions">
        <button class="market-button secondary" type="button" @click="openPluginsRepo">
          上架&举报
        </button>
        <button class="market-button primary" type="button" :disabled="marketLoading" @click="fetchMarketPlugins(true)">
          {{ marketLoading ? '加载中' : '刷新市场' }}
        </button>
      </div>
    </div>

    <div class="market-summary" aria-live="polite">
      <strong>{{ filteredMarketPlugins.length }}</strong>
      <span>个可用插件</span>
      <span v-if="marketUpdatedAt">更新于 {{ marketUpdatedAt }}</span>
    </div>

    <div v-if="marketLoading" class="market-state">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p>正在加载插件市场...</p>
    </div>

    <div v-else-if="marketError" class="market-state error">
      <div class="state-icon" aria-hidden="true">!</div>
      <h3>插件市场加载失败</h3>
      <p>{{ marketError }}</p>
      <button class="market-button primary" type="button" @click="fetchMarketPlugins(true)">重试</button>
    </div>

    <div v-else-if="pagedMarketPlugins.length > 0" class="market-list">
      <article v-for="plugin in pagedMarketPlugins" :key="plugin.uniqueKey" class="market-item">
        <div class="plugin-main">
          <div class="plugin-icon">
            <img
              v-if="plugin.icon"
              :src="plugin.icon"
              :alt="plugin.name"
              loading="lazy"
              @error="plugin.icon = ''"
            >
            <span v-else aria-hidden="true">{{ getPluginInitial(plugin.name) }}</span>
          </div>

          <div class="plugin-copy">
            <div class="plugin-title-row">
              <h3>
                <a
                  class="plain-link plugin-title-link"
                  :href="plugin.snapshotUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="`查看 ${plugin.name} 的项目地址`"
                  :aria-label="`查看 ${plugin.name} 的项目地址`"
                >
                  {{ plugin.name }}
                </a>
              </h3>
              <span v-if="plugin.minversion" class="version-chip">需 V{{ plugin.minversion }}+</span>
            </div>
            <p>{{ plugin.description || '暂无描述' }}</p>
          </div>
        </div>

        <div class="plugin-meta">
          <span>版本 {{ plugin.version || '未知' }}</span>
          <span>
            作者
            <a
              v-if="plugin.approvedIssueUrl"
              class="plain-link author-link"
              :href="plugin.approvedIssueUrl"
              target="_blank"
              rel="noopener noreferrer"
              :title="`查看 ${plugin.name} 的上架报告`"
              :aria-label="`查看 ${plugin.name} 的上架报告`"
            >
              {{ plugin.author || '未知' }}
            </a>
            <span v-else>{{ plugin.author || '未知' }}</span>
          </span>
        </div>

        <div v-if="plugin.tags.length || resolveMarketPermissions(plugin).length" class="plugin-badges">
          <span v-for="tag in plugin.tags" :key="tag" class="tag-chip">{{ tag }}</span>
          <span
            v-for="permission in resolveMarketPermissions(plugin)"
            :key="permission.key"
            class="permission-chip"
          >
            {{ permission.label }}
          </span>
        </div>

        <div class="plugin-footer">
          <span class="status-chip" :class="plugin.downloadUrl ? 'available' : 'unknown'">
            {{ plugin.downloadUrl ? '可下载' : '缺少下载地址' }}
          </span>
          <a
            class="market-button success"
            :class="{ disabled: !plugin.downloadUrl }"
            :href="plugin.downloadUrl || undefined"
            target="_blank"
            rel="noopener noreferrer"
            :aria-disabled="!plugin.downloadUrl"
            @click="handleMissingDownload($event, plugin)"
          >
            下载插件
          </a>
        </div>
      </article>

      <nav v-if="marketTotalPages > 1" class="market-pagination" aria-label="插件市场分页">
        <button class="market-button secondary small" type="button" :disabled="marketPage === 1" @click="marketPage -= 1">
          上一页
        </button>
        <span>第 {{ marketPage }} / {{ marketTotalPages }} 页</span>
        <button
          class="market-button secondary small"
          type="button"
          :disabled="marketPage === marketTotalPages"
          @click="marketPage += 1"
        >
          下一页
        </button>
      </nav>
    </div>

    <div v-else class="market-state">
      <div class="state-icon" aria-hidden="true">⌕</div>
      <h3>{{ marketPlugins.length === 0 ? '暂无可用插件' : '没有匹配的插件' }}</h3>
      <p>{{ marketPlugins.length === 0 ? '插件市场当前没有可展示的插件。' : '换个关键词试试。' }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const MARKET_URL = 'https://raw.githubusercontent.com/MoeKoeMusic/MoeKoeMusic-Plugins/refs/heads/main/plugins.json'
const MARKET_PAGE_SIZE = 8

const marketPlugins = ref([])
const marketLoading = ref(false)
const marketLoaded = ref(false)
const marketError = ref('')
const marketSearch = ref('')
const marketPage = ref(1)
const marketUpdatedAt = ref('')

const filteredMarketPlugins = computed(() => {
  const keyword = marketSearch.value.trim().toLowerCase()
  if (!keyword) {
    return marketPlugins.value
  }

  return marketPlugins.value.filter(plugin => {
    const text = [
      plugin.name,
      plugin.description,
      plugin.author,
      plugin.id,
      plugin.directory,
      ...(plugin.tags || [])
    ].filter(Boolean).join(' ').toLowerCase()

    return text.includes(keyword)
  })
})

const marketTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredMarketPlugins.value.length / MARKET_PAGE_SIZE))
})

const pagedMarketPlugins = computed(() => {
  const start = (marketPage.value - 1) * MARKET_PAGE_SIZE
  return filteredMarketPlugins.value.slice(start, start + MARKET_PAGE_SIZE)
})

watch(marketSearch, () => {
  marketPage.value = 1
})

watch(filteredMarketPlugins, () => {
  if (marketPage.value > marketTotalPages.value) {
    marketPage.value = marketTotalPages.value
  }
})

const fetchMarketPlugins = async (force = false) => {
  if (!force && marketLoaded.value) {
    return
  }

  marketLoading.value = true
  marketError.value = ''

  try {
    const response = await fetch(MARKET_URL, {
      method: 'GET',
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText || ''}`.trim())
    }

    const payload = await response.json()
    const normalized = normalizeMarketPayload(payload)

    marketPlugins.value = normalized.filter(plugin => plugin.status === 'active')
    marketLoaded.value = true
    marketPage.value = 1
    marketUpdatedAt.value = formatDateTime(new Date())
  } catch (error) {
    marketPlugins.value = []
    marketLoaded.value = false
    marketError.value = error?.message || '无法读取插件市场数据'
    console.error('Failed to fetch plugin market:', error)
  } finally {
    marketLoading.value = false
  }
}

const normalizeMarketPayload = payload => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.plugins || payload?.items || payload?.data || []

  if (!Array.isArray(list)) {
    throw new Error('插件市场数据格式不正确')
  }

  return list.map((item, index) => normalizeMarketPlugin(item, index)).filter(Boolean)
}

const normalizeMarketPlugin = (item, index) => {
  if (!item || typeof item !== 'object') {
    return null
  }

  const snapshot = item.snapshot && typeof item.snapshot === 'object' ? item.snapshot : {}
  const id = String(item.id || item.pluginId || `plugin-${index}`).trim()
  const name = String(item.name || '').trim()

  if (!name) {
    return null
  }

  return {
    uniqueKey: id || `${name}-${index}`,
    id,
    name,
    directory: id,
    version: String(item.version || '').trim(),
    description: String(item.description || '').trim(),
    author: String(item.author || '').trim(),
    status: String(item.status || 'active').trim().toLowerCase(),
    icon: normalizeUrl(item.iconUrl || item.icon || ''),
    tags: Array.isArray(item.tags) ? item.tags.map(tag => String(tag).trim()).filter(Boolean) : [],
    repositoryUrl: normalizeUrl(item.repositoryUrl || item.repository || ''),
    snapshotUrl: normalizeUrl(snapshot.snapshotUrl || item.snapshotUrl || ''),
    approvedIssueUrl: normalizeUrl(item.approvedIssueUrl || ''),
    downloadUrl: normalizeUrl(item.downloadUrl || ''),
    branch: String(snapshot.branch || item.branch || '').trim(),
    commitSha: String(snapshot.commitSha || item.commitSha || '').trim(),
    minversion: item.minversion || item.minVersion || '',
    permissions: {
      networkAccess: item.networkAccess === true,
      fileAccess: item.fileAccess === true,
      binaryContent: item.binaryContent === true,
      storageAccess: item.storageAccess === true
    }
  }
}

const normalizeUrl = value => {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    return trimmed.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/')
  }

  return trimmed
}


const resolveMarketPermissions = plugin => {
  const permissions = plugin?.permissions || {}

  return [
    {
      key: 'networkAccess',
      label: '联网访问',
      enabled: permissions.networkAccess === true
    },
    {
      key: 'fileAccess',
      label: '文件访问',
      enabled: permissions.fileAccess === true
    },
    {
      key: 'binaryContent',
      label: '含二进制',
      enabled: permissions.binaryContent === true
    },
    {
      key: 'storageAccess',
      label: '存储权限',
      enabled: permissions.storageAccess === true
    }
  ].filter(permission => permission.enabled)
}

const getPluginInitial = name => {
  return String(name || 'P').trim().slice(0, 1).toUpperCase()
}

const formatDateTime = date => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleMissingDownload = (event, plugin) => {
  if (!plugin.downloadUrl) {
    event.preventDefault()
  }
}

const openPluginsRepo = () => {
  window.open('https://github.com/MoeKoeMusic/MoeKoeMusic-Plugins', '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  fetchMarketPlugins()
})
</script>

<style scoped>
.plugin-market {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 20px;
}

.market-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.market-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 260px;
  flex: 1;
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.search-icon {
  width: 18px;
  color: var(--vp-c-text-2);
  font-size: 18px;
  line-height: 1;
}

.market-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.market-actions,
.plugin-footer,
.market-pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.market-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.market-summary strong {
  color: var(--vp-c-brand);
}

.market-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.market-item {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.plugin-main {
  display: flex;
  gap: 14px;
  min-width: 0;
}

.plugin-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #14b8a6);
  color: white;
  font-weight: 800;
  font-size: 22px;
}

.plugin-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plugin-copy {
  min-width: 0;
}

.plugin-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.plugin-title-row h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 17px;
  line-height: 1.35;
}

.plugin-copy p {
  display: -webkit-box;
  margin: 6px 0 0;
  overflow: hidden;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.plugin-meta,
.plugin-badges {
  display: flex;
  gap: 8px 14px;
  flex-wrap: wrap;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.plain-link {
  color: inherit;
  text-decoration: none;
  text-underline-offset: 3px;
}

.author-link {
  color: var(--vp-c-brand);
}

.plain-link:hover {
  text-decoration: underline;
}

.plain-link:focus-visible {
  outline: 2px solid var(--vp-c-brand);
  outline-offset: 3px;
  border-radius: 4px;
}

.tag-chip,
.permission-chip,
.version-chip,
.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.tag-chip {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.permission-chip,
.version-chip {
  background: rgba(180, 83, 9, 0.12);
  color: #92400e;
}

.status-chip.available {
  background: rgba(22, 163, 74, 0.13);
  color: #166534;
}

.status-chip.unknown {
  background: rgba(107, 114, 128, 0.14);
  color: #4b5563;
}

.plugin-footer {
  justify-content: space-between;
  margin-top: auto;
}

.market-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
}

.market-button:hover:not(:disabled):not(.disabled) {
  transform: translateY(-1px);
  text-decoration: none;
  color: white;
}

.market-button:disabled,
.market-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.market-button.primary {
  background: #2563eb;
}

.market-button.secondary {
  background: #64748b;
}

.market-button.success {
  background: #16a34a;
}

.market-button.small {
  min-height: 32px;
  padding: 0 10px;
  font-size: 13px;
}

.market-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  text-align: center;
}

.market-state h3,
.market-state p {
  margin: 0;
}

.market-state h3 {
  color: var(--vp-c-text-1);
}

.market-state.error {
  border-color: rgba(220, 38, 38, 0.24);
  background: rgba(254, 242, 242, 0.7);
}

.dark .market-state.error {
  background: rgba(127, 29, 29, 0.18);
}

.state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 24px;
  font-weight: 800;
}

.loading-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: market-spin 0.9s linear infinite;
}

.market-pagination {
  grid-column: 1 / -1;
  justify-content: center;
  margin-top: 4px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.dark .tag-chip {
  background: rgba(96, 165, 250, 0.18);
  color: #bfdbfe;
}

.dark .permission-chip,
.dark .version-chip {
  background: rgba(251, 191, 36, 0.18);
  color: #fde68a;
}

.dark .status-chip.available {
  background: rgba(34, 197, 94, 0.18);
  color: #bbf7d0;
}

.dark .status-chip.unknown {
  background: rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

@keyframes market-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 860px) {
  .market-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .market-toolbar,
  .market-actions,
  .market-search {
    width: 100%;
  }

  .market-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .market-actions .market-button,
  .plugin-footer .market-button {
    flex: 1;
  }

  .plugin-main {
    align-items: flex-start;
  }
}
</style>
