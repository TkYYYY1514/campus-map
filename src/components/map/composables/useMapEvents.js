/**
 * 地图事件处理 composable
 * 整合地图的鼠标事件处理（拖拽、缩放、点击等）
 * @param {Object} options - 配置选项
 * @param {Object} options.mapTransform - useMapTransform 返回的对象
 * @param {Object} options.mapTooltip - useMapTooltip 返回的对象
 * @param {Object} options.mapContainerRef - 地图容器 DOM 引用
 * @param {Object} options.emit - 组件的 emit 函数
 * @returns {Object} 事件处理函数
 */
export function useMapEvents(options) {
  const { mapTransform, mapTooltip, mapContainerRef, emit } = options

  const {
    startDrag,
    continueDrag,
    endDrag,
    onWheel,
    scale,
    offsetX,
    offsetY
  } = mapTransform

  const { updateTooltip, hideTooltip } = mapTooltip

  /**
   * 鼠标按下事件处理
   * @param {MouseEvent} e - 鼠标事件
   */
  const handleMouseDown = (e) => {
    startDrag(e)
  }

  /**
   * 鼠标移动事件处理
   * @param {MouseEvent} e - 鼠标事件
   */
  const handleMouseMove = (e) => {
    updateTooltip(e)
    continueDrag(e)
  }

  /**
   * 鼠标释放事件处理
   */
  const handleMouseUp = () => {
    endDrag()
  }

  /**
   * 鼠标离开容器事件处理
   */
  const handleMouseLeave = () => {
    endDrag()
    hideTooltip()
  }

  /**
   * 鼠标滚轮事件处理
   * @param {WheelEvent} e - 滚轮事件
   */
  const handleWheel = (e) => {
    onWheel(e)
  }

  /**
   * 地图点击事件处理
   * @param {MouseEvent} event - 鼠标事件
   */
  const handleMapClick = (event) => {
    const rect = mapContainerRef.value.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // 换算成原图坐标
    const originalX = (clickX - offsetX.value) / scale.value
    const originalY = (clickY - offsetY.value) / scale.value

    emit('map-click', { x: originalX, y: originalY })
  }

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleMapClick
  }
}
