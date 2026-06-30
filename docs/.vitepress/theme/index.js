import DefaultTheme from 'vitepress/theme'
import './custom.css'
import LanguageSwitcher from './LanguageSwitcher.vue'
import SongShareAnalysis from './SongShareAnalysis.vue'
import PluginMarket from './PluginMarket.vue'
import DownloadPage from './DownloadPage.vue'
import ChangelogPage from './ChangelogPage.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LanguageSwitcher', LanguageSwitcher)
    app.component('SongShareAnalysis', SongShareAnalysis)
    app.component('PluginMarket', PluginMarket)
    app.component('DownloadPage', DownloadPage)
    app.component('ChangelogPage', ChangelogPage)
  }
}
