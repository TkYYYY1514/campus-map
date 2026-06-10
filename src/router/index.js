import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  // ⭐️ 访问根路径时，直接重定向到 /map
  {
    path: '/',
    redirect: '/map' 
  },
  { 
    path: '/map', 
    name: 'CampusMap', 
    component: () => import('@/views/sidebar/CampusMapInfo.vue') 
  },
  { 
    path: '/route', 
    name: 'RoutePlan', 
    component: () => import('@/views/sidebar/RoutePlanPanel.vue') 
  },
  { 
    path: '/search', 
    name: 'Search', 
    component: () => import('@/views/sidebar/SearchPage.vue') 
  },
  { 
    path: '/canteen', 
    name: 'Canteen', 
    component: () => import('@/views/sidebar/CanteenFilter.vue') 
  },
  { 
    path: '/dorm', 
    name: 'Dorm', 
    component: () => import('@/views/sidebar/DormArea.vue') 
  },
  { 
    path: '/poi', 
    name: 'PoiOperation', 
    component: () => import('@/views/sidebar/PoiOperation/index.vue') 
  },
  { 
    path: '/nav-sim', 
    name: 'NavSimulate', 
    component: () => import('@/views/sidebar/NavSimulate.vue') 
  },
  { 
    path: '/settings', 
    name: 'Settings', 
    component: () => import('@/views/sidebar/SystemSettings.vue') 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;