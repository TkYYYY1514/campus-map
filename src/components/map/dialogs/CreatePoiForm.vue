<!-- components/map/CreatePoiForm.vue -->
<template>
  <div class="create-poi-form">
    <div class="form-item">
      <label>名称 *</label>
      <input v-model="form.name" placeholder="请输入点位名称" />
    </div>
    
    <div class="form-item">
      <label>类型</label>
      <select v-model="form.type">
        <option v-for="(label, key) in POI_TYPE_LABELS" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
    </div>
    
    <div class="form-row">
      <div class="form-item">
        <label>X坐标</label>
        <input v-model.number="form.x" type="number" />
      </div>
      <div class="form-item">
        <label>Y坐标</label>
        <input v-model.number="form.y" type="number" />
      </div>
    </div>
    
    <div class="form-item">
      <label>描述</label>
      <textarea v-model="form.description" rows="3" placeholder="请输入描述"></textarea>
    </div>
    
    <div class="form-actions">
      <!-- 🆕 删除按钮（编辑模式下显示） -->
      <button 
        v-if="isEditMode" 
        class="btn-delete" 
        @click="handleDelete"
      >
        删除
      </button>
      <button class="btn-cancel" @click="cancel">取消</button>
      <button class="btn-submit" @click="submit">确定</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { POI_TYPE_LABELS } from '@/data/poiData';

const props = defineProps({
  initialX: { type: Number, default: 0 },
  initialY: { type: Number, default: 0 },
  initialData: { type: Object, default: null },
  initialType: { type: String, default: 'classroom' },
  onSuccess: { type: Function, default: null },
  onDelete: { type: Function, default: null }  // 🆕 删除回调
});

// 从弹窗壳子注入关闭方法
const closeDialog = inject('close');

// 🆕 判断是否为编辑模式
const isEditMode = computed(() => props.initialData !== null);

const form = reactive({
  name: '',
  type: 'classroom',
  x: props.initialX,
  y: props.initialY,
  description: ''
});

// 如果有初始数据（编辑模式），填充表单
onMounted(() => {
  if (props.initialData) {
    form.name = props.initialData.name || '';
    form.type = props.initialData.type || 'classroom';
    form.x = props.initialData.x || props.initialX;
    form.y = props.initialData.y || props.initialY;
    form.description = props.initialData.description || '';
  } else {
    form.type = props.initialType;
  }
});

const cancel = () => {
  if (closeDialog) {
    closeDialog();
  }
};

const submit = () => {
  if (!form.name) {
    ElMessage.warning('请填写点位名称');
    return;
  }
  if (props.onSuccess) {
    props.onSuccess(form, closeDialog);
  } else {
    if (closeDialog) {
      closeDialog();
    }
  }
};

// 🆕 删除处理
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除点位 "${form.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'delete-dialog-top'
      }
    );
    
    if (props.onDelete) {
      await props.onDelete(props.initialData, closeDialog);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

</script>

<style scoped>
.create-poi-form {
  background-color: rgba(255, 255, 255, 0.75); 
  backdrop-filter: blur(10px);
  width: 280px;
  padding: 14px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.form-item {
  margin-bottom: 8px;
}

.form-item label {
  display: block;
  margin-bottom: 3px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.6);
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-row .form-item {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn-cancel {
  padding: 5px 12px;
  border: 1px solid #ddd;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.8);
}

.btn-submit {
  padding: 5px 12px;
  background: #409eff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: white;
}

.btn-submit:hover {
  background: #66b1ff;
}

/* 🆕 删除按钮样式 */
.btn-delete {
  padding: 5px 12px;
  background: #f56c6c;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: white;
  margin-right: auto;
}

.btn-delete:hover {
  background: #f78989;
}
</style>