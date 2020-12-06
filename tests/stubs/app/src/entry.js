import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './pages/routes.js'

const app = createApp(App),
      history = createWebHistory(),
      router = createRouter({
        history,
        strict: true,
        routes,
      })

app.use(router)
app.mount('#app')
