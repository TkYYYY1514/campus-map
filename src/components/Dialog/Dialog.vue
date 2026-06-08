<template>
  <div 
    class="dialog" 
    :style="[style, dragStyle]"
    :class="{ 'dragging': isDragging, 'draggable': props.draggable ?? true }" 
    @mousedown.stop="handleMouseDown"
    @touchstart.stop="handleMouseDown"
  >
    <!-- ⭐️ 新增：顶部标题栏 -->
    <div v-if="title" class="dialog-header no-drag">
      <span class="dialog-title">{{ title }}</span>
      <!-- 关闭按钮移到了标题栏右侧 -->
      <span class="dialog-close-btn no-drag" @click="closeDialog">×</span> 
    </div>

    <!-- 如果没有标题但需要关闭按钮，保留右上角独立关闭按钮 -->
    <span v-else class="dialog-close-btn no-drag" @click="closeDialog">×</span> 
    
    <div class="content" ref="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted, watch, unref, provide } from "vue";

const props = defineProps({
  left: Number, right: Number, top: Number, bottom: Number,
  cancel: Function, draggable: Boolean,
  title: String // ⭐️ 新增：接收标题属性
});

// ... (其余 script 逻辑完全保持不变) ...
const content = ref(null);
let observer;
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragOffset = reactive({ x: 0, y: 0 });
const dragStyle = reactive({ transform: 'translate(0px, 0px)' });
const style = reactive({ opacity: 0 });

const setXY = () => {
  if (!content.value) return;
  style.opacity = 1;
  const contentW = content.value.offsetWidth;
  const contentH = content.value.offsetHeight;
  const appWidth = document.getElementById("app")?.clientWidth || window.innerWidth;
  const appHeight = document.getElementById("app")?.clientHeight || window.innerHeight;
  const leftValue = unref(props.left), rightValue = unref(props.right);
  const topValue = unref(props.top), bottomValue = unref(props.bottom);
  if (leftValue !== undefined) style.left = leftValue + "px";
  else if (rightValue !== undefined) style.right = rightValue + "px";
  else style.left = (appWidth - contentW) / 2 + "px";
  if (topValue !== undefined) style.top = topValue + "px";
  else if (bottomValue !== undefined) style.bottom = bottomValue + "px";
  else style.top = (appHeight - contentH) / 2 + "px";
};

onMounted(() => { setXY(); observer = new MutationObserver(setXY); observer.observe(content.value, { childList: true, subtree: true }); window.addEventListener("resize", setXY); });
onUnmounted(() => { observer?.disconnect(); window.removeEventListener("resize", setXY); });
watch(() => [unref(props.left), unref(props.right), unref(props.top), unref(props.bottom)], () => { setXY(); dragOffset.x = 0; dragOffset.y = 0; dragStyle.transform = `translate(0px, 0px)`; }, { deep: true });

function handleMouseDown(e) {
  const canDrag = props.draggable ?? true;
  if (!canDrag) return;
  const isInputElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable || e.target.closest('.no-drag');
  if (isInputElement) return;
  startDrag(e);
}

function startDrag(e) { e.preventDefault(); isDragging.value = true; dragStartX.value = e.clientX; dragStartY.value = e.clientY; document.addEventListener('mousemove', onDrag); document.addEventListener('mouseup', stopDrag); }
function onDrag(e) { if (!isDragging.value) return; e.preventDefault(); dragOffset.x += e.clientX - dragStartX.value; dragOffset.y += e.clientY - dragStartY.value; requestAnimationFrame(() => { dragStyle.transform = `translate(${dragOffset.x}px, ${dragOffset.y}px)`; }); dragStartX.value = e.clientX; dragStartY.value = e.clientY; }
function stopDrag(e) { if (!isDragging.value) return; isDragging.value = false; e.preventDefault(); document.removeEventListener('mousemove', onDrag); document.removeEventListener('mouseup', stopDrag); }
function closeDialog() { style.top = -(content.value?.offsetHeight) + "px"; style.opacity = 0; setTimeout(() => { props.cancel?.(); }, 500); }
provide("close", closeDialog);
</script>

<style lang="scss" scoped>
.dialog { 
  position: fixed; 
  z-index: 9999 !important; 
  pointer-events: auto !important; 
  will-change: transform; 
  background-color: rgba(255, 255, 255, 0.8); 
  border-radius: 8px;
  min-width: 150px; /* 保证最小宽度 */
  
  &.draggable { cursor: move; } 
  &.dragging { transition: none !important; } 
  &:not(.dragging) { transition: opacity 0.8s ease-in-out, top 0.8s ease-in-out; } 
}

/* ⭐️ 新增：标题栏样式 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:0px 5px 0px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  user-select: none;
  background: rgba(#007afa,0.5);
}

.dialog-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 调整关闭按钮位置（放在标题栏内） */
.dialog-close-btn {
  width: 18px; height: 18px; line-height: 18px; text-align: center;
  border-radius: 50%; font-size: 12px; color: #666; cursor: pointer;
  &:hover { color: red; background: rgba(0,0,0,0.05); }
}

.no-drag { cursor: default; }
</style>