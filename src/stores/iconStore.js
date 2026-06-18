// stores/iconStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useIconStore = defineStore('icon', () => {
  // 导航图标类型
  const navIconType = ref('arrow');
  
  // 可用图标列表
  const iconTypes = [
    { value: 'none', label: '不显示', icon: '' },
    { value: 'arrow', label: '箭头', icon: '' },
    { value: 'circle', label: '圆形', icon: '' },
    { value: 'car', label: '小车', icon: '' },
    { value: 'bike', label: '自行车', icon: '' },
    { value: 'person', label: '小人', icon: '' }
  ];
  
  // 设置图标类型
  const setNavIconType = (type) => {
    navIconType.value = type;
  };
  
  return {
    navIconType,
    iconTypes,
    setNavIconType
  };
});