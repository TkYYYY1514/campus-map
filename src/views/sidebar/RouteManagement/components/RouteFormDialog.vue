<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑路线' : '新增路线'"
    width="420px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="localForm"
      :rules="formRules"
      label-width="70px"
      size="small"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="localForm.name" placeholder="请输入路线名称" clearable />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="localForm.description"
          type="textarea"
          :rows="2"
          placeholder="请输入路线描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="颜色" prop="color">
            <el-color-picker v-model="localForm.color" size="small" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="线宽" prop="width">
            <el-input-number
              v-model="localForm.width"
              :min="1"
              :max="10"
              :step="1"
              size="small"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="样式" prop="style">
        <el-radio-group v-model="localForm.style" size="small">
          <el-radio label="solid">实线</el-radio>
          <el-radio label="dashed">虚线</el-radio>
          <el-radio label="dotted">点线</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 节点管理区域 -->
      <el-form-item label="路径节点">
        <div class="nodes-toolbar">
          <el-button size="small" type="primary" plain @click="showWaypointSelector = true">
            + 从路径点添加
          </el-button>
        </div>
        
        <div class="nodes-container">
          <el-scrollbar max-height="130px">
            <div v-if="localForm.nodes.length === 0" class="empty-nodes">
              暂无节点，请点击上方按钮添加路径点
            </div>
            <div
              v-for="(node, index) in localForm.nodes"
              :key="index"
              class="node-item"
            >
              <span class="node-order">{{ index + 1 }}</span>
              <span class="node-info">
                {{ node.name }}
                <span class="node-coords">({{ node.x }}, {{ node.y }})</span>
              </span>
              <div class="node-actions">
                <el-button
                  size="small"
                  :disabled="index === 0"
                  @click="moveNode(index, 'up')"
                >
                  ↑
                </el-button>
                <el-button
                  size="small"
                  :disabled="index === localForm.nodes.length - 1"
                  @click="moveNode(index, 'down')"
                >
                  ↓
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  text
                  @click="removeNode(index)"
                >
                  ×
                </el-button>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-form-item>

      <el-form-item label="可见性" prop="is_active">
        <el-switch
          v-model="localForm.is_active"
          :active-value="1"
          :inactive-value="0"
          active-text="显示"
          inactive-text="隐藏"
          size="small"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button size="small" type="primary" @click="submit">确定</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 路径点选择弹窗（带搜索） -->
  <el-dialog v-model="showWaypointSelector" title="选择路径点" width="380px">
    <el-input
      v-model="waypointSearchKeyword"
      placeholder="搜索路径点名称"
      clearable
      size="small"
      prefix-icon="Search"
      class="search-input"
    />
    
    <el-scrollbar max-height="280px" class="waypoint-list-scroll">
      <div
        v-for="poi in filteredWaypointPois"
        :key="poi.id"
        class="waypoint-select-item"
        @click="addWaypointToNodes(poi)"
      >
        <div class="wp-name">{{ poi.name }}</div>
        <div class="wp-coords">坐标: ({{ poi.x }}, {{ poi.y }})</div>
      </div>
      <div v-if="filteredWaypointPois.length === 0" class="empty-waypoints">
        {{ waypointSearchKeyword ? '没有找到匹配的路径点' : '暂无路径点，请在地图上右键并选择类型为"路径点"' }}
      </div>
    </el-scrollbar>
    <template #footer>
      <el-button size="small" @click="showWaypointSelector = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { usePoiStore } from '@/stores/poiStore';

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
      description: '',
      color: '#1890ff',
      width: 3,
      style: 'solid',
      nodes: [],
      is_active: 1
    })
  }
});

const emit = defineEmits(['update:visible', 'submit', 'close']);

const poiStore = usePoiStore();

// 只获取类型为 'waypoint' 的 POI
const waypointPois = computed(() => {
  return poiStore.pois.filter(poi => poi.type === 'waypoint' && poi.is_visible === 1);
});

const waypointSearchKeyword = ref('');

const filteredWaypointPois = computed(() => {
  if (!waypointSearchKeyword.value.trim()) {
    return waypointPois.value;
  }
  const keyword = waypointSearchKeyword.value.toLowerCase().trim();
  return waypointPois.value.filter(poi => 
    poi.name.toLowerCase().includes(keyword)
  );
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const showWaypointSelector = ref(false);
const formRef = ref(null);
const localForm = reactive({ ...props.formData });

const formRules = {
  name: [
    { required: true, message: '请输入路线名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择颜色', trigger: 'change' }
  ],
  width: [
    { required: true, message: '请设置线宽', trigger: 'blur' }
  ],
  style: [
    { required: true, message: '请选择样式', trigger: 'change' }
  ]
};

watch(showWaypointSelector, (newVal) => {
  if (!newVal) {
    waypointSearchKeyword.value = '';
  }
});

watch(() => props.formData, (newVal) => {
  Object.assign(localForm, {
    ...newVal,
    nodes: [...(newVal.nodes || [])]
  });
}, { deep: true, immediate: true });

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
  formRef.value?.resetFields();
};

const submit = async () => {
  try {
    await formRef.value?.validate();
    
    if (localForm.nodes.length < 2) {
      ElMessage.warning('路线至少需要2个节点');
      return;
    }
    
    // 转换数据格式：后端期望 nodes 数组中每个节点有 poi_id
    const submitData = {
      ...localForm,
      nodes: localForm.nodes.map(node => ({
        poi_id: node.poi_id
      }))
    };
    
    emit('submit', submitData);
  } catch (error) {
    ElMessage.warning('请填写完整信息');
  }
};

// 添加路径点到节点列表
const addWaypointToNodes = (poi) => {
  const exists = localForm.nodes.some(node => node.poi_id === poi.id);
  if (exists) {
    ElMessage.warning('该路径点已添加');
    return;
  }
  
  localForm.nodes.push({
    poi_id: poi.id,
    name: poi.name,
    x: poi.x,
    y: poi.y
  });
  
  ElMessage.success(`已添加节点: ${poi.name}`);
};

const moveNode = (index, direction) => {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= localForm.nodes.length) return;
  [localForm.nodes[index], localForm.nodes[newIndex]] = 
  [localForm.nodes[newIndex], localForm.nodes[index]];
};

const removeNode = (index) => {
  localForm.nodes.splice(index, 1);
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.nodes-toolbar {
  margin-bottom: 8px;
}

.nodes-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #f5f7fa;
}

.empty-nodes {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 20px 0;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.node-item:last-child {
  margin-bottom: 0;
}

.node-order {
  font-size: 12px;
  font-weight: 600;
  color: #409eff;
  min-width: 20px;
}

.node-info {
  flex: 1;
  font-size: 12px;
  color: #606266;
}

.node-coords {
  font-size: 11px;
  color: #909399;
  margin-left: 8px;
}

.node-actions {
  display: flex;
  gap: 4px;
}

.search-input {
  margin-bottom: 12px;
}

.waypoint-list-scroll {
  max-height: 280px;
}

.waypoint-select-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.waypoint-select-item:hover {
  background: #ecf5ff;
  border-color: #409eff;
}

.waypoint-select-item .wp-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.waypoint-select-item .wp-coords {
  font-size: 12px;
  color: #909399;
}

.empty-waypoints {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

:deep(.el-dialog) {
  --el-dialog-bg-color: white;
  --el-dialog-border-radius: 8px;
}
</style>