import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './services/authService'
import './utils/envChecker'
import { debugEnvironment } from './utils/debugEnv'

// 調試環境變數
console.log('🚀 應用啟動，調試 API 配置...');
debugEnvironment();

const app = createApp(App)
app.use(router)
app.mount('#app')
