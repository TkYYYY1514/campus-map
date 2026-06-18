<template>
  <div class="login-container">
    <!-- 左侧旋转图标 -->
    <div class="rotating-icon">
      <el-icon :size="80"><Promotion /></el-icon>
    </div>

    <div class="login-card">
      <div class="login-header">
        <h2>校园导航系统</h2>
        <p>{{ isLogin ? '欢迎回来' : '注册新账号' }}</p>
      </div>

      <!-- 快速填充下拉框 -->
      <div class="quick-fill">
        <el-select 
          v-model="selectedRole" 
          placeholder="快速填充测试账号" 
          clearable
          @change="handleQuickFill"
        >
          <el-option label="管理员 (admin / admin123)" value="admin" />
          <el-option label="普通用户 (user1 / 123456)" value="user" />
        </el-select>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" hide-required-asterisk class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <div class="login-buttons">
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册' }}
        </el-button>
        <el-button type="text" @click="toggleMode">
          {{ isLogin ? '没有账号？立即注册' : '已有账号？去登录' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Promotion } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isLogin = ref(true);
const loading = ref(false);
const formRef = ref(null);
const selectedRole = ref('admin');

const form = reactive({
  username: 'admin',
  password: 'admin123',
  confirmPassword: ''
});

const handleQuickFill = (role) => {
  if (role === 'admin') {
    form.username = 'admin';
    form.password = 'admin123';
  } else if (role === 'user') {
    form.username = 'user1';
    form.password = '123456';
  }
  formRef.value?.clearValidate();
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度2-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 20, message: '密码长度3-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  form.username = '';
  form.password = '';
  form.confirmPassword = '';
  selectedRole.value = null;
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    
    if (isLogin.value) {
      const result = await userStore.loginUser(form.username, form.password);
      if (result.success) {
          ElMessage.success('登录成功');
          const redirect = route.query.redirect || '/settings';
          router.push(redirect);
        } else {
        ElMessage.error(result.message || '用户名或密码错误');
      }
    } else {
      const result = await userStore.registerUser(form.username, form.password);
      if (result.success) {
        ElMessage.success('注册成功，请登录');
        isLogin.value = true;
        form.password = '';
        form.confirmPassword = '';
        selectedRole.value = null;
        formRef.value?.clearValidate();
      } else {
        ElMessage.error(result.message || '注册失败');
      }
    }
    
    loading.value = false;
  });
};

onMounted(() => {
  formRef.value?.clearValidate();
});
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  background: #f0f2f5;
  z-index: 9999;
}

/* 左侧旋转图标 */
.rotating-icon {
  animation: spin 0.5s linear infinite;
  color: #2c3e50;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-card {
  width: 460px;
  margin-left: 300px;
  padding: 48px 40px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.login-header p {
  color: #8b8c9e;
  font-size: 14px;
}

.quick-fill {
  margin-bottom: 24px;
}

.quick-fill .el-select {
  width: 100%;
}

/* 表单左对齐 */
.login-form :deep(.el-form-item__label) {
  text-align: left !important;
  padding-left: 0 !important;
}

.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.login-buttons .el-button--primary {
  width: 100%;
  height: 44px;
  font-size: 15px;
  background: #2c3e50;
  border-color: #2c3e50;
}

.login-buttons .el-button--primary:hover {
  background: #34495e;
  border-color: #34495e;
}

.login-buttons .el-button--text {
  color: #8b8c9e;
}

.login-buttons .el-button--text:hover {
  color: #2c3e50;
}
</style>