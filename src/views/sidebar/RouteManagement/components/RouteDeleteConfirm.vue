<template>
  <el-dialog
    v-model="dialogVisible"
    title="删除确认"
    width="320px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="confirm-content">
      <el-icon :size="24" color="#f56c6c">
        <WarningFilled />
      </el-icon>
      <span>确定删除 "{{ routeName }}" 吗？</span>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="danger" @click="confirm">删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  routeName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'confirm']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const handleClose = () => {
  emit('update:visible', false);
};

const confirm = () => {
  emit('confirm');
  handleClose();
};
</script>

<style scoped>
.confirm-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 0;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
