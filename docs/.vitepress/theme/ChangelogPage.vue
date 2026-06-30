<template>
  <section class="changelog-page">
    <div class="toolbar">
      <div class="tabs" role="tablist" aria-label="更新日志类型">
        <button
          type="button"
          :class="{ active: activeTab === 'commits' }"
          @click="setActiveTab('commits')"
        >
          近期提交
        </button>
        <button
          type="button"
          :class="{ active: activeTab === 'releases' }"
          @click="setActiveTab('releases')"
        >
          版本发布
        </button>
      </div>
      <button type="button" class="refresh-btn" :disabled="loading" @click="loadChangelog(currentPage, activeTab)">
        {{ loading ? '加载中' : '刷新' }}
      </button>
    </div>

    <div v-if="loading" class="state-panel">
      正在从 GitHub 获取更新日志...
    </div>

    <div v-else-if="error" class="state-panel error">
      <strong>加载失败</strong>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="currentItems.length === 0" class="state-panel">
      暂无可展示的{{ activeTab === 'releases' ? '版本发布' : '提交记录' }}。
    </div>

    <template v-else-if="activeTab === 'commits'">
      <div class="commit-timeline">
        <section v-for="group in commitGroups" :key="group.dateKey" class="commit-day">
          <div class="commit-rail">
            <span class="commit-node"></span>
          </div>
          <div class="commit-day-content">
            <h2 class="commit-day-title">Commits on {{ formatCommitGroupDate(group.date) }}</h2>
            <div class="commit-card">
              <article v-for="item in group.items" :key="item.id" class="commit-row">
                <div class="commit-title">
                  <template v-for="(token, tokenIndex) in tokenizeText(item.title)" :key="tokenIndex">
                    <a
                      v-if="token.url"
                      :href="token.url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ token.text }}
                    </a>
                    <span v-else>{{ token.text }}</span>
                  </template>
                </div>
                <div class="commit-meta">
                  <img
                    v-if="item.authorAvatar"
                    :src="item.authorAvatar"
                    :alt="item.authorName"
                    class="commit-avatar"
                    loading="lazy"
                  >
                  <span v-else class="commit-avatar fallback">{{ item.authorInitial }}</span>
                  <a
                    v-if="item.authorUrl"
                    :href="item.authorUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ item.authorName }}
                  </a>
                  <span v-else>{{ item.authorName }}</span>
                  <span>committed {{ formatRelativeTime(item.date) }}</span>
                  <a class="commit-sha" :href="item.url" target="_blank" rel="noopener noreferrer">
                    {{ item.shaShort }}
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template v-else>
      <div class="timeline">
        <article
          v-for="item in currentItems"
          :key="item.id"
          class="timeline-item"
        >
          <div class="timeline-dot"></div>
          <div class="entry">
            <div class="entry-head">
              <div>
                <p class="entry-type">{{ item.typeLabel }}</p>
                <h2 class="entry-title">
                  <template v-for="(token, tokenIndex) in tokenizeText(item.title)" :key="tokenIndex">
                    <a
                      v-if="token.url"
                      :href="token.url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ token.text }}
                    </a>
                    <span v-else>{{ token.text }}</span>
                  </template>
                </h2>
              </div>
              <time :datetime="item.date">{{ formatDate(item.date) }}</time>
            </div>

            <ReleaseNotesMarkdown
              v-if="item.body"
              :body="item.body"
              :repo-url="repoUrl"
              :scrollable="false"
            />
          </div>
        </article>
      </div>
    </template>

    <nav v-if="!loading && !error && totalPages > 1" class="pagination" aria-label="更新日志分页">
      <button type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        上一页
      </button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
        下一页
      </button>
    </nav>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ReleaseNotesMarkdown from './ReleaseNotesMarkdown.vue'

const owner = 'MoeKoeMusic'
const repo = 'MoeKoeMusic'
const repoUrl = `https://github.com/${owner}/${repo}`
const pageSizeMap = {
  commits: 15,
  releases: 8
}

const activeTab = ref('commits')
const currentPage = ref(1)
const loading = ref(true)
const error = ref('')
const releases = ref([])
const commits = ref([])
const commitsTotalPages = ref(1)
const releasesTotalPages = ref(1)

const currentItems = computed(() => activeTab.value === 'releases' ? releases.value : commits.value)
const totalPages = computed(() => activeTab.value === 'releases' ? releasesTotalPages.value : commitsTotalPages.value)
const commitGroups = computed(() => {
  const groups = []
  const groupMap = new Map()

  for (const item of commits.value) {
    const date = new Date(item.date)
    const dateKey = Number.isNaN(date.getTime()) ? 'unknown' : date.toISOString().slice(0, 10)

    if (!groupMap.has(dateKey)) {
      const group = {
        dateKey,
        date: item.date,
        items: []
      }
      groupMap.set(dateKey, group)
      groups.push(group)
    }

    groupMap.get(dateKey).items.push(item)
  }

  return groups
})

const getApiUrl = (tab, page) => {
  const endpoint = tab === 'releases' ? 'releases' : 'commits'
  const perPage = pageSizeMap[tab] || 10

  return `https://api.github.com/repos/${owner}/${repo}/${endpoint}?per_page=${perPage}&page=${page}`
}

const requestJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText || 'GitHub API 请求失败'}`.trim())
  }

  return {
    data: await response.json(),
    totalPages: getTotalPagesFromLinkHeader(response.headers.get('Link'))
  }
}

const getTotalPagesFromLinkHeader = (linkHeader) => {
  if (!linkHeader) return 1

  const lastLink = linkHeader
    .split(',')
    .map(part => part.trim())
    .find(part => part.includes('rel="last"'))

  if (!lastLink) return 1

  const match = lastLink.match(/[?&]page=(\d+)/)
  return match ? Number(match[1]) : 1
}

const normalizeBodyLines = (body = '') => {
  return String(body)
    .split(/\r?\n/)
    .map(line => line.trimEnd())
    .filter((line, index, lines) => {
      if (line.trim()) return true
      return index > 0 && index < lines.length - 1
    })
}

const normalizeRelease = (release) => ({
  id: release.id,
  type: 'release',
  typeLabel: release.prerelease ? '预发布' : 'Release',
  title: release.name || release.tag_name,
  url: release.html_url,
  date: release.published_at || release.created_at,
  body: release.body || ''
})

const normalizeCommit = (commit) => {
  const message = commit.commit?.message || ''
  const [title = commit.sha.slice(0, 7), ...body] = message.split(/\r?\n/)
  const authorName = commit.commit?.author?.name || commit.author?.login || ''
  const authorInitial = authorName.trim().slice(0, 1).toUpperCase() || '?'

  return {
    id: commit.sha,
    type: 'commit',
    typeLabel: 'Commit',
    title,
    url: commit.html_url,
    date: commit.commit?.author?.date || commit.commit?.committer?.date,
    shaShort: commit.sha.slice(0, 7),
    authorName,
    authorInitial,
    authorAvatar: commit.author?.avatar_url || '',
    authorUrl: commit.author?.html_url || '',
    meta: `${commit.sha.slice(0, 7)}${authorName ? ` · ${authorName}` : ''}`,
    lines: normalizeBodyLines(body.join('\n'))
  }
}

const loadChangelog = async (page = currentPage.value, tab = activeTab.value) => {
  loading.value = true
  error.value = ''

  try {
    const normalizedPage = Math.max(1, page)
    const result = await requestJson(getApiUrl(tab, normalizedPage))
    const items = Array.isArray(result.data) ? result.data : []

    if (tab === 'releases') {
      releases.value = items.map(normalizeRelease)
      releasesTotalPages.value = Math.max(1, result.totalPages)
    } else {
      commits.value = items.map(normalizeCommit)
      commitsTotalPages.value = Math.max(1, result.totalPages)
    }

    activeTab.value = tab
    currentPage.value = normalizedPage
  } catch (loadError) {
    error.value = loadError?.message || '无法获取 GitHub 更新日志'
  } finally {
    loading.value = false
  }
}

const setActiveTab = (tab) => {
  if (activeTab.value === tab) return
  void loadChangelog(1, tab)
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  void loadChangelog(page, activeTab.value)
}

const formatDate = (dateValue) => {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(dateValue))
}

const formatCommitGroupDate = (dateValue) => {
  if (!dateValue) return 'Unknown date'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateValue))
}

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return ''

  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000))
  const units = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60]
  ]

  for (const [unit, seconds] of units) {
    const value = Math.floor(diffSeconds / seconds)
    if (value >= 1) {
      return `${value} ${unit}${value > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

const tokenizeText = (text) => {
  const tokens = []
  const pattern = /(https?:\/\/[^\s)]+)|#(\d+)/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, match.index) })
    }

    if (match[1]) {
      tokens.push({ text: match[1], url: match[1] })
    } else {
      tokens.push({
        text: match[0],
        url: `${repoUrl}/issues/${match[2]}`
      })
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex) })
  }

  return tokens
}

onMounted(loadChangelog)
</script>

<style scoped>
.changelog-page {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 0 48px;
}

.toolbar,
.tabs,
.entry-head {
  display: flex;
  align-items: center;
}

.refresh-btn,
.tabs button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
}

.toolbar {
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 20px;
}

.tabs {
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.tabs button,
.refresh-btn {
  cursor: pointer;
}

.tabs button {
  padding: 8px 14px;
  border-color: transparent;
}

.tabs button.active {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.refresh-btn {
  padding: 10px 16px;
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.state-panel {
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.state-panel.error {
  display: grid;
  gap: 6px;
  border-color: var(--vp-c-danger-2);
  color: var(--vp-c-danger-1);
}

.commit-timeline {
  display: grid;
  gap: 18px;
}

.commit-day {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 14px;
}

.commit-rail {
  position: relative;
  display: flex;
  justify-content: center;
}

.commit-rail::after {
  content: '';
  position: absolute;
  top: 34px;
  bottom: -18px;
  width: 2px;
  background: var(--vp-c-divider);
}

.commit-node {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 11px;
  border: 2px solid var(--vp-c-text-3);
  border-radius: 50%;
  background: var(--vp-c-bg);
}

.commit-day-title {
  margin: 0 0 12px;
  border: 0;
  padding: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
}

.commit-card {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.commit-row {
  padding: 12px 16px;
}

.commit-row + .commit-row {
  border-top: 1px solid var(--vp-c-divider);
}

.commit-title {
  color: var(--vp-c-text-1);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
}

.commit-title a {
  color: var(--vp-c-brand-1);
}

.commit-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.4;
}

.commit-meta a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.commit-meta a:hover {
  color: var(--vp-c-brand-1);
}

.commit-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.commit-avatar.fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 700;
}

.commit-sha {
  margin-left: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.timeline {
  position: relative;
  display: grid;
  gap: 18px;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 10px;
  width: 2px;
  background: var(--vp-c-divider);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 16px;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  width: 20px;
  height: 20px;
  margin-top: 22px;
  border: 4px solid var(--vp-c-bg);
  border-radius: 50%;
  background: var(--vp-c-brand-1);
}

.entry {
  padding: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.entry-head {
  justify-content: space-between;
  gap: 16px;
}

.entry-type {
  margin: 0 0 6px;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.entry h2 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 21px;
  line-height: 1.35;
}

.entry-title a {
  color: var(--vp-c-brand-1);
}

.entry time {
  color: var(--vp-c-text-3);
  font-size: 13px;
  white-space: nowrap;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 22px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.pagination button {
  padding: 7px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 640px) {
  .toolbar,
  .entry-head {
    align-items: stretch;
    flex-direction: column;
  }

  .tabs {
    width: 100%;
  }

  .tabs button {
    flex: 1;
  }

  .refresh-btn {
    width: 100%;
  }

  .commit-day {
    grid-template-columns: 20px 1fr;
    gap: 10px;
  }

  .commit-row {
    padding: 11px 12px;
  }

  .commit-title {
    font-size: 15px;
  }

  .commit-sha {
    margin-left: 0;
  }

  .entry time,
  .entry-meta {
    white-space: normal;
  }
}
</style>
