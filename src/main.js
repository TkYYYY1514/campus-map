import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import * as echarts from 'echarts' 

import { createPinia } from 'pinia'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' 
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { initDB } from './utils/db'
import { useUserStore } from './stores/userStore'

const app = createApp(App)

app.use(VueVirtualScroller)

app.use(router)

app.use(createPinia())      

app.use(ElementPlus)        

initDB().then(() => {
  app.mount('#app')
  const userStore = useUserStore()
  userStore.initAuth()
}).catch(err => {
  console.error('Failed to initialize database:', err)
  app.mount('#app')
})