import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 导入路由
import router from './router'

// 导入 pinia
import { createPinia } from 'pinia'

// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入持久化存储
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
.use(ElementPlus)
.use(router)
.use(pinia)
.mount('#app')
