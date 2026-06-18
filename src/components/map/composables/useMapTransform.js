import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 地图变换逻辑 composable
 * 负责处理地图的拖拽、缩放、边界限制等功能
 * @param {Object} options - 配置选项
 * @param {number} options.IMAGE_WIDTH - 地图原始宽度
 * @param {number} options.IMAGE_HEIGHT - 地图原始高度
 * @param {Ref} options.mapContainerRef - 地图容器 DOM 元素引用
 * @returns {Object} 地图变换相关的状态和方法
 */
export function useMapTransform(options) {
  const { IMAGE_WIDTH, IMAGE_HEIGHT, mapContainerRef } = options

  // 当前窗口尺寸
  let currentWidth = window.innerWidth
  let currentHeight = window.innerHeight

  // 计算初始缩放比例，确保地图能完整显示在窗口中
  const getInitialScale = () => Math.min(currentWidth / IMAGE_WIDTH, currentHeight / IMAGE_HEIGHT)

  // 缩放比例
  const scale = ref(getInitialScale())
  // 地图偏移量 X
  const offsetX = ref(0)
  // 地图偏移量 Y
  const offsetY = ref(0)
  // 是否正在拖拽中
  const isDragging = ref(false)
  // 是否正在平滑过渡中
  const isTransitioning = ref(false)
  // 拖拽起始点坐标
  const dragStart = ref({ x: 0, y: 0 })

  /**
   * 计算地图居中时的偏移量
   * @param {number} currentScale - 当前缩放比例
   * @returns {Object} 居中偏移量 { x, y }
   */
  const getCenterOffset = (currentScale) => ({
    x: (currentWidth - IMAGE_WIDTH * currentScale) / 2,
    y: (currentHeight - IMAGE_HEIGHT * currentScale) / 2
  })

  /**
   * 限制地图偏移量，防止地图拖出可视区域
   * @param {number} x - 偏移量 X
   * @param {number} y - 偏移量 Y
   * @param {number} currentScale - 当前缩放比例
   * @returns {Object} 限制后的偏移量 { x, y }
   */
  const clampOffset = (x, y, currentScale) => {
    const imgW = IMAGE_WIDTH * currentScale
    const imgH = IMAGE_HEIGHT * currentScale

    let minX, maxX, minY, maxY

    // 如果地图宽度小于等于窗口宽度，保持居中
    if (imgW <= currentWidth) {
      minX = (currentWidth - imgW) / 2
      maxX = minX
    } else {
      // 否则限制在可视区域内
      minX = currentWidth - imgW
      maxX = 0
    }

    // Y轴同理
    if (imgH <= currentHeight) {
      minY = (currentHeight - imgH) / 2
      maxY = minY
    } else {
      minY = currentHeight - imgH
      maxY = 0
    }

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY)
    }
  }

  // 地图容器的样式，包含 transform 和 cursor
  const wrapperStyle = computed(() => ({
    transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
    // cursor: isDragging.value ? 'grabbing' : 'grab',
    transformOrigin: '0 0',
    transition: isDragging.value ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }))

  /**
   * 开始拖拽
   * @param {MouseEvent} e - 鼠标事件
   */
  const startDrag = (e) => {
    if (e.button !== 0) return // 只响应左键
    isDragging.value = true
    // 记录拖拽起始点（减去当前偏移，计算相对位置）
    dragStart.value = {
      x: e.clientX - offsetX.value,
      y: e.clientY - offsetY.value
    }
  }

  /**
   * 继续拖拽
   * @param {MouseEvent} e - 鼠标事件
   */
  const continueDrag = (e) => {
    if (!isDragging.value) return
    // 计算新的偏移量
    const newX = e.clientX - dragStart.value.x
    const newY = e.clientY - dragStart.value.y
    // 限制边界
    const clamped = clampOffset(newX, newY, scale.value)
    offsetX.value = clamped.x
    offsetY.value = clamped.y
  }

  /**
   * 结束拖拽
   */
  const endDrag = () => {
    isDragging.value = false
  }

  /**
   * 鼠标滚轮缩放
   * @param {WheelEvent} e - 滚轮事件
   */
  const onWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1 // 滚轮向上放大，向下缩小
    let newScale = scale.value + delta
    const minScale = getInitialScale()
    // 限制缩放范围：最小为初始比例，最大为6倍
    newScale = Math.min(minScale * 6, Math.max(minScale, newScale))

    if (newScale === scale.value) return

    // 获取鼠标在地图容器内的位置
    const rect = mapContainerRef.value.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // 计算缩放比例因子
    const scaleRatio = newScale / scale.value
    // 以鼠标位置为中心进行缩放
    let newX = mouseX - (mouseX - offsetX.value) * scaleRatio
    let newY = mouseY - (mouseY - offsetY.value) * scaleRatio

    // 限制边界
    const clamped = clampOffset(newX, newY, newScale)

    // 更新状态
    scale.value = newScale
    offsetX.value = clamped.x
    offsetY.value = clamped.y

    e.preventDefault()
  }

  /**
   * 窗口大小改变时的处理
   */
  const handleResize = () => {
    currentWidth = window.innerWidth
    currentHeight = window.innerHeight
    // 重新计算偏移量，保持地图在可视区域内
    const clamped = clampOffset(offsetX.value, offsetY.value, scale.value)
    offsetX.value = clamped.x
    offsetY.value = clamped.y
  }

  // 组件挂载时初始化
  onMounted(() => {
    const center = getCenterOffset(scale.value)
    offsetX.value = center.x
    offsetY.value = center.y
    window.addEventListener('resize', handleResize)
  })

  // 组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    isDragging.value = false
  })

  return {
    scale,
    offsetX,
    offsetY,
    isDragging,
    isTransitioning,
    wrapperStyle,
    startDrag,
    continueDrag,
    endDrag,
    onWheel,
    getInitialScale,
    getCenterOffset,
    clampOffset
  }
}
