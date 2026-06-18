<template>
    <div class="settings-container">
      <div class="header">
        <h5>系统设置</h5>
      </div>
  
      <!-- 用户信息区域 -->
      <div class="settings-section">
        <div class="section-title">账号信息</div>
        <div class="user-info-card">
          <div class="user-details">
            <div class="user-name">用户名：{{ userStore.user?.username || '未登录' }}</div>
            <div class="user-role">角色：{{ userStore.isAdmin ? '管理员' : '普通用户' }}</div>
          </div>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
        
        <!-- 普通用户显示修改密码 -->
        <div class="password-change" v-if="!userStore.isAdmin">
          <div class="password-title">修改密码</div>
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="80px" size="small">
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请确认新密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="changePassword">确认修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
  
      <!-- 管理员专属：用户管理列表 -->
      <div class="settings-section admin-section" v-if="userStore.isAdmin">
        <UserList 
          :users="userList" 
          @delete="handleDeleteUser"
          @add="handleAddUser"
          @update="handleUpdateUser"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { useUserStore } from '@/stores/userStore';
  import UserList from './components/UserList.vue';
  import { useNavigationStore } from '@/stores/navigationStore';

  
  const router = useRouter();
  const userStore = useUserStore();
  
  // 修改密码表单
  const passwordFormRef = ref(null);
  const passwordForm = ref({
    newPassword: '',
    confirmPassword: ''
  });
  
  const passwordRules = {
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 3, max: 20, message: '密码长度3-20位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== passwordForm.value.newPassword) {
            callback(new Error('两次输入密码不一致'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  };
  
  // 用户列表
  const userList = ref([]);
  
  // 获取用户列表
  const fetchUserList = async () => {
    const result = await userStore.fetchUsers();
    if (result.success) {
      userList.value = result.data;
    } else {
      ElMessage.error(result.message || '获取用户列表失败');
    }
  };
  
  // 修改密码（不需要原密码）
  const changePassword = async () => {
    if (!passwordFormRef.value) return;
    
    await passwordFormRef.value.validate(async (valid) => {
      if (!valid) return;
      
      const result = await userStore.changeUserPassword(
        passwordForm.value.newPassword,
        passwordForm.value.newPassword
      );
      
      if (result.success) {
        ElMessage.success('密码修改成功，请重新登录');
        passwordForm.value = {
          newPassword: '',
          confirmPassword: ''
        };
        setTimeout(() => {
          userStore.logout();
          router.push('/login');
        }, 1500);
      } else {
        ElMessage.error(result.message || '修改失败');
      }
    });
  };
  
  // 新增用户
  const handleAddUser = async (userData) => {
    const result = await userStore.registerUser(userData.username, userData.password);
    if (result.success) {
      ElMessage.success('新增用户成功');
      fetchUserList();
    } else {
      ElMessage.error(result.message || '新增失败');
    }
  };
  
  // 更新用户（可修改密码）
  const handleUpdateUser = async (userData) => {
    // 如果有密码，修改密码
    if (userData.password) {
      const passwordResult = await userStore.changeUserPassword(
        userData.password,
        userData.password
      );
      if (!passwordResult.success) {
        ElMessage.error('修改密码失败');
        return;
      }
    }
    ElMessage.success('更新成功');
    fetchUserList();
  };
  
  // 删除用户
  const handleDeleteUser = async (user) => {
    if (user.username === 'admin') {
      ElMessage.warning('不能删除管理员账号');
      return;
    }
    
    try {
      await ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      const result = await userStore.deleteUserById(user.id);
      
      if (result.success) {
        ElMessage.success('删除成功');
        fetchUserList();
      } else {
        ElMessage.error(result.message || '删除失败');
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败');
      }
    }
  };
  
  const navStore = useNavigationStore();
  const handleLogout = () => {
    // 清除起点终点
    navStore.clearStartAndEnd();

    userStore.logout();

    ElMessage.success('已退出登录');
    router.push('/login');
  };
  
  onMounted(() => {
    if (userStore.isAdmin) {
      fetchUserList();
    }
  });
  </script>
  
  <style scoped>
  .settings-container {
    border: 1px solid #ddd;
    background-color: rgba(254, 254, 254, 0.862);
    width: 360px;
    display: flex;
    flex-direction: column;
    height: 600px;
    overflow: hidden;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 10px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }
  
  .header h5 {
    margin: 0;
    font-size: 16px;
  }
  
  .settings-section {
    padding: 12px;
    border-bottom: 1px solid #eee;
    overflow: hidden;
  }
  
  .admin-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    border-bottom: none;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }
  
  .user-info-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
  }
  
  .user-details {
    flex: 1;
  }
  
  .user-name {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .user-role {
    font-size: 12px;
    color: #666;
  }
  
  .password-change {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #eee;
  }
  
  .password-title {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }
  </style>