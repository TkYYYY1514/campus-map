<!-- components/PoiFormDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑点位' : '新增点位'"
    width="400px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="localForm"
      :rules="formRules"
      label-width="80px"
      size="default"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="localForm.name" placeholder="请输入点位名称" clearable />
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-select v-model="localForm.type" placeholder="请选择类型" style="width: 100%">
          <el-option
            v-for="(label, key) in POI_TYPE_LABELS"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </el-form-item>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="X坐标" prop="x">
            <el-input-number
              v-model="localForm.x"
              :controls="false"
              placeholder="X坐标"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Y坐标" prop="y">
            <el-input-number
              v-model="localForm.y"
              :controls="false"
              placeholder="Y坐标"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="localForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="可见性" prop="is_visible">
        <el-switch
          v-model="localForm.is_visible"
          :active-value="1"
          :inactive-value="0"
          active-text="可见"
          inactive-text="隐藏"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { POI_TYPE_LABELS } from '@/data/poiData';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({
      id: null,
      name: '',
      type: 'classroom',
      x: 0,
      y: 0,
      description: '',
      is_visible: 1
    })
  }
});

const emit = defineEmits(['update:visible', 'submit', 'close']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const formRef = ref(null);

const localForm = reactive({ ...props.formData });

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入点位名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择点位类型', trigger: 'change' }
  ],
  x: [
    { required: true, message: '请输入X坐标', trigger: 'blur' },
    { type: 'number', message: '请输入数字', trigger: 'blur' }
  ],
  y: [
    { required: true, message: '请输入Y坐标', trigger: 'blur' },
    { type: 'number', message: '请输入数字', trigger: 'blur' }
  ]
};

watch(() => props.formData, (newVal) => {
  Object.assign(localForm, newVal);
}, { deep: true, immediate: true });

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
  formRef.value?.resetFields();
};

const submit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', { ...localForm });
  } catch (error) {
    ElMessage.warning('请填写完整信息');
  }
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 保持原有颜色风格，不强制覆盖 */
:deep(.el-dialog) {
  --el-dialog-bg-color: white;
  --el-dialog-border-radius: 8px;
}
</style>