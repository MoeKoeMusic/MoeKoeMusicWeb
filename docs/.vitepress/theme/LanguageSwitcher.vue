<template>
  <div class="language-switcher">
    <button
      class="language-button"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
    >
      {{ currentLanguage.label }}
      <span class="arrow" :class="{ 'arrow-down': !isOpen, 'arrow-up': isOpen }">▼</span>
    </button>
    <div class="language-dropdown" v-if="isOpen">
      <a
        v-for="lang in availableLanguages"
        :key="lang.code"
        :href="switchLanguagePath(lang.code)"
        class="language-item"
        :class="{ 'active': currentLangCode === lang.code }"
        @click="closeDropdown"
      >
        {{ lang.label }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

const isOpen = ref(false)
const dropdownRef = ref(null)

const availableLanguages = [
  { code: 'zh', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-TW', label: '繁體中文' }
]

const currentLangCode = computed(() => {
  const path = route.path
  if (path.startsWith('/en/')) return 'en'
  if (path.startsWith('/ja/')) return 'ja'
  if (path.startsWith('/zh-TW/')) return 'zh-TW'
  return 'zh' // 默认为简体中文
})

const currentLanguage = computed(() => {
  return availableLanguages.find(lang => lang.code === currentLangCode.value) || availableLanguages[0]
})

function switchLanguagePath(langCode) {
  const currentPath = route.path
  
  // 移除当前语言前缀
  let pathWithoutLang = currentPath
  for (const lang of availableLanguages) {
    if (currentPath.startsWith(`/${lang.code}/`)) {
      pathWithoutLang = currentPath.substring(lang.code.length + 1)
      break
    }
  }
  
  // 如果是默认语言(中文)且路径不是以/zh/开头
  if (currentLangCode.value === 'zh' && !currentPath.startsWith('/zh/')) {
    pathWithoutLang = currentPath
  }
  
  // 添加新语言前缀
  if (langCode === 'zh') {
    return pathWithoutLang // 中文是默认语言，不需要前缀
  } else {
    return `/${langCode}${pathWithoutLang}`
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
  z-index: 100;
}

.language-button {
  display: flex;
  align-items: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--vp-c-text-1);
}

.language-button:hover {
  background: var(--vp-c-bg-mute);
}

.arrow {
  margin-left: 6px;
  font-size: 10px;
  transition: transform 0.2s;
}

.arrow-down {
  transform: rotate(0deg);
}

.arrow-up {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

.language-item {
  display: block;
  padding: 8px 12px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: background 0.2s;
  font-size: 14px;
}

.language-item:hover {
  background: var(--vp-c-bg-soft);
}

.language-item.active {
  background: var(--vp-c-brand-dimm);
  color: var(--vp-c-brand);
  font-weight: 500;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>