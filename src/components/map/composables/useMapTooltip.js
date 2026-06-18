import { ref, computed } from 'vue'

/**
 * 悬浮坐标卡片 composable
 * 负责显示鼠标在地图原图上的坐标，并自动调整卡片位置防止超出屏幕
 * @param {Object} options - 配置选项
 * @param {Ref} options.mapContainerRef - 地图容器 DOM 元素引用
 * @param {Ref} options.scale - 地图缩放比例
 * @param {Ref} options.offsetX - 地图 X 轴偏移量
 * @param {Ref} options.offsetY - 地图 Y 轴偏移量
 * @returns {Object} 悬浮卡片相关的状态和方法
 */
export function useMapTooltip(options) {
  const { mapContainerRef, scale, offsetX, offsetY } = options

  // 悬浮卡片尺寸常量
  const TOOLTIP_WIDTH = 80
  const TOOLTIP_HEIGHT = 40
  const OFFSET_GAP = 15 // 卡片与鼠标的间距

  // 是否显示悬浮卡片
  const showTooltip = ref(false)
  // 卡片 X 坐标
  const tooltipX = ref(0)
  // 卡片 Y 坐标
  const tooltipY = ref(0)
  
  // 🆕 存储当前鼠标相对于地图容器的位置（用于计算）
  const relativeMouseX = ref(0)
  const relativeMouseY = ref(0)

  // 当前窗口尺寸
  let currentWidth = window.innerWidth
  let currentHeight = window.innerHeight

  // 🆕 改为 computed，当 scale/offsetX/offsetY 变化时自动重新计算
  const currentMapX = computed(() => {
    return (relativeMouseX.value - offsetX.value) / scale.value
  })

  const currentMapY = computed(() => {
    return (relativeMouseY.value - offsetY.value) / scale.value
  })

  /**
   * 更新悬浮卡片位置和坐标显示
   * @param {MouseEvent} e - 鼠标移动事件
   */
  const updateTooltip = (e) => {
    // 获取地图容器相对于窗口的位置
    const rect = mapContainerRef.value.getBoundingClientRect()
    // 计算鼠标相对于地图容器的位置并存储
    relativeMouseX.value = e.clientX - rect.left
    relativeMouseY.value = e.clientY - rect.top

    // 计算卡片初始位置（鼠标右下方）
    let nextX = e.clientX + OFFSET_GAP
    let nextY = e.clientY + OFFSET_GAP

    // 如果右侧空间不足，将卡片移到鼠标左侧
    if (nextX + TOOLTIP_WIDTH > currentWidth) {
      nextX = e.clientX - TOOLTIP_WIDTH - OFFSET_GAP
    }
    // 如果下方空间不足，将卡片移到鼠标上方
    if (nextY + TOOLTIP_HEIGHT > currentHeight) {
      nextY = e.clientY - TOOLTIP_HEIGHT - OFFSET_GAP
    }

    // 更新卡片位置
    tooltipX.value = nextX
    tooltipY.value = nextY
    showTooltip.value = true
  }

  /**
   * 隐藏悬浮卡片
   */
  const hideTooltip = () => {
    showTooltip.value = false
  }

  /**
   * 窗口大小改变时更新窗口尺寸
   */
  const handleResize = () => {
    currentWidth = window.innerWidth
    currentHeight = window.innerHeight
  }

  return {
    showTooltip,
    tooltipX,
    tooltipY,
    currentMapX,
    currentMapY,
    updateTooltip,
    hideTooltip,
    handleResize
  }
}