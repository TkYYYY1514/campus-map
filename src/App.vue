<template>
  <div class="app-container">
    <!-- 不需要地图背景和UI组件的页面 -->
    <template v-if="isFullPageRoute">
      <router-view />
    </template>

    <!-- 需要地图背景和UI组件的页面 -->
    <template v-else>

      <MapBackground 
        ref="mapRef"
        @map-click="handleMapClick"
        @scale-change="handleScaleChange"
      />

      <ViewControls 
        :is-ui-hidden="isUIHidden"
        @toggle-ui="toggleUI"
      />

      <transition name="fade-slide-up">
        <WeatherWidget v-show="!isUIHidden" />
      </transition>

      <transition name="fade-slide-down">
        <Head v-show="!isUIHidden" class="head" />
      </transition>

      <transition name="fade-slide-left">
        <div v-show="!isUIHidden" class="left">
          <router-view />
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MapBackground from '@/components/map/MapBackground.vue';
import Head from '@/components/layout/Head.vue';
import ViewControls from '@/components/layout/ViewControls.vue';
import WeatherWidget from '@/components/layout/WeatherWidget.vue';
import showDialog from '@/components/Dialog/Dialog.js';

const router = useRouter();
const route = useRoute();
const mapRef = ref(null);
const isUIHidden = ref(false);

const scale = ref(1);
const initialScale = ref(1);

// 🆕 全屏页面路由列表（不需要地图背景和UI组件）
const fullPageRoutes = ['/login', '/403', '/404','/401'];

const isFullPageRoute = computed(() => {
  return fullPageRoutes.includes(route.path);
});

const handleMapClick = (position) => {
  console.log('点击位置:', position);
};

const toggleUI = () => {
  isUIHidden.value = !isUIHidden.value;
};

const handleScaleChange = (newScale) => {
  scale.value = newScale;
  if (initialScale.value === 1 && newScale !== 1) {
    initialScale.value = newScale;
  }
};

router.afterEach(() => {
  showDialog({}, {}, {}, 'clearAll');
});


</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  z-index: 3;
}
</style>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.head {
  position: absolute;
  top: 20px;
  left: 60%;
  padding: 0 20px;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  pointer-events: auto;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.left {
  position: absolute;
  top: 120px;
  left: 20px;
  width: 350px;
  z-index: 5;
  pointer-events: none;
}

.left > * {
  pointer-events: auto;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-down-enter-from,
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

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