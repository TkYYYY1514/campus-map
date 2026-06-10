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
      <button class="btn-cancel" @click="cancel">取消</button>
      <button class="btn-submit" @click="submit">确定</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { POI_TYPE_LABELS } from '@/data/poiData';

const props = defineProps({
  initialX: { type: Number, default: 0 },
  initialY: { type: Number, default: 0 },
  onSuccess: { type: Function, default: null }
});

// 从弹窗壳子注入关闭方法
const closeDialog = inject('close');

const form = reactive({
  name: '',
  type: 'classroom',
  x: props.initialX,
  y: props.initialY,
  description: ''
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
    // 传递 closeDialog 给 onSuccess，让外部决定何时关闭
    props.onSuccess(form, closeDialog);
  } else {
    // 如果没有 onSuccess，直接关闭
    if (closeDialog) {
      closeDialog();
    }
  }
};
</script>

<style scoped>
.create-poi-form {
  background: white;
  width: 360px;
  padding: 20px;
  border-radius: 8px;
}

.form-item {
  margin-bottom: 12px;
}

.form-item label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-item {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.btn-cancel {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  padding: 6px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit:hover {
  background: #66b1ff;
}
</style>