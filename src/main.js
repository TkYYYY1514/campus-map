import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import * as echarts from 'echarts' 

import { createPinia } from 'pinia'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' 

// --- 创建 Vue 应用实例 ---
const app = createApp(App)


app.use(router)

app.use(createPinia())      

app.use(ElementPlus)        

// 挂载到 DOM 节点
app.mount('#app')