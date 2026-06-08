<template>
    <div
      class="poi-marker"
      :style="markerStyle"
      @click.stop="handleClick"
      @mouseenter="$emit('hover', poi)"
      @mouseleave="$emit('leave', poi)"
    >
      <!-- 图标层 -->
      <div class="poi-icon" :class="{ active: isActive }" :style="iconStyle">
        <slot name="icon">
          <!-- 默认图标，可被外部插槽替换 -->
          <span class="default-dot"></span>
        </slot>
      </div>

      <!-- 文字标签层（可选） -->
      <transition name="label-fade">
        <div v-if="showLabel || isActive" class="poi-label">
          {{ poi.name }}
        </div>
      </transition>
    </div>
  </template>

  <script setup>
  import { computed } from 'vue';
  import { POI_TYPE_COLORS } from '@/data/poiData';

  const props = defineProps({
    poi: {
      type: Object,
      required: true,
      // poi 对象至少包含: { id, x, y, name, type }
      validator: (v) => v.x !== undefined && v.y !== undefined
    },
    isActive: { type: Boolean, default: false },
    showLabel: { type: Boolean, default: false },
    scale: { type: Number, default: 1 } // 当前地图缩放倍数
  });

  const emit = defineEmits(['click', 'hover', 'leave']);

  // ⭐️ 核心：使用 translate 定位，避免 top/left 触发布局重排
  const markerStyle = computed(() => ({
    transform: `translate(${props.poi.x}px, ${props.poi.y}px)`
  }));

  // ⭐️ 图标颜色从 poiData.js 配置中获取，选中时为红色
  const iconStyle = computed(() => ({
    backgroundColor: props.isActive 
      ? '#f56c6c' 
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
    /* ⭐️ 将锚点设为中心底部，让坐标点对准图标底端 */
    transform-origin: center bottom;
    cursor: pointer;
    z-index: 5;
    /* 防止文字换行导致宽度变化 */
    white-space: nowrap;
    pointer-events: auto;
  }

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
    /* ⭐️ 居中偏移，配合 transform-origin */
    margin-left: -12px;
    margin-top: -24px;
  }

  .poi-icon.active {
    background: #f56c6c;
    transform: scale(1.3);
    z-index: 10;
  }

  .default-dot {
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
  }

  /* 文字标签 */
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

  .label-fade-enter-active,
  .label-fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .label-fade-enter-from,
  .label-fade-leave-to {
    opacity: 0;
  }
  </style>
