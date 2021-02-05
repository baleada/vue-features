import { createApp, nextTick } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './pages/routes.js'

// console.log(routes.find(({ path }) => path === '/useWidth/index').component)

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
