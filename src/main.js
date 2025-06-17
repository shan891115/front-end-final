import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './services/authService'

const app = createApp(App)
app.use(router)
app.mount('#app')
