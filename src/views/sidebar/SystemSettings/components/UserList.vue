<template>
    <div class="user-list-container">
      <!-- 搜索和新增栏 -->
      <div class="user-list-toolbar">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索用户名" 
          size="small"
          clearable
          prefix-icon="Search"
          class="search-input"
        />
        <el-button type="primary" size="small" @click="handleAdd">新增用户</el-button>
      </div>
  
      <div class="user-list-header">
        <span>用户名</span>
        <span>角色</span>
        <span>操作</span>
      </div>
      
      <DynamicScroller
        v-if="filteredUsers.length > 0"
        :items="filteredUsers"
        :min-item-size="50"
        class="user-scroller"
        key-field="id"
      >
        <template #default="{ item: user, active }">
          <DynamicScrollerItem :item="user" :active="active" :size-dependencies="[user.username]">
            <div class="user-list-item">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-role" :class="{ 'is-admin': user.role === 'admin' }">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
              <span class="user-actions">
                <el-button 
                  size="small" 
                  type="primary" 
                  plain 
                  @click="handleEdit(user)"
                  :disabled="user.username === 'admin'"
                >编辑</el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  plain 
                  @click="handleDelete(user)"
                  :disabled="user.username === 'admin'"
                >删除</el-button>
              </span>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
      
      <el-empty 
        v-else
        description="暂无用户"
        :image-size="60"
      />
  
      <!-- 新增/编辑用户对话框 -->
      <el-dialog 
        v-model="dialogVisible" 
        :title="isEdit ? '编辑用户' : '新增用户'"
        width="320px"
      >
        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="form.password" 
              type="password" 
              :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'" 
              show-password 
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
  import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
  
  const props = defineProps({
    users: {
      type: Array,
      required: true,
      default: () => []
    }
  });
  
  const emit = defineEmits(['delete', 'add', 'update']);
  
  // 搜索
  const searchKeyword = ref('');
  const filteredUsers = computed(() => {
    if (!searchKeyword.value.trim()) {
      return props.users;
    }
    const keyword = searchKeyword.value.toLowerCase().trim();
    return props.users.filter(user => 
      user.username.toLowerCase().includes(keyword)
    );
  });
  
  // 对话框
  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const formRef = ref(null);
  
  const form = ref({
    id: null,
    username: '',
    password: ''
  });
  
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度2-20位', trigger: 'blur' }
    ],
    password: [
      { 
        required: true, 
        message: '请输入密码', 
        trigger: 'blur',
        validator: (rule, value, callback) => {
          // 编辑时密码可以为空（留空表示不修改）
          if (isEdit.value && !value) {
            callback();
          } else if (!value) {
            callback(new Error('请输入密码'));
          } else if (value.length < 3 || value.length > 20) {
            callback(new Error('密码长度3-20位'));
          } else {
            callback();
          }
        }
      }
    ]
  };
  
  // 新增用户
  const handleAdd = () => {
    isEdit.value = false;
    form.value = {
      id: null,
      username: '',
      password: ''
    };
    dialogVisible.value = true;
  };
  
  // 编辑用户
  const handleEdit = (user) => {
    isEdit.value = true;
    form.value = {
      id: user.id,
      username: user.username,
      password: ''
    };
    dialogVisible.value = true;
  };
  
  // 提交
  const submit = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid) => {
      if (!valid) return;
      
      if (isEdit.value) {
        // 编辑用户
        const updateData = {
          id: form.value.id,
          username: form.value.username
        };
        // 如果填写了密码，则修改密码
        if (form.value.password) {
          updateData.password = form.value.password;
        }
        emit('update', updateData);
      } else {
        // 新增用户
        emit('add', {
          username: form.value.username,
          password: form.value.password
        });
      }
      dialogVisible.value = false;
    });
  };
  
  // 删除用户
  const handleDelete = (user) => {
    emit('delete', user);
  };
  </script>
  
  <style scoped>
  .user-list-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .user-list-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    padding: 0 4px;
  }
  
  .search-input {
    flex: 1;
  }
  
  .user-list-header {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
    font-weight: bold;
    color: #606266;
    margin-bottom: 8px;
    flex-shrink: 0;
  }
  
  .user-list-header span {
    flex: 1;
  }
  
  .user-list-header span:first-child {
    flex: 2;
  }
  
  .user-list-header span:last-child {
    flex: 2;
    text-align: right;
  }
  
  .user-scroller {
    flex: 1;
    min-height: 0;
  }
  
  .user-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #ebeef5;
    transition: background 0.2s;
  }
  
  .user-list-item:hover {
    background: #f5f7fa;
  }
  
  .user-list-item span {
    flex: 1;
  }
  
  .user-list-item span:first-child {
    flex: 2;
  }
  
  .user-list-item span:last-child {
    flex: 2;
    text-align: right;
  }
  
  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
  
  .user-role {
    font-size: 12px;
    color: #909399;
  }
  
  .user-role.is-admin {
    color: #e6a23c;
    font-weight: 500;
  }
  
  .user-actions {
    text-align: right;
    flex: 2;
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }
  </style>