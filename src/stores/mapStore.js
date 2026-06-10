import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMapStore = defineStore('map', () => {
  // 存储 centerOnPoi 函数引用
  const centerOnPoi = ref(null);

  // 由 MapBackground 组件在初始化时注册
  const registerCenterOnPoi = (fn) => {
    centerOnPoi.value = fn;
  };

  return {
    centerOnPoi,
    registerCenterOnPoi
  };
});