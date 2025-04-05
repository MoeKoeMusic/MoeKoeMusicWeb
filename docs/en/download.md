---
layout: doc
title: Download MoeKoe Music
---

# Download MoeKoe Music

<script setup>
import { ref, onMounted, computed } from 'vue'

const releases = ref({})
const loading = ref(true)
const error = ref(null)
const useProxy = ref(false)

const getSystemInfo = (fileName) => {
  if (fileName.endsWith('.exe')) return { icon: '💻', name: 'Windows', desc: 'Windows Installer' }
  if (fileName.endsWith('.AppImage')) return { icon: '🐧', name: 'Linux', desc: 'Linux AppImage Executable' }
  if (fileName.endsWith('.deb')) return { icon: '🐧', name: 'Linux (Debian)', desc: 'Debian/Ubuntu Package' }
  if (fileName.endsWith('.dmg')) return { icon: '🍎', name: 'macOS', desc: 'macOS Disk Image' }
  if (fileName.endsWith('mac.zip')) return { icon: '🍎', name: 'macOS', desc: 'macOS Archive' }
  return { icon: '📦', name: 'Other', desc: 'Other Format' }
}

const groupedAssets = computed(() => {
  return releases.value.assets
    .filter(a => a.size > 10 * 1024 * 1024) 
    .reduce((acc, asset) => {
      const info = getSystemInfo(asset.name)
      if (info.name.includes('Windows')) acc.windows.push({ ...asset, ...info })
      else if (info.name.includes('macOS')) acc.mac.push({ ...asset, ...info })
      else if (info.name.includes('Linux')) acc.linux.push({ ...asset, ...info })
      return acc
    }, { windows: [], mac: [], linux: [] })
})

const fetchReleaseInfo = async () => {
  try {
    const apiUrl = `https://api.github.com/repos/iAJue/MoeKoeMusic/releases/latest`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) 
    
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(response.status === 403 ? `${errorData.message}` : `Request failed: ${response.status}`)
    }
    
    releases.value = await response.json()
    loading.value = false
  } catch (e) {
    if (e.name === 'AbortError') {
      error.value = 'Request timeout, please try again later'
    } else {
      error.value = e.message || 'Failed to fetch version information, please try again later'
    }
    loading.value = false
  }
}

onMounted(() => {
  fetchReleaseInfo()
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatSize = (bytes) => {
  const mb = bytes / 1024 / 1024
  return mb.toFixed(1)
}
</script>

<div v-if="loading" class="loading">
  <div class="loading-spinner"></div>
  <div class="loading-text">Fetching latest version information...</div>
</div>

<div v-else-if="error" class="error">
  <div class="error-icon">⚠</div>
  <div class="error-message">{{ error }}</div>
  <button @click="fetchReleaseInfo" class="retry-button">Retry</button>
</div>

<div v-else class="download-section">
  <div class="download-header">
    <div class="version-info">
      <div class="version-badge">Latest Version</div>
      <h2 class="version-number">{{ releases.tag_name }}</h2>
      <p class="release-date">Released on {{ formatDate(releases.published_at) }}</p>
      <div class="release-notes" v-if="releases.body">
        <details>
          <summary>Release Notes</summary>
          <div class="release-notes-content">{{ releases.body }}</div>
        </details>
      </div>
    </div>
    <div class="region-selector">
      <label class="checkbox-label">
        <input type="checkbox" v-model="useProxy">
        <span>I'm from Mainland China <span class="region-hint"> (Use mirror for faster download)</span></span>
      </label>
    </div>
  </div>
  
  <div class="download-options">
    <!-- Windows Downloads -->
    <div class="platform-group" v-if="groupedAssets.windows.length">
      <div class="platform-header">
        <div class="platform-icon-large">💻</div>
        <h3 class="platform-title">Windows</h3>
      </div>
      <div class="platform-downloads">
        <div v-for="asset in groupedAssets.windows" :key="asset?.id" class="download-item">
          <div class="download-item-content">
            <div class="download-item-header">
              <div class="download-item-desc">{{ asset.desc }}</div>
            </div>
            <div class="download-item-footer">
              <div class="download-info">{{ formatSize(asset.size) }} MB</div>
              <a :href="useProxy ? `https://gh-proxy.com/${asset.browser_download_url}` : asset.browser_download_url" class="download-button" target="_blank">
                <span class="download-icon">⭳</span>
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- macOS Downloads -->
    <div class="platform-group" v-if="groupedAssets.mac.length">
      <div class="platform-header">
        <div class="platform-icon-large">🍎</div>
        <h3 class="platform-title">macOS</h3>
      </div>
      <div class="platform-downloads">
        <div v-for="asset in groupedAssets.mac" :key="asset?.id" class="download-item">
          <div class="download-item-content">
            <div class="download-item-header">
              <div class="download-item-desc">{{ asset?.desc }}</div>
            </div>
            <div class="download-item-footer">
              <div class="download-info">{{ formatSize(asset.size) }} MB</div>
              <a :href="useProxy ? `https://gh-proxy.com/${asset.browser_download_url}` : asset.browser_download_url" class="download-button" target="_blank">
                <span class="download-icon">⭳</span>
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Linux Downloads -->
    <div class="platform-group" v-if="groupedAssets.linux.length">
      <div class="platform-header">
        <div class="platform-icon-large">🐧</div>
        <h3 class="platform-title">Linux</h3>
      </div>
      <div class="platform-downloads">
        <div v-for="asset in groupedAssets.linux" :key="asset?.id" class="download-item">
          <div class="download-item-content">
            <div class="download-item-header">
              <div class="download-item-desc">{{ asset.desc }}</div>
            </div>
            <div class="download-item-footer">
              <div class="download-info">{{ formatSize(asset.size) }} MB</div>
              <a :href="useProxy ? `https://gh-proxy.com/${asset.browser_download_url}` : asset.browser_download_url" class="download-button" target="_blank">
                <span class="download-icon">⭳</span>
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="no-downloads" v-if="!groupedAssets.windows.length && !groupedAssets.mac.length && !groupedAssets.linux.length">
      <div class="no-downloads-icon">📦</div>
      <div class="no-downloads-text">No downloads available</div>
    </div>
  </div>
</div>

<style scoped>
/* 基础动画 */
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

/* 加载状态 */
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

/* 错误状态 */
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

/* 下载区域 */
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

.release-notes-content {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  white-space: pre-line;
  max-height: 300px;
  overflow-y: auto;
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

/* 下载选项 */
.download-options {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: slideUp 0.6s ease-out;
}

.platform-group {
  display: flex;
  gap: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.platform-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 2rem;
  border-right: 1px solid var(--vp-c-divider);
}

.platform-icon-large {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
  margin-top:25px
}

.platform-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.platform-downloads {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.download-item-content {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.download-item-header {
  margin-bottom: 0;
  flex: 1;
}

.download-item-desc {
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 500;
}

.download-item-footer {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 120px;
}

.download-info {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.download-button {
  display: inline-flex!important;
  align-items: center!important;
  justify-content: center!important;
  background: linear-gradient(120deg, var(--vp-c-brand-light) 0%, var(--vp-c-brand) 100%)!important;
  color: white!important;
  padding: 0.8rem 1.5rem!important;
  border-radius: 12px!important;
  text-decoration: none!important;
  font-weight: 600!important;
  transition: all 0.3s ease!important;
  box-shadow: 0 4px 15px rgba(102, 166, 255, 0.2)!important;
}

.download-button:hover {
  transform: translateY(-2px)!important;
  box-shadow: 0 8px 20px rgba(102, 166, 255, 0.4)!important;
}

.download-icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

/* 无下载状态 */
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

/* 响应式调整 */
@media (max-width: 768px) {
  .platform-group {
    flex-direction: column;
    gap: 1.5rem;
  }

  .platform-header {
    padding-right: 0;
    padding-bottom: 1.5rem;
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
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
  
  .platform-icon-large {
    font-size: 2rem;
  }
  
  .platform-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .download-item-content {
    flex-direction: column;
    align-items: stretch;
  }

  .download-item-footer {
    align-items: stretch;
    margin-top: 1rem;
  }

  .download-info {
    text-align: center;
  }
}

/* 添加最高优先级到所有样式 */
:deep(.platform-group) {
  display: flex !important;
  gap: 2rem !important;
  background: var(--vp-c-bg-soft) !important;
  border-radius: 20px !important;
  padding: 2rem !important;
  border: 1px solid var(--vp-c-divider) !important;
  transition: all 0.3s ease !important;
  position: relative !important;
  overflow: hidden !important;
}

:deep(.platform-header) {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  min-width: 200px !important;
  padding-right: 2rem !important;
  border-right: 1px solid var(--vp-c-divider) !important;
}

:deep(.platform-icon-large) {
  font-size: 3.5rem !important;
  margin-bottom: 1rem !important;
  animation: float 3s ease-in-out infinite !important;
}

:deep(.platform-title) {
  font-size: 1.8rem !important;
  font-weight: 600 !important;
  color: var(--vp-c-text-1) !important;
  margin: 0 !important;
}

:deep(.platform-downloads) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 1.5rem !important;
}

:deep(.download-item) {
  width: 100% !important;
  background: var(--vp-c-bg) !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  transition: all 0.3s ease !important;
  border: 1px solid var(--vp-c-divider) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
}

:deep(.download-item-content) {
  padding: 1.5rem !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 1rem !important;
}

:deep(.download-item-header) {
  margin-bottom: 0 !important;
  flex: 1 !important;
}

:deep(.download-item-desc) {
  color: var(--vp-c-text-1) !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
}

:deep(.download-item-footer) {
  margin-top: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 0.5rem !important;
  min-width: 120px !important;
}

:deep(.download-info) {
  font-size: 0.95rem !important;
  color: var(--vp-c-text-2) !important;
}

:deep(.download-button) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: linear-gradient(120deg, var(--vp-c-brand-light) 0%, var(--vp-c-brand) 100%) !important;
  color: white !important;
  padding: 0.8rem 1.5rem !important;
  border-radius: 12px !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(102, 166, 255, 0.2) !important;
}

:deep(.download-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(102, 166, 255, 0.4) !important;
}

/* 响应式样式也添加最高优先级 */
@media (max-width: 768px) {
  :deep(.platform-group) {
    flex-direction: column !important;
    gap: 1.5rem !important;
  }

  :deep(.platform-header) {
    padding-right: 0 !important;
    padding-bottom: 1.5rem !important;
    border-right: none !important;
    border-bottom: 1px solid var(--vp-c-divider) !important;
  }
}

@media (max-width: 640px) {
  :deep(.download-item-content) {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  :deep(.download-item-footer) {
    align-items: stretch !important;
    margin-top: 1rem !important;
  }

  :deep(.download-info) {
    text-align: center !important;
  }
}
</style>