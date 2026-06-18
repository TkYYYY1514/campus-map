// src/stores/userStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  register, 
  login, 
  getCurrentUser,
  getUsers,
  changePassword,
  deleteUser,
  updateUserRole
} from '@/api/user';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const isLoggedIn = ref(false);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthLoading = ref(true);  // 🆕 加载状态

  const isAdmin = computed(() => {
    return user.value?.role === 'admin';
  });

  const initAuth = async () => {
    if (token.value) {
      await fetchUserInfo();
    } else {
      isAuthLoading.value = false;
    }
  };

  const fetchUserInfo = async () => {
    try {
      const result = await getCurrentUser();
      if (result.success) {
        user.value = result.data;
        isLoggedIn.value = true;
      } else {
        logout();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout();
    } finally {
      isAuthLoading.value = false;
    }
  };

  const registerUser = async (username, password) => {
    try {
      const result = await register(username, password);
      return result;
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, message: error.message || '注册失败' };
    }
  };

  const loginUser = async (username, password) => {
    try {
      const result = await login(username, password);
      
      if (result.success) {
        token.value = result.data.token;
        user.value = result.data.user;
        isLoggedIn.value = true;
        localStorage.setItem('token', token.value);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, message: error.message || '登录失败' };
    }
  };

  const logout = () => {
    user.value = null;
    isLoggedIn.value = false;
    token.value = null;
    localStorage.removeItem('token');
  };

  const fetchUsers = async () => {
    try {
      const result = await getUsers();
      return result;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return { success: false, message: error.message };
    }
  };

  const changeUserPassword = async (oldPassword, newPassword) => {
    try {
      const result = await changePassword(oldPassword, newPassword);
      return result;
    } catch (error) {
      console.error('修改密码失败:', error);
      return { success: false, message: error.message };
    }
  };

  const deleteUserById = async (userId) => {
    try {
      const result = await deleteUser(userId);
      return result;
    } catch (error) {
      console.error('删除用户失败:', error);
      return { success: false, message: error.message };
    }
  };

  const updateUserRoleById = async (userId, role) => {
    try {
      const result = await updateUserRole(userId, role);
      return result;
    } catch (error) {
      console.error('更新用户角色失败:', error);
      return { success: false, message: error.message };
    }
  };

  return {
    user,
    isLoggedIn,
    isAdmin,
    isAuthLoading,
    initAuth,
    registerUser,
    loginUser,
    logout,
    fetchUsers,
    changeUserPassword,
    deleteUserById,
    updateUserRoleById
  };
});