<template>
  <!-- ✅ 添加唯一根节点 -->
  <div class="app-container">
    <MapBackground 
    ref="mapRef"
    @map-click="handleMapClick"/>
    
    <div class="toggle-btn" @click="toggleUI">
      {{ isUIHidden ? '显示UI' : '隐藏UI' }}
    </div>

    <transition name="fade-slide-down">
      <Head v-show="!isUIHidden" class="head" />
    </transition>

    <transition name="fade-slide-left">
      <div v-show="!isUIHidden" class="left">
        <router-view />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MapBackground from '@/components/map/MapBackground.vue';
import Head from '@/components/layout/Head.vue';

// 创建地图组件的 ref
const mapRef = ref(null);
const handleMapClick = (position) => {
  console.log('点击位置:', position)
  console.log('原始X坐标:', position.x)
  console.log('原始Y坐标:', position.y)
}

const isUIHidden = ref(false);

// 切换UI显隐的方法
const toggleUI = () => {
  isUIHidden.value = !isUIHidden.value;
};
</script>

<style>
/* ========== 全局样式（不加 scoped）========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 禁止最外层滚动，但保留内部滚动 */
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;  /* 禁止外层滚动条 */
  position: fixed;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;  /* 禁止外层滚动 */
  position: relative;
  z-index: 3;
}
</style>

<style scoped>
/* ========== 组件样式 ========== */
.app-container {
  width: 100%;
  height: 100%;
  overflow: hidden;  /* 禁止最外层滚动 */
}

/* ⭐️ 顶部导航：绝对定位 + 完美水平居中 */
.head {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 60px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  pointer-events: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* ⭐️ 左侧侧边栏：绝对定位 */
.left {
  
  position: absolute;
  top: 120px;
  left: 80px;
  width: 350px;
  z-index: 5;
  pointer-events: none;
}

/* ⭐️ 确保侧边栏里的具体页面可以接收点击，并且内部可以滚动 */
.left > * {
  pointer-events: auto;
  /* 内部列表可以正常滚动 */
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.toggle-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
}

.toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* ⭐️ 顶部导航退出/进入动画 */
.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-down-enter-from,
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* ⭐️ 左侧侧边栏退出/进入动画 */
.fade-slide-left-enter-active,
.fade-slide-left-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-left-enter-from,
.fade-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>