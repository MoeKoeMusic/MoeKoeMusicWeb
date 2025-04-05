import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MoeKoe Music',
  description: '现代化的酷狗第三方客户端 - 开源、简洁、高颜值的跨平台音乐播放器，支持Hi-Fi品质音频播放，让您畅享优质音乐体验',

  // 多语言配置
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'MoeKoe Music',
      description: '现代化的酷狗第三方客户端 - 开源、简洁、高颜值的跨平台音乐播放器，支持Hi-Fi品质音频播放，让您畅享优质音乐体验'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'MoeKoe Music',
      description: 'Modern Kugou third-party client - Open-source, concise, beautiful cross-platform music player with Hi-Fi audio playback'
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      title: 'MoeKoe Music',
      description: 'モダンなKugouサードパーティクライアント - オープンソース、シンプル、美しいクロスプラットフォーム音楽プレーヤー、Hi-Fi品質のオーディオ再生をサポート'
    },
    'zh-TW': {
      label: '繁體中文',
      lang: 'zh-TW',
      title: 'MoeKoe Music',
      description: '現代化的酷狗第三方客戶端 - 開源、簡潔、高顏值的跨平台音樂播放器，支持Hi-Fi品質音頻播放，讓您暢享優質音樂體驗'
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/ico.png' }],
    ['title', {}, 'MoeKoe Music - 现代化的酷狗第三方客户端']
  ],
  themeConfig: {
    logo: '/logo.png',
    
    // 多语言配置
    localeLinks: {
      text: '语言',
      items: [
        { text: '简体中文', link: '/' },
        { text: 'English', link: '/en/' },
        { text: '日本語', link: '/ja/' },
        { text: '繁體中文', link: '/zh-TW/' }
      ]
    },
    
    nav: [
      { text: '快速开始', link: '#' },
      { text: '下载', link: '/download' },
      { text: '关于', link: '/about' },
      { text: 'API', link: '/websocket-api' },
      { text: 'GitHub', link: 'https://github.com/iAJue/MoeKoeMusic' }
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '#' },
          { text: '安装说明', link: '#' },
          { text: '开发部署', link: '#'},
          { text: 'WebSocket', link: '/websocket-api' }
        ]
      },
      {
        text: '功能特性',
        items: [
          { text: '账号登录', link: '#' },
          { text: '歌词显示', link: '#' },
          { text: '每日推荐', link: '#' },
          { text: '主题切换', link: '#' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/iAJue/MoeKoeMusic' }
    ],

    footer: {
      message: '基于 GPL-2.0 license 发布',
      copyright: 'Copyright © 2025 MoeKoe Music'
    }
  }
})