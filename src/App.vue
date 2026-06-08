<template>
  <!-- ✅ 添加唯一根节点 -->
  <div class="app-container">
    <MapBackground @map-click="handleMapClick"/>
    
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

const handleMapClick = (position) => {
  console.log('点击位置:', position)
  console.log('原始X坐标:', position.x)
  console.log('原始Y坐标:', position.y)
  
  // 根据坐标做后续操作，如：
  // - 显示标记点
  // - 弹出建筑信息
  // - 导航到某个位置
}

const isUIHidden = ref(false);

// 切换UI显隐的方法
const toggleUI = () => {
  isUIHidden.value = !isUIHidden.value;
};
</script>

<style scoped>
/* ⭐️ 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ⭐️ 核心容器：作为绝对定位的参考系 */
#app {
  width: 100%;
  height: 100%;
  position: relative; /* 必须有这个，子元素的 absolute 才能相对它定位 */
  overflow: hidden;   /* 建议改为 hidden，防止出现不必要的滚动条 */
  z-index: 3; 
}

/* ⭐️ 顶部导航：绝对定位 + 完美水平居中 */
.head {
  position: absolute;       /* 脱离文档流，但受限于 #app */
  top: 20px;
  left: 50%;                /* 先向右移动父容器宽度的 50% */
  transform: translateX(-50%); /* 再向左平移自身宽度的 50%，实现完美居中 */
  
  display: flex;             
  justify-content: center;   
  align-items: center;       
  width: 80%;               
  height: 60px;              
  z-index: 10;               
  background-color: rgba(255, 255, 255, 0.8); 
  pointer-events: auto;     /* 恢复头部按钮的点击事件 */
}

/* ⭐️ 左侧侧边栏：绝对定位 */
.left {
  position: absolute;         /* 脱离文档流 */
  top: 120px;                  /* 距离顶部留出导航的高度 */
  left: 30px;                 /* 距离左侧边缘 */
  width: 350px;               /* 建议稍微加宽一点，适配 Element Plus 组件 */
  z-index: 5;                 
  pointer-events: none;       /* 允许鼠标事件穿透到下层地图 */
}

/* ⭐️ 确保侧边栏里的具体页面可以接收点击 */
.left > * {
  pointer-events: auto; 
}


.toggle-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20; /* 确保始终在最上层 */
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
.fade-slide-down-enter-active, .fade-slide-down-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-down-enter-from, .fade-slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px); /* 向上滑动并消失 */
}

/* ⭐️ 左侧侧边栏退出/进入动画 */
.fade-slide-left-enter-active, .fade-slide-left-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-left-enter-from, .fade-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px); /* 向左滑动并消失 */
}


</style>