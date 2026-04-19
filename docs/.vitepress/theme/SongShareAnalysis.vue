<template>
  <div class="lyrics-share" :class="`mode-${viewMode}`">
    <div class="visual-backdrop" :style="backdropStyle"></div>
    <div class="visual-overlay"></div>
    <div class="visual-grain"></div>

    <button type="button" class="mode-toggle" @click="toggleViewMode">
      {{ viewMode === 'modern' ? '旧版界面' : '返回新版' }}
    </button>

    <section v-if="viewMode === 'modern'" class="modern-shell">
      <div class="modern-hero">
        <div class="modern-copy">
          <p class="modern-kicker">MoeKoe Music Share</p>
          <h1>{{ displaySong.title || '等待歌曲数据' }}</h1>
          <p class="modern-artists">{{ artistLine }}</p>
          <p class="modern-summary">{{ modernSummary }}</p>

          <div class="modern-tags" v-if="modernTags.length">
            <span v-for="tag in modernTags" :key="tag">{{ tag }}</span>
          </div>

          <div class="modern-facts">
            <div>
              <span>专辑</span>
              <strong>{{ displaySong.album || '—' }}</strong>
            </div>
            <div>
              <span>音质</span>
              <strong>{{
                displaySong.quality || (displaySong.bitrate ? `${displaySong.bitrate} kbps` : '—')
              }}</strong>
            </div>
            <div>
              <span>时长</span>
              <strong>{{ formattedDuration }}</strong>
            </div>
          </div>

          <div class="modern-actions">
            <button
              type="button"
              class="modern-primary"
              :class="{ disabled: !audioUrl }"
              @click="togglePlayback"
            >
              <span v-if="isPlaying">暂停播放</span>
              <span v-else>{{ audioUrl ? '立即播放' : '客户端播放' }}</span>
            </button>
            <a class="modern-secondary" href="/download" target="_blank" rel="noreferrer">
              下载客户端
            </a>
          </div>

          <div
            class="modern-progress"
            :class="{ muted: !audioUrl }"
            @click="audioUrl ? seek($event) : null"
          >
            <div class="modern-progress-track">
              <div class="modern-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
            </div>
            <div class="modern-progress-time">
              <span>{{ currentTimeDisplay }}</span>
              <span>{{ totalTimeDisplay }}</span>
            </div>
          </div>

          <p class="modern-notice" v-if="audioNotice">{{ audioNotice }}</p>

          <div class="modern-error" v-if="audioLoadError && audioLoadErrorUrl">
            <p>{{ audioLoadError }}</p>
            <a :href="audioLoadErrorUrl" target="_blank" rel="noreferrer">{{ audioLoadErrorUrl }}</a>
          </div>
        </div>

        <div class="modern-stage">
          <div class="stage-top">
            <div class="stage-cover">
              <img v-if="displaySong.cover" :src="displaySong.cover" alt="cover" loading="lazy" />
              <div v-else class="stage-cover-placeholder">MoeKoe</div>
            </div>

            <div class="stage-spotlight">
              <span class="stage-label">Now Playing</span>
              <strong>{{ currentLyricText || '等待歌词同步' }}</strong>
              <p>{{ statusMessage }}</p>
            </div>
          </div>

          <div class="stage-panel">
            <div class="stage-panel-head">
              <span>歌词流</span>
              <span>{{ currentTimeDisplay }} / {{ totalTimeDisplay }}</span>
            </div>

            <div v-if="modernLyricWindow.length" class="stage-lyrics">
              <p
                v-for="line in modernLyricWindow"
                :key="`${line.absoluteIndex}-${line.time}`"
                :class="['stage-lyric', { active: line.absoluteIndex === highlightedLineIndex }]"
              >
                <span class="stage-lyric-time">{{ line.time || '···' }}</span>
                <span class="stage-lyric-text">{{ line.text }}</span>
              </p>
            </div>

            <div v-else class="stage-empty">
              <p>{{ statusMessage }}</p>
              <p v-if="fetchState.status === 'error' || lyricError" class="error-text">
                {{ fetchState.error || lyricError }}
              </p>
            </div>
          </div>

          <div class="modern-footer">
            <img class="modern-footer-logo" src="/hero.png" alt="MoeKoe" />
            <div class="modern-footer-copy">
              <p>下载 MoeKoe 客户端</p>
              <span>完整播放、VIP 曲目与更多音质体验</span>
            </div>
            <a class="modern-footer-link" href="/download" target="_blank" rel="noreferrer">
              立即下载
            </a>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="player-shell">
      <div class="player-grid">
        <section class="player-side">
          <div class="cover-frame">
            <img v-if="displaySong.cover" :src="displaySong.cover" alt="cover" loading="lazy" />
            <div v-else class="cover-placeholder">MoeKoe</div>
          </div>

          <div class="meta-block">
            <h1>{{ displaySong.title || '等待歌曲数据' }}</h1>
            <p class="track-artists">
              {{ displaySong.artists.length ? displaySong.artists.join(' · ') : '—' }}
            </p>
            <div class="track-tags" v-if="heroTags.length">
              <span v-for="tag in heroTags" :key="tag">{{ tag }}</span>
            </div>
            <div class="track-stats">
              <div>
                <strong>专辑</strong>
                <span>{{ displaySong.album || '—' }}</span>
              </div>
              <div>
                <strong>音质</strong>
                <span>{{
                  displaySong.quality || (displaySong.bitrate ? `${displaySong.bitrate} kbps` : '—')
                }}</span>
              </div>
              <div>
                <strong>时长</strong>
                <span>{{ formattedDuration }}</span>
              </div>
            </div>
          </div>

          <div class="player-controls" :class="{ disabled: !audioUrl }">
            <button type="button" class="play-toggle" @click="togglePlayback">
              <span v-if="isPlaying">暂停播放</span>
              <span v-else>立即播放</span>
            </button>
            <div class="progress-area" :class="{ muted: !audioUrl }" @click="audioUrl ? seek($event) : null">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
              </div>
              <div class="progress-time">
                <span>{{ currentTimeDisplay }}</span>
                <span>{{ totalTimeDisplay }}</span>
              </div>
            </div>
            <p class="audio-notice" v-if="audioNotice">{{ audioNotice }}</p>
            <div class="audio-blocked" v-if="audioLoadError && audioLoadErrorUrl">
              <p class="audio-blocked-title">{{ audioLoadError }}</p>
              <p class="audio-blocked-url">
                播放地址：
                <a :href="audioLoadErrorUrl" target="_blank" rel="noreferrer">{{ audioLoadErrorUrl }}</a>
              </p>
            </div>
          </div>
        </section>

        <section class="lyrics-panel">
          <div class="lyrics-panel-inner" ref="lyricsScrollRef">
            <div class="lyrics-status" v-if="!lyricLines.length">
              <p>{{ statusMessage }}</p>
              <p v-if="fetchState.status === 'error'" class="error">{{ fetchState.error }}</p>
            </div>
            <p
              v-for="(line, index) in lyricLines"
              :key="`${line.time}-${index}`"
              :data-index="index"
              :class="['lyric-line', { active: index === highlightedLineIndex }]"
            >
              <span class="lyric-time">{{ line.time || '···' }}</span>
              <span class="lyric-text">{{ line.text }}</span>
            </p>
          </div>
        </section>
      </div>

      <div class="player-footer" :class="fetchState.status">
        <img class="footer-logo" src="/hero.png" alt="MoeKoe" />
        <p class="footer-message">下载 MoeKoe 客户端即可收听完整版本与体验更多功能</p>
        <a class="footer-cta" href="/download" target="_blank" rel="noreferrer">立即下载</a>
      </div>
    </section>

    <audio
      ref="audioRef"
      class="shared-audio"
      :src="audioUrl"
      preload="auto"
      @error="handleAudioError"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @play="() => (isPlaying = true)"
      @pause="() => (isPlaying = false)"
      @ended="() => (isPlaying = false)"
    ></audio>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

const KUGOU_API_BASE = 'https://musicapi.naad.cn'

const emptySong = {
  title: '',
  artists: [],
  album: '',
  cover: '',
  description: '',
  duration: 0,
  bitrate: 0,
  quality: '',
  releaseDate: '',
  tags: [],
  previewUrl: '',
  streamUrl: '',
  hash: ''
}

const queryModel = reactive({
  hash: ''
})

const songInfo = reactive({ ...emptySong })
const lyricEntries = ref([])
const lyricMeta = reactive({ id: '', accesskey: '', fmt: '' })
const lyricError = ref('')
const audioUrl = ref('')
const audioNotice = ref('')
const audioLoadError = ref('')
const audioLoadErrorUrl = ref('')
const audioRef = ref(null)
const lyricsScrollRef = ref(null)
const viewMode = ref('modern')

const fetchState = reactive({
  status: 'idle',
  error: '',
  requestedUrl: '',
  startedAt: null,
  finishedAt: null,
  payload: null
})

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const displaySong = computed(() => songInfo)
const lyricLines = computed(() => lyricEntries.value)
const backdropStyle = computed(() =>
  displaySong.value.cover ? { backgroundImage: `url(${displaySong.value.cover})` } : {}
)

const heroTags = computed(() => {
  const tags = displaySong.value.tags ?? []
  const dedup = [...new Set(tags)]
  if (displaySong.value.quality && !dedup.includes(displaySong.value.quality)) {
    dedup.unshift(displaySong.value.quality)
  }
  return dedup
})

const modernTags = computed(() => heroTags.value.slice(0, 3))
const artistLine = computed(() =>
  displaySong.value.artists.length ? displaySong.value.artists.join(' · ') : 'MoeKoe Music'
)

const formattedDuration = computed(() =>
  displaySong.value.duration ? formatTimecode(displaySong.value.duration / 1000) : '00:00'
)
const currentTimeDisplay = computed(() => formatTimecode(currentTime.value))
const totalTimeDisplay = computed(() =>
  formatTimecode(duration.value || displaySong.value.duration / 1000)
)
const progressPercent = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})
const moekoeSchemeUrl = computed(() => {
  const hash = queryModel.hash || displaySong.value.hash || ''
  return hash ? `moekoe://share?hash=${hash}` : ''
})

const highlightedLineIndex = computed(() => {
  if (!lyricLines.value.length) return -1
  const current = currentTime.value
  let candidate = -1
  lyricLines.value.forEach((line, index) => {
    if (typeof line.seconds === 'number' && line.seconds <= current) {
      candidate = index
    }
  })
  return candidate >= 0 ? candidate : 0
})

const activeLyricLine = computed(() => {
  if (!lyricLines.value.length) return null
  return lyricLines.value[highlightedLineIndex.value] || lyricLines.value[0] || null
})

const currentLyricText = computed(() => activeLyricLine.value?.text || '')
const statusMessage = computed(() => {
  if (!queryModel.hash) return '在分享链接中追加 ?hash=xxx 即可自动获取数据'
  if (fetchState.status === 'loading') return '正在同步歌曲信息与歌词...'
  if (fetchState.status === 'success') {
    const playback = audioUrl.value ? '可播放' : '需客户端播放'
    if (lyricError.value) {
      return `歌词加载失败 · ${playback}`
    }
    return ``
  }
  if (fetchState.status === 'error') return `解析失败：${fetchState.error}`
  return '等待解析歌词'
})
const modernSummary = computed(
  () => currentLyricText.value || displaySong.value.description || statusMessage.value
)

const modernLyricWindow = computed(() => {
  if (!lyricLines.value.length) return []
  const pivot = Math.max(0, highlightedLineIndex.value)
  const start = Math.max(0, pivot - 1)
  const end = Math.min(lyricLines.value.length, start + 5)
  return lyricLines.value.slice(start, end).map((line, index) => ({
    ...line,
    absoluteIndex: start + index
  }))
})

watch(highlightedLineIndex, (index) => {
  if (index < 0) return
  const container = lyricsScrollRef.value
  if (!container) return
  const el = container.querySelector(`[data-index="${index}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})

watch(audioUrl, (url) => {
  if (url) {
    audioNotice.value = ''
    audioLoadError.value = ''
    audioLoadErrorUrl.value = ''
  } else {
    const audio = audioRef.value
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    audioLoadError.value = ''
    audioLoadErrorUrl.value = ''
  }
})

onMounted(() => {
  hydrateQueryFromLocation()
  if (queryModel.hash) {
    requestTrack('auto')
  }
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      attemptOpenMoekoeScheme()
    }, 500)
  }
})

function hydrateQueryFromLocation() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search || '')
  const hash = params.get('hash')
  if (hash) {
    queryModel.hash = hash
  }
}

function updateUrlFromQuery() {
  if (typeof window === 'undefined') return
  const search = queryModel.hash ? `?hash=${queryModel.hash}` : ''
  const next = `${window.location.pathname}${search}`
  window.history.replaceState({}, '', next)
}

function resetData() {
  Object.assign(songInfo, emptySong)
  lyricEntries.value = []
  lyricMeta.id = ''
  lyricMeta.accesskey = ''
  lyricMeta.fmt = ''
  lyricError.value = ''
  audioUrl.value = ''
  audioNotice.value = ''
  audioLoadError.value = ''
  audioLoadErrorUrl.value = ''
  currentTime.value = 0
  duration.value = 0
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'modern' ? 'legacy' : 'modern'
}

function attemptOpenMoekoeScheme() {
  if (typeof document === 'undefined') return
  const url = moekoeSchemeUrl.value
  if (!url) return
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  } catch (error) {
    console.warn('Failed to open MoeKoe scheme', error)
  }
}

async function requestTrack(origin = 'manual') {
  if (!queryModel.hash) {
    fetchState.status = 'idle'
    fetchState.error = '未提供 hash 参数'
    resetData()
    return
  }

  if (origin !== 'auto') {
    updateUrlFromQuery()
  }

  resetData()
  fetchState.status = 'loading'
  fetchState.error = ''
  fetchState.startedAt = Date.now()
  fetchState.requestedUrl = `${KUGOU_API_BASE}/privilege/lite?hash=${queryModel.hash}`

  try {
    const songPromise = fetchJson(fetchState.requestedUrl)
    const lyricPromise = fetchLyricFromHash(queryModel.hash)

    const songPayload = await songPromise
    fetchState.payload = songPayload
    const normalized = normalizeSong(songPayload)
    Object.assign(songInfo, normalized ?? emptySong)

    try {
      const lyricData = await lyricPromise
      lyricEntries.value = lyricData.lines
      lyricMeta.id = lyricData.id
      lyricMeta.accesskey = lyricData.accesskey
      lyricMeta.fmt = lyricData.fmt
      lyricError.value = ''
    } catch (lyricErr) {
      lyricEntries.value = []
      lyricMeta.id = ''
      lyricMeta.accesskey = ''
      lyricMeta.fmt = ''
      lyricError.value = lyricErr?.message || '歌词加载失败'
    }

    let audioSource = ''
    try {
      audioSource = await fetchSongUrl(queryModel.hash)
      audioNotice.value = ''
    } catch (audioErr) {
      audioSource = ''
      audioNotice.value = '当前歌曲为 VIP 曲目，下载客户端收听完整版本'
    }
    audioUrl.value = audioSource

    fetchState.finishedAt = Date.now()
    fetchState.status = 'success'

    await nextTick()
    if (audioUrl.value && audioRef.value) {
      audioRef.value.load()
      audioRef.value.play().catch(() => {})
    }
  } catch (error) {
    fetchState.finishedAt = Date.now()
    fetchState.status = 'error'
    fetchState.error = error?.message || '解析失败'
  }
}

function togglePlayback() {
  const audio = audioRef.value
  if (!audioUrl.value || !audio) {
    audioNotice.value = '当前歌曲为 VIP 曲目，仅客户端可播放完整版本'
    return
  }
  if (audio.paused) {
    audio.play().catch(() => {})
  } else {
    audio.pause()
  }
}

function handleAudioError(event) {
  const url = audioUrl.value
  if (!url) return

  try {
    event?.target?.pause?.()
  } catch {}
  isPlaying.value = false

  audioLoadErrorUrl.value = url
  audioLoadError.value = '音频资源加载失败：可能被浏览器拦截。请手动点击下面链接打开。'
}

function handleLoadedMetadata(event) {
  duration.value = event.target?.duration || 0
}

function handleTimeUpdate(event) {
  currentTime.value = event.target?.currentTime || 0
}

function seek(event) {
  const audio = audioRef.value
  if (!audio || !duration.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = (event.clientX - rect.left) / rect.width
  const nextTime = Math.max(0, Math.min(duration.value, ratio * duration.value))
  audio.currentTime = nextTime
  currentTime.value = nextTime
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`接口返回 ${response.status}`)
  }
  return response.json()
}

async function fetchLyricFromHash(hash) {
  const searchUrl = `${KUGOU_API_BASE}/search/lyric?hash=${hash}`
  const searchPayload = await fetchJson(searchUrl)
  const candidate = searchPayload?.candidates?.[0]
  if (!candidate?.id || !candidate?.accesskey) {
    throw new Error('未找到匹配的歌词候选')
  }
  const lyricUrl = `${KUGOU_API_BASE}/lyric?id=${candidate.id}&accesskey=${candidate.accesskey}&decode=true`
  const lyricPayload = await fetchJson(lyricUrl)
  const rawContent = lyricPayload.decodeContent || lyricPayload.content || ''
  const lines = parseLyricContent(rawContent)
  if (!lines.length) {
    throw new Error('歌词返回为空')
  }
  return {
    id: candidate.id,
    accesskey: candidate.accesskey,
    fmt: lyricPayload.fmt || '',
    lines
  }
}

async function fetchSongUrl(hash) {
  const url = `${KUGOU_API_BASE}/song/url?hash=${hash}&free_part=1`
  const payload = await fetchJson(url)

  const pickFirst = (value) => {
    if (!value) return ''
    if (Array.isArray(value)) {
      return value.find((item) => typeof item === 'string' && item.startsWith('http')) || ''
    }
    if (typeof value === 'string' && value.startsWith('http')) {
      return value
    }
    return ''
  }

  const firstUrl =
    pickFirst(payload.url) ||
    pickFirst(payload?.data?.url) ||
    pickFirst(payload.play_url) ||
    pickFirst(payload.backupUrl) ||
    pickFirst(payload.playUrl)

  if (firstUrl) {
    return firstUrl
  }

  throw new Error('未获取到播放地址')
}

function normalizeSong(payload) {
  if (!payload) return { ...emptySong }
  const sources = [payload.data, payload.result, payload.song, payload.track, payload]
  let root = null
  for (const source of sources) {
    if (!source) continue
    root = Array.isArray(source) ? source[0] : source
    if (root) break
  }
  if (!root) return { ...emptySong }

  const info = root.info || {}
  let artists = toArray(
    root.artists ||
      root.artist ||
      root.artistName ||
      root.singers ||
      root.performer ||
      root.singername ||
      info.artist
  )
  if (!artists.length && typeof root.name === 'string' && root.name.includes(' - ')) {
    artists = toArray(root.name.split(' - ')[0])
  }

  let title =
    root.title || root.songName || root.name || info.title || payload.title || emptySong.title
  if (!root.title && typeof root.name === 'string' && root.name.includes(' - ')) {
    const segments = root.name.split(' - ')
    title = segments[segments.length - 1].trim() || title
  }

  const coverCandidate =
    root.cover ||
    root.coverUrl ||
    root.pic ||
    root.picUrl ||
    root.albumArt ||
    info.image ||
    root.trans_param?.union_cover ||
    ''

  const tags = [
    ...(Array.isArray(payload.tags) ? payload.tags : payload.tags ? [payload.tags] : []),
    ...(Array.isArray(root.tags) ? root.tags : root.tags ? [root.tags] : []),
    ...(Array.isArray(info.tags) ? info.tags : info.tags ? [info.tags] : []),
    root.trans_param?.language
  ].filter(Boolean)

  return {
    title,
    artists,
    album:
      root.album ||
      root.albumName ||
      root.record ||
      root.albumname ||
      info.album ||
      payload.album ||
      '',
    cover: normalizeCover(coverCandidate),
    description: root.description || root.desc || payload.description || info.intro || '',
    duration: root.duration || root.length || root.time || info.duration || 0,
    bitrate:
      root.bitrate ||
      info.bitrate ||
      root.qualityBitrate ||
      (root.quality && Number(root.quality)) ||
      0,
    quality: normalizeQuality(root.qualityText || root.quality || payload.quality || ''),
    releaseDate:
      root.releaseDate ||
      root.publishTime ||
      root.issueDate ||
      root.start_time ||
      payload.releaseDate ||
      '',
    tags: [...new Set(tags)],
    previewUrl:
      payload.previewUrl ||
      payload.audioPreview ||
      root.previewUrl ||
      root.tryPlayUrl ||
      root.try_play_url ||
      root.freeTrialUrl ||
      '',
    streamUrl:
      payload.streamUrl ||
      payload.playUrl ||
      root.playUrl ||
      root.play_url ||
      root.url ||
      '',
    currentLyricIndex: payload.currentLyricIndex ?? null,
    hash: root.hash || payload.hash || ''
  }
}

function parseLyricContent(raw) {
  if (!raw) return []
  return raw
    .split(/\r?\n/)
    .map((line) => parseLyricLine(line))
    .filter((line) => line.text)
}

function parseLyricLine(line) {
  const trimmed = line?.trim()
  if (!trimmed) return { time: '', text: '', seconds: null }
  const numericMatch = trimmed.match(/\[(\d{1,6}),\d+]/)
  const clockMatch = trimmed.match(/\[(\d{1,2}:\d{1,2})(?:\.\d{1,2})?]/)
  let seconds = null
  let time = ''
  if (numericMatch) {
    seconds = Number(numericMatch[1]) / 1000
    time = formatTimecode(seconds)
  } else if (clockMatch) {
    seconds = timeStringToSeconds(clockMatch[1])
    time = clockMatch[1]
  }
  const text = trimmed
    .replace(/\[[^\]]+]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
  return { time, text, seconds }
}

function toArray(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === 'string' ? item : item.name || item.title || item.nick || ''
      )
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/[,、·&]| - /)
      .map((v) => v.trim())
      .filter(Boolean)
  }
  if (typeof value === 'object' && value.name) {
    return [value.name]
  }
  return []
}

function formatTimecode(value) {
  if (!value || Number.isNaN(value)) return '00:00'
  const totalSeconds = Math.max(0, Math.floor(value))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function timeStringToSeconds(value) {
  if (!value) return 0
  const [m, s] = value.split(':')
  return Number(m) * 60 + Number(s)
}

function normalizeCover(url) {
  if (!url) return ''
  if (url.includes('{size}')) {
    return url.replace('{size}', '480')
  }
  return url
}

function normalizeQuality(value) {
  if (!value) return ''
  const text = value.toString().trim()
  if (!text) return ''
  if (/^\d+$/.test(text)) {
    return `${text} kbps`
  }
  return text
}
</script>

<style scoped>
.lyrics-share {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #060914;
  color: #f7f1e6;
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.shared-audio {
  display: none;
}

.visual-backdrop {
  position: fixed;
  inset: 0;
  background-color: #101728;
  background-size: cover;
  background-position: center;
  filter: blur(16px) saturate(1.15);
  transform: scale(1.12);
  z-index: -3;
  pointer-events: none;
}

.visual-overlay {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(231, 200, 150, 0.22), transparent 30%),
    radial-gradient(circle at 80% 18%, rgba(101, 129, 255, 0.16), transparent 26%),
    linear-gradient(135deg, rgba(4, 10, 24, 0.9), rgba(7, 13, 27, 0.72) 48%, rgba(5, 7, 15, 0.92));
  z-index: -2;
  pointer-events: none;
}

.visual-grain {
  position: fixed;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.035), transparent 35%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.025) 0,
      rgba(255, 255, 255, 0.025) 1px,
      transparent 1px,
      transparent 80px
    );
  mix-blend-mode: soft-light;
  opacity: 0.55;
  z-index: -1;
  pointer-events: none;
}

.mode-toggle {
  position: fixed;
  top: calc(1.25rem + env(safe-area-inset-top, 0px));
  right: max(1.25rem, env(safe-area-inset-right, 0px));
  z-index: 30;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 0.8rem 1.15rem;
  background: rgba(12, 18, 34, 0.68);
  color: #f8f2e8;
  backdrop-filter: blur(18px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28);
  font-size: 0.92rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.mode-toggle:hover {
  transform: translateY(-2px);
  border-color: rgba(231, 200, 150, 0.45);
  background: rgba(17, 24, 42, 0.82);
}

.modern-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: clamp(1.5rem, 4vw, 3rem);
  box-sizing: border-box;
}

.modern-hero {
  width: min(1320px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: end;
}

.modern-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: clamp(1rem, 2vw, 2rem) 0;
}

.modern-kicker {
  margin: 0;
  color: rgba(247, 241, 230, 0.72);
  font-size: 0.84rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.modern-copy h1 {
  margin: 0;
  font-size: clamp(3rem, 7vw, 6.4rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-family: 'Georgia', 'Times New Roman', 'Source Han Serif SC', serif;
  text-wrap: balance;
  max-width: 10ch;
}

.modern-artists {
  margin: 0;
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  color: rgba(247, 241, 230, 0.76);
}

.modern-summary {
  margin: 0;
  max-width: 34rem;
  font-size: clamp(1rem, 1.7vw, 1.22rem);
  line-height: 1.8;
  color: rgba(247, 241, 230, 0.9);
}

.modern-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.modern-tags span {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 248, 239, 0.86);
  font-size: 0.88rem;
}

.modern-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 0.5rem;
}

.modern-facts div {
  padding: 1rem 1.1rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
}

.modern-facts span {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.76rem;
  color: rgba(247, 241, 230, 0.58);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modern-facts strong {
  display: block;
  font-size: 1rem;
  color: #fff7ed;
  word-break: break-word;
}

.modern-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 0.65rem;
}

.modern-primary,
.modern-secondary,
.modern-footer-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  border-radius: 999px;
  padding: 0 1.5rem;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.modern-primary {
  border: none;
  background: linear-gradient(135deg, #f2dfc2, #d8b381);
  color: #1b1520;
  font-weight: 700;
  box-shadow: 0 20px 36px rgba(216, 179, 129, 0.28);
}

.modern-primary.disabled {
  box-shadow: none;
}

.modern-secondary,
.modern-footer-link {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #f7f1e6;
  backdrop-filter: blur(18px);
}

.modern-primary:hover,
.modern-secondary:hover,
.modern-footer-link:hover {
  transform: translateY(-2px);
}

.modern-progress {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-width: 34rem;
  padding: 1rem 1.1rem;
  border-radius: 24px;
  background: rgba(6, 12, 26, 0.46);
  border: 1px solid rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(24px);
}

.modern-progress.muted {
  opacity: 0.55;
  cursor: not-allowed;
}

.modern-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  overflow: hidden;
}

.modern-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f2dfc2, #d8b381);
}

.modern-progress-time {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.82rem;
  color: rgba(247, 241, 230, 0.66);
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.modern-notice {
  margin: 0;
  color: #f8d6a2;
  font-size: 0.9rem;
}

.modern-error {
  display: grid;
  gap: 0.4rem;
  max-width: 34rem;
  padding: 1rem 1.1rem;
  border-radius: 20px;
  background: rgba(87, 31, 31, 0.22);
  border: 1px solid rgba(248, 214, 162, 0.24);
}

.modern-error p,
.modern-error a {
  margin: 0;
  color: #ffe7c8;
  word-break: break-all;
}

.modern-stage {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stage-top,
.stage-panel,
.modern-footer {
  position: relative;
  border-radius: 32px;
  background: rgba(8, 14, 30, 0.48);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(28px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
}

.stage-top {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 1.1rem;
  padding: 1.1rem;
}

.stage-cover {
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.stage-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stage-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(247, 241, 230, 0.7);
}

.stage-spotlight {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.6rem 0.35rem;
}

.stage-label {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(247, 241, 230, 0.52);
}

.stage-spotlight strong {
  font-size: clamp(1.4rem, 2.8vw, 2.4rem);
  line-height: 1.2;
  color: #fff8ef;
  font-family: 'Georgia', 'Times New Roman', 'Source Han Serif SC', serif;
}

.stage-spotlight p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(247, 241, 230, 0.72);
}

.stage-panel {
  padding: 1.2rem;
}

.stage-panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.82rem;
  color: rgba(247, 241, 230, 0.58);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stage-lyrics {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.stage-lyric {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 0.9rem;
  align-items: start;
  padding: 0.95rem 1rem;
  border-radius: 20px;
  color: rgba(247, 241, 230, 0.6);
  background: rgba(255, 255, 255, 0.03);
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
}

.stage-lyric.active {
  transform: translateX(6px);
  background: linear-gradient(135deg, rgba(242, 223, 194, 0.22), rgba(216, 179, 129, 0.12));
  color: #fff7ed;
}

.stage-lyric-time {
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  color: rgba(247, 241, 230, 0.45);
}

.stage-lyric-text {
  font-size: 1rem;
  line-height: 1.7;
}

.stage-empty {
  padding: 2.2rem 0.4rem;
  text-align: center;
  color: rgba(247, 241, 230, 0.72);
}

.error-text {
  color: #ffccab;
}

.modern-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
}

.modern-footer-logo {
  width: 42px;
  height: 42px;
  border-radius: 999px;
}

.modern-footer-copy {
  flex: 1;
}

.modern-footer-copy p,
.modern-footer-copy span {
  display: block;
}

.modern-footer-copy p {
  margin: 0 0 0.3rem;
  color: #fff8ef;
}

.modern-footer-copy span {
  color: rgba(247, 241, 230, 0.62);
  font-size: 0.88rem;
}

.player-shell {
  position: relative;
  min-height: 100vh;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(5rem, 7vw, 6.25rem) clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  box-sizing: border-box;
}

.player-grid {
  display: grid;
  grid-template-columns: minmax(280px, 340px) 1fr;
  gap: clamp(1.5rem, 3vw, 3rem);
  align-items: stretch;
}

.player-side,
.lyrics-panel {
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 60px rgba(3, 7, 18, 0.5);
}

.player-side {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cover-frame {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  font-size: 1.4rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.7;
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-block h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 1.2;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.track-artists {
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
}

.track-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.track-tags span {
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.85rem;
}

.track-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  opacity: 0.8;
}

.track-stats strong {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  opacity: 0.6;
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.player-controls.disabled {
  opacity: 0.9;
}

.play-toggle {
  border: none;
  border-radius: 16px;
  padding: 0.95rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  background: linear-gradient(120deg, #8be8fd, #6d90ff);
  color: #0f172a;
  cursor: pointer;
}

.progress-area {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-area.muted {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(120deg, #8be8fd, #6d90ff);
}

.progress-time {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
  opacity: 0.7;
}

.audio-notice {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: #fed7aa;
}

.audio-blocked {
  margin-top: 0.2rem;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(254, 215, 170, 0.35);
  background: rgba(254, 215, 170, 0.08);
}

.audio-blocked-title {
  margin: 0;
  font-size: 0.85rem;
  color: #fed7aa;
}

.audio-blocked-url {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  word-break: break-all;
  opacity: 0.9;
}

.audio-blocked-url a {
  color: #8be8fd;
  text-decoration: underline;
}

.lyrics-panel {
  padding: 1.5rem;
}

.lyrics-panel-inner {
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 2rem;
  align-items: center;
  scrollbar-width: thin;
  scrollbar-color: rgba(137, 247, 254, 0.4) transparent;
}

.lyrics-panel-inner::-webkit-scrollbar {
  width: 6px;
}

.lyrics-panel-inner::-webkit-scrollbar-track {
  background: transparent;
}

.lyrics-panel-inner::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(137, 247, 254, 0.6), rgba(102, 166, 255, 0.6));
  border-radius: 999px;
}

.lyric-line {
  display: flex;
  gap: 1rem;
  padding: 0.65rem 1.5rem;
  border-radius: 16px;
  align-items: baseline;
  background: rgba(15, 23, 42, 0.35);
  transition: background 0.2s ease, transform 0.2s ease;
  font-size: clamp(1rem, 2vw, 1.35rem);
  width: 100%;
  max-width: 520px;
}

.lyric-line.active {
  background: rgba(137, 247, 254, 0.25);
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(137, 247, 254, 0.15);
}

.lyric-time {
  width: 64px;
  font-size: 0.85rem;
  opacity: 0.6;
  font-family: 'JetBrains Mono', monospace;
}

.lyric-text {
  flex: 1;
}

.lyrics-status {
  text-align: center;
  opacity: 0.85;
  padding: 3rem 1rem;
}

.lyrics-status .error {
  color: #fecaca;
  margin-top: 0.6rem;
}

.player-footer {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  transform: translate(-50%, 130%);
  opacity: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.6rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 15px 30px rgba(3, 7, 18, 0.4);
  animation: footer-slide-in 0.45s cubic-bezier(0.19, 1, 0.22, 1) 1s forwards;
}

.player-footer .footer-logo {
  width: 32px;
  height: 32px;
  border-radius: 999px;
}

.player-footer .footer-message {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.85;
}

.player-footer .footer-cta {
  padding: 0.55rem 1.2rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, #8be8fd, #6d90ff);
  color: #0f172a;
  font-weight: 600;
}

@keyframes footer-slide-in {
  0% {
    transform: translate(-50%, 130%);
    opacity: 0;
  }
  70% {
    transform: translate(-50%, -6%);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@media (max-width: 1180px) {
  .modern-hero {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .modern-copy h1 {
    max-width: none;
  }

  .modern-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .player-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .mode-toggle {
    top: 1rem;
    right: 1rem;
    padding: 0.72rem 1rem;
    font-size: 0.84rem;
  }

  .modern-shell {
    padding: 5rem 1rem 1.25rem;
  }

  .modern-copy {
    gap: 0.85rem;
  }

  .modern-copy h1 {
    font-size: clamp(2.4rem, 16vw, 4.1rem);
  }

  .modern-facts {
    grid-template-columns: 1fr;
  }

  .stage-top {
    grid-template-columns: 1fr;
  }

  .stage-cover {
    max-width: 280px;
  }

  .modern-footer {
    flex-wrap: wrap;
  }

  .modern-footer-link {
    width: 100%;
  }

  .player-shell {
    padding: 4.75rem 1rem 1.5rem;
  }

  .player-side {
    padding: 1.5rem 1.2rem;
  }

  .lyrics-panel {
    padding: 1.2rem;
  }

  .lyrics-panel-inner {
    padding: 0.75rem 0.4rem;
  }

  .player-footer {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    transform: translateY(130%);
    width: auto;
    border-radius: 28px;
    padding: 1rem;
    flex-wrap: wrap;
  }

  @keyframes footer-slide-in {
    0% {
      transform: translateY(130%);
      opacity: 0;
    }
    70% {
      transform: translateY(-4%);
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
}
</style>
