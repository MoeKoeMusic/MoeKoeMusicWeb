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
      { text: '快速开始', link: '/quick-start' },
      { text: '下载', link: '/download' },
      { text: '关于', link: '/about' },
      { text: 'API', link: '/api-docs' },
      { text: 'GitHub', link: 'https://github.com/iAJue/MoeKoeMusic' }
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/quick-start' },
          { text: '安装说明', link: '/installation' },
          { text: '开发部署', link: '/development'},
          { text: 'WebSocket API', link: '/websocket-api' },
          { text: 'Web API', link: '/api-docs' },
          { text: '许可证', link: 'https://github.com/iAJue/MoeKoeMusic?tab=GPL-2.0-1-ov-file#readme' },
          { text: '贡献指南', link: 'https://github.com/iAJue/MoeKoeMusic/blob/main/CONTRIBUTING.md' },
          { text: '贡献公约', link: 'https://github.com/iAJue/MoeKoeMusic?tab=coc-ov-file' }
        ]
      },
      {
        text: '故障排查',
        items: [
          { text: '调试模式和错误排查', link: '/debug-mode' },
          { text: 'macOS 常见问题', link: '/mac-troubleshooting' }
        ]
      },
      {
        text: '功能说明',
        items: [
          { text: '网络模式切换', link: '/guide/network-modes' },
          { text: '字体设置与自定义', link: '/guide/font-settings' },
          { text: '数据源说明', link: '/guide/data-source' },
          { text: '音频响度平衡', link: '/guide/volume-normalization' },
          { text: '音频输出设备', link: '/guide/audio-output-device' },
          { text: '输出设备变化自动暂停', link: '/guide/auto-pause-on-output-device-change' },
          { text: '歌词复制', link: '/guide/lyrics-copy' },
          { text: 'RPC地址', link: '/guide/rpc-api-base-url' },
        ]
      },
      {
        text: '常见问题',
        items: [
          { text: '账号登录问题', link: '/faq/login-issues' },
          { text: 'VIP相关问题', link: '/faq/vip-issues' },
          { text: '服务器错误问题', link: '/faq/server-errors' },
          { text: 'Mac系统应用显示已损坏', link: '/faq/mac-damaged' },
          { text: 'macOS ARM设备API启动失败', link: '/faq/macos-api-failed' },
          { text: 'Windows 无法启动（Native stack trace）', link: '/faq/windows-startup-crash' },
          { text: 'Windows 7系统兼容性问题', link: '/faq/win7-compatibility' },
          { text: 'Ubuntu系统沙箱启动失败', link: '/faq/ubuntu-sandbox' },
          { text: '麦克风权限问题', link: '/faq/microphone-permission' },
          { text: '解锁桌面歌词', link: '/faq/unlock-desktop-lrc' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/iAJue/MoeKoeMusic' }
    ],

    editLink: {
      pattern: 'https://github.com/MoeKoeMusic/MoeKoeMusicWeb/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    footer: {
      message: '基于 GPL-2.0 license 发布',
      copyright: 'Copyright © 2025 MoeKoe Music'
    }
  }
})
