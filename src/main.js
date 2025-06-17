import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './services/authService'
import './utils/envChecker'

const app = createApp(App)
app.use(router)
app.mount('#app')
