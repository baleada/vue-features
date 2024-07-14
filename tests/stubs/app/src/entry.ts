import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import App from './App.vue'
import 'tailwindcss/tailwind.css'

const app = createApp(App),
      history = createWebHistory(),
      router = createRouter({
        history,
        strict: true,
        routes,
      })

app.use(router)
app.mount('#app')

window.nextTick = nextTick
