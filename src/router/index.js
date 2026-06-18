import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';
import { useUserStore } from '@/stores/userStore';

const routes = [
  // 登录页
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  // 401 页面（未登录）
  {
    path: '/401',
    name: 'Unauthorized',
    component: () => import('@/views/yc/Unauthorized.vue'),
    meta: { requiresAuth: false }
  },
  // 403 页面（权限不足）
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/yc/Forbidden.vue'),
    meta: { requiresAuth: false }
  },
  // 404 页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/yc/NotFound.vue'),
    meta: { requiresAuth: false }
  },
  // 根路径重定向
  {
    path: '/',
    redirect: '/Settings'
  },
  { 
    path: '/map', 
    name: 'Map', 
    component: () => import('@/views/sidebar/CampusMapInfo.vue'),
    meta: { requiresAuth: true }
  },
  // 建筑搜索  +  评论
  { 
    path: '/comments', 
    name: 'Comments', 
    component: () => import('@/views/sidebar/Comments/Index.vue'),
    meta: { requiresAuth: true }
  },
  // 建筑搜索
  // { 
  //   path: '/search', 
  //   name: 'Search', 
  //   component: () => import('@/views/sidebar/SearchPage/Index.vue'),
  //   meta: { requiresAuth: true }
  // },


  //道路管理
  { 
    path: '/route', 
    name: 'RouteManagement', 
    component: () => import('@/views/sidebar/RouteManagement/Index.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  //POI管理
  { 
    path: '/poi', 
    name: 'PoiOperation', 
    component: () => import('@/views/sidebar/PoiOperation/Index.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  // 导航模拟
  { 
    path: '/nav-sim', 
    name: 'NavSimulate', 
    component: () => import('@/views/sidebar/NavSimulate/Index.vue'),
    meta: { requiresAuth: true }
  },
  //系统设置
  { 
    path: '/settings', 
    name: 'Settings', 
    component: () => import('@/views/sidebar/SystemSettings/Index.vue'),
    meta: { requiresAuth: true }
  },
  // 匹配所有未定义的路由，重定向到404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // 等待认证信息加载完成
  if (userStore.isAuthLoading) {
    // console.log('等待认证加载...');
    await new Promise((resolve) => {
      const stopWatch = watch(
        () => userStore.isAuthLoading,
        (val) => {
          if (!val) {
            stopWatch();
            resolve();
          }
        }
      );
    });
  }
  
  // console.log('当前路径:', to.path);
  // console.log('isLoggedIn:', userStore.isLoggedIn);
  // console.log('isAdmin:', userStore.isAdmin);
  
  // 错误页面直接放行
  if (to.path === '/401' || to.path === '/403' || to.path === '/404') {
    // console.log('错误页面，直接放行');
    next();
    return;
  }
  
  // 登录页
  if (to.path === '/login') {
    if (userStore.isLoggedIn) {
      // console.log('已登录，跳转到地图页');
      next('/map');
    } else {
      // console.log('未登录，显示登录页');
      next();
    }
    return;
  }
  
  // 需要登录的页面
  if (to.meta.requiresAuth) {
    // 未登录 -> 跳转401
    if (!userStore.isLoggedIn) {
      // console.log('未登录，跳转到401');
      next('/401');
      return;
    }
    
    // 已登录，但需要管理员权限 -> 跳转403
    if (to.meta.adminOnly && !userStore.isAdmin) {
      // console.log('普通用户访问管理员页面，跳转到403');
      next('/403');
      return;
    }
  }
  
  // console.log('放行');
  next();
});

export default router;