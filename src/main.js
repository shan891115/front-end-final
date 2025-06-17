import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './services/authService'
import './utils/envChecker'

// 調試環境變數
console.log('🚀 應用啟動，調試 API 配置...');
console.log('環境模式:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
const apiUrl = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'development' ? 'http://localhost:3333/api' : 'https://final-project-backend-blond.vercel.app/api');
console.log('🔍 最終使用的 API URL:', apiUrl);

const app = createApp(App)
app.use(router)
app.mount('#app')
