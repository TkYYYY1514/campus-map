<template>
  <div
    :class="['poi-marker', { 'waypoint-marker': poi.type === 'waypoint' }]"
    :style="markerStyle"
    @click.stop="handleClick"
    @mouseenter="$emit('hover', poi)"
    @mouseleave="$emit('leave', poi)"
  >
    <!-- 路径点：独立样式 -->
    <template v-if="poi.type === 'waypoint'">
      <div class="waypoint-icon" :class="{ active: isActive }">
        <span class="waypoint-dot"></span>
      </div>
      <transition name="label-fade">
        <div v-if="(showLabel || isActive) && showLabelGlobal" class="waypoint-label">
          {{ poi.name }}
        </div>
      </transition>
    </template>

    <!-- 普通 POI：原有样式 -->
    <template v-else>
      <div class="poi-icon" :class="{ active: isActive }" :style="iconStyle">
        <slot name="icon">
          <span class="default-dot"></span>
        </slot>
      </div>
      <transition name="label-fade">
        <div v-if="(showLabel || isActive) && showLabelGlobal" class="poi-label">
          {{ poi.name }}
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { POI_TYPE_COLORS } from '@/data/poiData';

const props = defineProps({
  poi: {
    type: Object,
    required: true,
    validator: (v) => v.x !== undefined && v.y !== undefined
  },
  isActive: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false },
  showLabelGlobal: { type: Boolean, default: true },  // 🆕 全局标签显隐控制
  scale: { type: Number, default: 1 }
});

const emit = defineEmits(['click', 'hover', 'leave']);

const markerStyle = computed(() => ({
  transform: `translate(${props.poi.x}px, ${props.poi.y}px)`
}));

const iconStyle = computed(() => ({
  backgroundColor: props.isActive 
    ? '#FFD700' 
    : POI_TYPE_COLORS[props.poi.type] || '#409eff'
}));

const handleClick = () => {
  emit('click', props.poi);
};
</script>

<style scoped>
.poi-marker {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: center bottom;
  cursor: pointer;
  z-index: 5;
  white-space: nowrap;
  pointer-events: auto;
}

/* ========== 普通 POI 样式（保持不变） ========== */
.poi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  margin-left: -12px;
  margin-top: -24px;
}

.poi-icon.active {
  background: #000000;
  transform: scale(2);
  z-index: 10;
}

.default-dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
}

.poi-label {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 20px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 12px;
  border-radius: 3px;
  pointer-events: none;
}

/* ========== 路径点独立样式 ========== */
.waypoint-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #000000;
  border: 2px solid #fff;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  margin-left: -8px;
  margin-top: -16px;
}

.waypoint-icon.active {
  background-color: #000000;
  transform: scale(1.5);
  z-index: 10;
}

.waypoint-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 1px;
}

.waypoint-label {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 18px;
  padding: 2px 3px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 6px;
  border-radius: 0px;
  pointer-events: none;
  white-space: nowrap;
}

/* ========== 共享动画 ========== */
.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 0.15s ease;
}
.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
}
</style>