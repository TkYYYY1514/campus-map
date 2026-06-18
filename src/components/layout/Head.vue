<template>
  <div class="head-btns">
    <!-- 使用 router-link 包裹 el-button，实现跳转 + UI组件的结合 -->
    <router-link 
      v-for="item in visibleMenuList" 
      :key="item.path" 
      :to="item.path"
      custom
      v-slot="{ navigate, isActive }"
    >
      <el-button 
        :type="isActive ? 'primary' : ''" 
        @click="navigate"
        size="default"                     
      >
        {{ item.label }}
      </el-button>
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

// 所有菜单项
const allMenuList = [
{ path: '/map', label: '预览地图', requireAuth: false },
  { path: '/comments', label: '建筑搜索', requireAuth: false },
  // { path: '/search', label: '建筑搜索', requireAuth: false },
  { path: '/nav-sim', label: '路线规划', requireAuth: false },
  { path: '/settings', label: '系统设置', requireAuth: false },
  { path: '/route', label: '道路管理', requireAuth: true, adminOnly: true },
  { path: '/poi', label: 'POI操作', requireAuth: true, adminOnly: true }
];

// 根据用户角色过滤菜单
const visibleMenuList = computed(() => {
  return allMenuList.filter(item => {
    // 不需要登录的菜单，直接显示
    if (!item.requireAuth) return true;
    
    // 需要登录且是管理员
    if (item.adminOnly) {
      return userStore.isLoggedIn && userStore.isAdmin;
    }
    
    // 只需要登录
    return userStore.isLoggedIn;
  });
});
</script>

<style scoped lang="scss">
.head-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>