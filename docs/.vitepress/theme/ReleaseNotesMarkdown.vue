<template>
  <div class="release-notes-content">
    <template v-for="(block, blockIndex) in blocks" :key="blockIndex">
      <component :is="block.tag" v-if="block.type === 'heading'">
        <template v-for="(token, tokenIndex) in tokenizeMarkdownInline(block.text)" :key="tokenIndex">
          <component :is="tokenComponent(token)" v-bind="tokenProps(token)">
            {{ token.text }}
          </component>
        </template>
      </component>

      <p v-else-if="block.type === 'paragraph'">
        <template v-for="(token, tokenIndex) in tokenizeMarkdownInline(block.text)" :key="tokenIndex">
          <component :is="tokenComponent(token)" v-bind="tokenProps(token)">
            {{ token.text }}
          </component>
        </template>
      </p>

      <blockquote v-else-if="block.type === 'quote'">
        <template v-for="(token, tokenIndex) in tokenizeMarkdownInline(block.text)" :key="tokenIndex">
          <component :is="tokenComponent(token)" v-bind="tokenProps(token)">
            {{ token.text }}
          </component>
        </template>
      </blockquote>

      <pre v-else-if="block.type === 'code'"><code>{{ block.text }}</code></pre>

      <ul v-else-if="block.type === 'list'">
        <li v-for="(itemText, itemIndex) in block.items" :key="itemIndex">
          <template v-for="(token, tokenIndex) in tokenizeMarkdownInline(itemText)" :key="tokenIndex">
            <component :is="tokenComponent(token)" v-bind="tokenProps(token)">
              {{ token.text }}
            </component>
          </template>
        </li>
      </ul>

      <ol v-else-if="block.type === 'ordered-list'">
        <li v-for="(itemText, itemIndex) in block.items" :key="itemIndex">
          <template v-for="(token, tokenIndex) in tokenizeMarkdownInline(itemText)" :key="tokenIndex">
            <component :is="tokenComponent(token)" v-bind="tokenProps(token)">
              {{ token.text }}
            </component>
          </template>
        </li>
      </ol>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  body: {
    type: String,
    default: ''
  },
  repoUrl: {
    type: String,
    default: 'https://github.com/iAJue/MoeKoeMusic'
  }
})

const blocks = computed(() => parseMarkdownBlocks(props.body))

const parseMarkdownBlocks = (markdown = '') => {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const trimmed = lines[index].trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const codeLines = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }
      blocks.push({ type: 'code', text: codeLines.join('\n') })
      index += 1
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        tag: `h${Math.min(6, headingMatch[1].length + 1)}`,
        text: headingMatch[2].trim()
      })
      index += 1
      continue
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines = []
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', text: quoteLines.join(' ') })
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''))
        index += 1
      }
      blocks.push({ type: 'list', items })
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''))
        index += 1
      }
      blocks.push({ type: 'ordered-list', items })
      continue
    }

    const paragraphLines = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('```') &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^>\s?/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
  }

  return blocks
}

const tokenizeMarkdownInline = (text) => {
  const tokens = []
  const pattern = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))|(https?:\/\/[^\s)]+)|#(\d+)|@([A-Za-z0-9-]+)/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }

    if (match[2]) {
      tokens.push({ type: 'strong', text: match[2] })
    } else if (match[4]) {
      tokens.push({ type: 'code', text: match[4] })
    } else if (match[6] && match[7]) {
      tokens.push({ type: 'link', text: match[6], url: match[7] })
    } else if (match[8]) {
      tokens.push({ type: 'link', text: match[8], url: match[8] })
    } else if (match[9]) {
      tokens.push({ type: 'link', text: match[0], url: `${props.repoUrl}/issues/${match[9]}` })
    } else {
      tokens.push({ type: 'link', text: match[0], url: `https://github.com/${match[10]}` })
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return tokens
}

const tokenComponent = token => {
  if (token.type === 'link') return 'a'
  if (token.type === 'code') return 'code'
  if (token.type === 'strong') return 'strong'
  return 'span'
}

const tokenProps = token => {
  if (token.type !== 'link') return {}
  return {
    href: token.url,
    target: '_blank',
    rel: 'noopener noreferrer'
  }
}
</script>

<style scoped>
.release-notes-content {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  max-height: 300px;
  overflow-y: auto;
  text-align: left;
}

.release-notes-content h2,
.release-notes-content h3,
.release-notes-content h4,
.release-notes-content h5,
.release-notes-content h6 {
  margin: 1rem 0 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.4rem;
  font-weight: 700;
  line-height: 1.25;
}

.release-notes-content h2 {
  font-size: 1.2rem;
}

.release-notes-content h3 {
  font-size: 1.05rem;
}

.release-notes-content p,
.release-notes-content blockquote,
.release-notes-content ul,
.release-notes-content ol,
.release-notes-content pre {
  margin: 0 0 0.75rem;
}

.release-notes-content ul,
.release-notes-content ol {
  padding-left: 1.5rem;
}

.release-notes-content li + li {
  margin-top: 0.35rem;
}

.release-notes-content a {
  color: var(--vp-c-brand);
}

.release-notes-content blockquote {
  border-left: 4px solid var(--vp-c-divider);
  padding-left: 0.75rem;
  color: var(--vp-c-text-2);
}

.release-notes-content code {
  border-radius: 6px;
  padding: 0.2em 0.4em;
  background: var(--vp-c-default-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 85%;
}

.release-notes-content pre {
  overflow-x: auto;
  border-radius: 8px;
  padding: 0.9rem 1rem;
  background: var(--vp-code-block-bg);
}

.release-notes-content pre code {
  padding: 0;
  background: transparent;
}
</style>
