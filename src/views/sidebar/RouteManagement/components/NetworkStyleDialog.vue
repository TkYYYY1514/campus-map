<template>
    <el-dialog
      v-model="dialogVisible"
      title="编辑路网样式"
      width="400px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form label-width="80px" size="small">
        <el-form-item label="颜色">
          <el-color-picker v-model="localStyle.color" size="small" />
        </el-form-item>
  
        <el-form-item label="线宽">
          <el-input-number
            v-model="localStyle.width"
            :min="1"
            :max="10"
            :step="1"
            size="small"
            style="width: 100%"
          />
        </el-form-item>
  
        <el-form-item label="样式">
          <el-radio-group v-model="localStyle.style" size="small">
            <el-radio label="solid">实线</el-radio>
            <el-radio label="dashed">虚线</el-radio>
            <el-radio label="dotted">点线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch } from 'vue';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    currentStyle: {
      type: Object,
      default: () => ({
        color: '#d9d9d9',
        width: 2,
        style: 'dashed'
      })
    }
  });
  
  const emit = defineEmits(['update:visible', 'success']);
  
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  });
  
  const localStyle = reactive({ ...props.currentStyle });
  
  // 监听 currentStyle 变化，更新本地样式
  watch(() => props.currentStyle, (newVal) => {
    if (newVal) {
      localStyle.color = newVal.color;
      localStyle.width = newVal.width;
      localStyle.style = newVal.style;
    }
  }, { deep: true, immediate: true });
  
  const handleClose = () => {
    emit('update:visible', false);
  };
  
  const handleConfirm = () => {
    emit('success', { ...localStyle });
    emit('update:visible', false);
  };
  </script>
  
  <style scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  </style>