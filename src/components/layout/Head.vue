<template>
    <div class="head-btns">
      <!-- ⭐️ 使用 router-link 包裹 el-button，实现跳转 + UI组件的结合 -->
      <router-link 
        v-for="item in menuList" 
        :key="item.path" 
        :to="item.path"
        custom
        v-slot="{ navigate, isActive }"
      >
        <el-button 
          :type="isActive ? 'primary' : ''" 
          @click="navigate"
          round                                
          size="default"                     
        >
          {{ item.label }}
        </el-button>
      </router-link>
    </div>
  </template>
  
  <script setup>
  const menuList = [
    { path: '/map', label: '校园地图' },
    { path: '/route', label: '路线规划' },
    { path: '/search', label: '建筑搜索' },
    { path: '/canteen', label: '食堂筛选' },
    { path: '/dorm', label: '宿舍区' },
    { path: '/nav-sim', label: '一键导航' },
    { path: '/settings', label: '系统设置' },
    { path: '/poi', label: 'POI点位操作' }
  ];
  </script>
  
  <style scoped lang="scss">
  .head-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px; /* 按钮之间的间距 */
  }
  </style>