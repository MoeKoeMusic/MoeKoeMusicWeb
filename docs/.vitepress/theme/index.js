import DefaultTheme from 'vitepress/theme'
import './custom.css'
import LanguageSwitcher from './LanguageSwitcher.vue'
import SongShareAnalysis from './SongShareAnalysis.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LanguageSwitcher', LanguageSwitcher)
    app.component('SongShareAnalysis', SongShareAnalysis)
  }
}
