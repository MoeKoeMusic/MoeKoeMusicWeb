<template>
  <div v-if="loading" class="loading">
    <div class="loading-spinner"></div>
    <div class="loading-text">{{ t.loading }}</div>
  </div>

  <div v-else-if="error" class="error">
    <div class="error-icon">⚠</div>
    <div class="error-message">{{ error }}</div>
    <button @click="fetchReleaseInfo" class="retry-button">{{ t.retry }}</button>
  </div>

  <div v-else class="download-section">
    <div class="download-header">
      <div class="version-info">
        <div class="version-badge">{{ t.latestVersion }}</div>
        <h2 class="version-number">{{ releases.tag_name }}</h2>
        <p class="release-date">{{ t.releasedOn }} {{ formatDate(releases.published_at) }}</p>
        <div class="release-notes" v-if="releases.body">
          <details>
            <summary>{{ t.releaseNotes }}</summary>
            <ReleaseNotesMarkdown :body="releases.body" />
          </details>
        </div>
      </div>
      <div class="region-selector">
        <label class="checkbox-label">
          <input type="checkbox" v-model="useProxy">
          <span>{{ t.proxyText }} <span class="region-hint">{{ t.proxyHint }}</span></span>
        </label>
      </div>
    </div>

    <div class="download-options">
      <div class="platform-group" v-if="groupedAssets.windows.length">
        <div class="platform-header">
          <div class="platform-icon-large">💻</div>
          <div>
            <h3 class="platform-title">Windows</h3>
            <span class="platform-count">{{ formatFileCount(groupedAssets.windows.length) }}</span>
          </div>
        </div>
        <div class="platform-downloads">
          <div v-for="asset in groupedAssets.windows" :key="asset?.id" class="download-item">
            <div class="download-item-content">
              <div class="download-item-header">
                <div class="download-item-desc">{{ asset.desc }}</div>
                <div class="download-file-name" :title="asset.fileName">
                  <span class="download-file-label">{{ t.fileName }}</span>
                  <span class="download-file-text">{{ asset.fileName }}</span>
                </div>
              </div>
              <div class="download-item-footer">
                <div class="download-info">{{ formatSize(asset.size) }} MB</div>
                <a :href="useProxy ? `https://gh-proxy.com/${asset.browser_download_url}` : asset.browser_download_url" class="download-button" target="_blank">
                  <span class="download-icon" aria-hidden="true"></span>
                  <span>{{ t.download }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="platform-group" v-if="groupedAssets.mac.length">
        <div class="platform-header">
          <div class="platform-icon-large">🍎</div>
          <div>
            <h3 class="platform-title">macOS</h3>
            <span class="platform-count">{{ formatFileCount(groupedAssets.mac.length) }}</span>
          </div>
        </div>
        <div class="platform-downloads">
          <div v-for="asset in groupedAssets.mac" :key="asset?.id" class="download-item">
            <div class="download-item-content">
              <div class="download-item-header">
                <div class="download-item-desc">{{ asset?.desc }}</div>
                <div class="download-file-name" :title="asset.fileName">
                  <span class="download-file-label">{{ t.fileName }}</span>
                  <span class="download-file-text">{{ asset.fileName }}</span>
                </div>
              </div>
              <div class="download-item-footer">
                <div class="download-info">{{ formatSize(asset.size) }} MB</div>
                <a :href="useProxy ? `https://gh-proxy.com/${asset.browser_download_url}` : asset.browser_download_url" class="download-button" target="_blank">
                  <span class="download-icon" aria-hidden="true"></span>
                  <span>{{ t.download }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="platform-group" v-if="groupedAssets.linux.length">
        <div class="platform-header">
          <div class="platform-icon-large">🐧</div>
          <div>
            <h3 class="platform-title">Linux</h3>
            <span class="platform-count">{{ formatFileCount(groupedAssets.linux.length) }}</span>
          </div>
        </div>
        <div class="platform-downloads">
          <div v-for="asset in groupedAssets.linux" :key="asset?.id" class="download-item">
            <div class="download-item-content">
              <div class="download-item-header">
                <div class="download-item-desc">{{ asset.desc }}</div>
                <div class="download-file-name" :title="asset.fileName">
                  <span class="download-file-label">{{ t.fileName }}</span>
                  <span class="download-file-text">{{ asset.fileName }}</span>
                </div>
              </div>
              <div class="download-item-footer">
                <div class="download-info">{{ formatSize(asset.size) }} MB</div>
                <a :href="useProxy ? `https://gh-proxy.com/${asset.browser_download_url}` : asset.browser_download_url" class="download-button" target="_blank">
                  <span class="download-icon" aria-hidden="true"></span>
                  <span>{{ t.download }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="no-downloads" v-if="!groupedAssets.windows.length && !groupedAssets.mac.length && !groupedAssets.linux.length">
        <div class="no-downloads-icon">📦</div>
        <div class="no-downloads-text">{{ t.noDownloads }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ReleaseNotesMarkdown from './ReleaseNotesMarkdown.vue'

const props = defineProps({
  locale: {
    type: String,
    default: 'zh-CN'
  }
})

const messages = {
  'zh-CN': {
    dateLocale: 'zh-CN',
    loading: '正在获取最新版本信息...',
    retry: '重试',
    latestVersion: '最新版本',
    releasedOn: '发布于',
    releaseNotes: '更新说明',
    proxyText: '我是来自中国大陆',
    proxyHint: ' (使用镜像加速下载)',
    fileName: '文件名',
    download: '下载',
    noDownloads: '暂无可用下载',
    requestFailed: status => `获取失败: ${status}`,
    timeout: '请求超时，请稍后再试',
    fetchFailed: '获取版本信息失败，请稍后再试',
    fileCount: count => `${count} 个文件`,
    assets: {
      windowsInstaller: 'Windows 安装程序',
      linuxAppImage: 'Linux AppImage 可执行文件',
      deb: 'Debian/Ubuntu 安装包',
      macDmg: 'macOS 安装镜像',
      macZip: 'macOS 压缩包',
      other: '其他格式'
    }
  },
  en: {
    dateLocale: 'en-US',
    loading: 'Fetching latest version information...',
    retry: 'Retry',
    latestVersion: 'Latest Version',
    releasedOn: 'Released on',
    releaseNotes: 'Release Notes',
    proxyText: "I'm from Mainland China",
    proxyHint: ' (Use mirror for faster download)',
    fileName: 'File',
    download: 'Download',
    noDownloads: 'No downloads available',
    requestFailed: status => `Request failed: ${status}`,
    timeout: 'Request timeout, please try again later',
    fetchFailed: 'Failed to fetch version information, please try again later',
    fileCount: count => `${count} file${count === 1 ? '' : 's'}`,
    assets: {
      windowsInstaller: 'Windows Installer',
      linuxAppImage: 'Linux AppImage Executable',
      deb: 'Debian/Ubuntu Package',
      macDmg: 'macOS Disk Image',
      macZip: 'macOS Archive',
      other: 'Other Format'
    }
  },
  ja: {
    dateLocale: 'ja-JP',
    loading: '最新バージョン情報を取得中...',
    retry: '再試行',
    latestVersion: '最新バージョン',
    releasedOn: 'リリース日:',
    releaseNotes: '更新内容',
    proxyText: '中国本土からのアクセス',
    proxyHint: ' (ミラーサイトを使用)',
    fileName: 'ファイル名',
    download: 'ダウンロード',
    noDownloads: 'ダウンロード可能なファイルがありません',
    requestFailed: status => `取得に失敗しました: ${status}`,
    timeout: 'タイムアウトしました。後でもう一度お試しください',
    fetchFailed: 'バージョン情報の取得に失敗しました。後でもう一度お試しください',
    fileCount: count => `${count} 個のファイル`,
    assets: {
      windowsInstaller: 'Windows インストーラー',
      linuxAppImage: 'Linux AppImage 実行ファイル',
      deb: 'Debian/Ubuntu パッケージ',
      macDmg: 'macOS インストールイメージ',
      macZip: 'macOS 圧縮ファイル',
      other: 'その他の形式'
    }
  },
  'zh-TW': {
    dateLocale: 'zh-TW',
    loading: '正在獲取最新版本信息...',
    retry: '重試',
    latestVersion: '最新版本',
    releasedOn: '發布於',
    releaseNotes: '更新說明',
    proxyText: '我是來自中國大陸',
    proxyHint: ' (使用鏡像加速下載)',
    fileName: '檔案名',
    download: '下載',
    noDownloads: '暫無可用下載',
    requestFailed: status => `獲取失敗: ${status}`,
    timeout: '請求超時，請稍後再試',
    fetchFailed: '獲取版本信息失敗，請稍後再試',
    fileCount: count => `${count} 個檔案`,
    assets: {
      windowsInstaller: 'Windows 安裝程式',
      linuxAppImage: 'Linux AppImage 可執行檔案',
      deb: 'Debian/Ubuntu 安裝包',
      macDmg: 'macOS 安裝鏡像',
      macZip: 'macOS 壓縮包',
      other: '其他格式'
    }
  }
}

const t = computed(() => messages[props.locale] || messages['zh-CN'])
const releases = ref({})
const loading = ref(true)
const error = ref(null)
const useProxy = ref(false)

const getSystemInfo = fileName => {
  const assets = t.value.assets
  if (fileName.endsWith('.exe')) return { icon: '💻', name: 'Windows', desc: assets.windowsInstaller }
  if (fileName.endsWith('.AppImage')) return { icon: '🐧', name: 'Linux', desc: assets.linuxAppImage }
  if (fileName.endsWith('.deb')) return { icon: '🐧', name: 'Linux (Debian)', desc: assets.deb }
  if (fileName.endsWith('.dmg')) return { icon: '🍎', name: 'macOS', desc: assets.macDmg }
  if (fileName.endsWith('mac.zip')) return { icon: '🍎', name: 'macOS', desc: assets.macZip }
  return { icon: '📦', name: 'Other', desc: assets.other }
}

const groupedAssets = computed(() => {
  return releases.value.assets
    .filter(a => a.size > 10 * 1024 * 1024)
    .reduce((acc, asset) => {
      const info = getSystemInfo(asset.name)
      if (info.name.includes('Windows')) acc.windows.push({ ...asset, fileName: asset.name, ...info })
      else if (info.name.includes('macOS')) acc.mac.push({ ...asset, fileName: asset.name, ...info })
      else if (info.name.includes('Linux')) acc.linux.push({ ...asset, fileName: asset.name, ...info })
      return acc
    }, { windows: [], mac: [], linux: [] })
})

const fetchReleaseInfo = async () => {
  loading.value = true
  error.value = null

  try {
    const apiUrl = 'https://api.github.com/repos/iAJue/MoeKoeMusic/releases/latest'

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(response.status === 403 ? `${errorData.message}` : t.value.requestFailed(response.status))
    }

    releases.value = await response.json()
    loading.value = false
  } catch (e) {
    if (e.name === 'AbortError') {
      error.value = t.value.timeout
    } else {
      error.value = e.message || t.value.fetchFailed
    }
    loading.value = false
  }
}

onMounted(() => {
  fetchReleaseInfo()
})

const formatDate = dateString => {
  const date = new Date(dateString)
  return date.toLocaleDateString(t.value.dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatFileCount = count => t.value.fileCount(count)

const formatSize = bytes => {
  const mb = bytes / 1024 / 1024
  return mb.toFixed(1)
}
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

@keyframes rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

.loading {
  text-align: center;
  padding: 3rem;
  border-radius: 20px;
  margin: 2rem auto;
  max-width: 500px;
  background: linear-gradient(145deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg-mute) 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--vp-c-brand-light), var(--vp-c-brand-dark));
  z-index: 1;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 166, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--vp-c-brand);
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.error {
  text-align: center;
  padding: 3rem;
  border-radius: 20px;
  margin: 2rem auto;
  max-width: 500px;
  background: linear-gradient(145deg, #fff5f5 0%, #fff0f0 100%);
  border: 1px solid rgba(220, 38, 38, 0.1);
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.05);
  animation: fadeIn 0.5s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--vp-c-danger);
  animation: shake 0.5s ease-in-out;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--vp-c-danger-dark);
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.retry-button {
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.retry-button:hover {
  background: var(--vp-c-danger-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
}

.download-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.download-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.version-info {
  text-align: center;
  margin-bottom: 2rem;
  animation: slideDown 0.5s ease-out;
}

.version-badge {
  display: inline-block;
  background: linear-gradient(120deg, var(--vp-c-brand-light) 0%, var(--vp-c-brand-dark) 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(102, 166, 255, 0.3);
}

.version-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rainbow 8s linear infinite;
}

.release-date {
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.release-notes {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 600px;
}

.release-notes summary {
  cursor: pointer;
  color: var(--vp-c-brand);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
  display: inline-block;
}

.release-notes summary:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-brand-dark);
}

.region-selector {
  margin-top: 1rem;
  animation: slideDown 0.6s ease-out;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.checkbox-label:hover {
  background: var(--vp-c-bg-mute);
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.8rem;
  width: 1.3em;
  height: 1.3em;
  border-radius: 4px;
  border: 2px solid var(--vp-c-brand);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.region-hint {
  opacity: 0.7;
  font-size: 0.9em;
}

.download-options {
  display: grid;
  gap: 1.25rem;
  animation: slideUp 0.6s ease-out;
}

.platform-group {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 1.25rem;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg-soft) 78%, transparent), var(--vp-c-bg)),
    var(--vp-c-bg);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.platform-group:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--vp-c-brand) 35%, var(--vp-c-divider));
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.07);
}

.platform-header {
  display: flex;
  align-items: center;
  align-self: start;
  gap: 0.9rem;
  min-height: 64px;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}

.platform-icon-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: inset 0 0 0 1px var(--vp-c-divider);
  font-size: 1.6rem;
  flex: 0 0 auto;
}

.platform-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.25;
}

.platform-count {
  display: inline-flex;
  margin-top: 0.25rem;
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
  line-height: 1.2;
}

.platform-downloads {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
}

.download-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.download-item:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand) 32%, var(--vp-c-divider));
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
}

.download-item-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.download-item-header {
  min-width: 0;
}

.download-item-desc {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
}

.download-file-name {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-top: 0.5rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 0.84rem;
  line-height: 1.5;
}

.download-file-label {
  flex: 0 0 auto;
  border-radius: 6px;
  padding: 0 0.35rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.5rem;
}

.download-file-text {
  min-width: 0;
  overflow-wrap: anywhere;
}

.download-item:hover .download-file-name,
.download-item:hover .download-file-label {
  color: var(--vp-c-text-1);
}

.download-item-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 0 0 auto;
}

.download-info {
  min-width: 74px;
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.download-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  border-radius: 10px;
  padding: 0.65rem 1rem;
  background: #3f5bd8;
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 8px 18px rgba(63, 91, 216, 0.28);
}

.download-button,
.download-button:hover,
.download-button span {
  color: #fff;
}

.download-button:hover {
  transform: translateY(-1px);
  background: #3349bd;
  box-shadow: 0 12px 24px rgba(63, 91, 216, 0.36);
}

.download-icon {
  position: relative;
  width: 14px;
  height: 14px;
  margin-right: 0.8rem;
  flex: 0 0 14px;
}

.download-icon::before,
.download-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.download-icon::before {
  top: 0;
  width: 2px;
  height: 10px;
  border-radius: 999px;
  background: currentColor;
}

.download-icon::after {
  bottom: 0;
  width: 8px;
  height: 8px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: translateX(-50%) rotate(45deg);
}

.no-downloads {
  text-align: center;
  padding: 3rem;
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  margin: 2rem 0;
  animation: fadeIn 0.5s ease-out;
}

.no-downloads-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.no-downloads-text {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .platform-group {
    grid-template-columns: 1fr;
  }

  .platform-header {
    min-height: auto;
  }

  .download-header {
    padding-bottom: 1.5rem;
  }

  .version-number {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .download-section {
    padding: 1rem;
  }

  .loading, .error {
    padding: 2rem;
  }

  .version-badge {
    font-size: 0.8rem;
  }

  .platform-title {
    font-size: 1.05rem;
  }
}

@media (max-width: 640px) {
  .download-item-content {
    grid-template-columns: 1fr;
  }

  .download-item-footer {
    justify-content: space-between;
  }

  .download-button {
    min-width: 112px;
  }
}

</style>
