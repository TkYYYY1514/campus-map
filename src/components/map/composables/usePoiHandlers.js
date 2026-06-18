/**
 * POI 事件处理 composable
 * 处理 POI 标记点的点击、悬停等事件
 * @param {Object} options - 配置选项
 * @param {Object} options.poiStore - POI Store 实例
 * @param {Object} options.emit - 组件的 emit 函数
 * @param {Object} options.mapTransform - 地图变换状态（用于居中定位）
 * @returns {Object} POI 事件处理函数
 */
import showDialog from '@/components/Dialog/Dialog'
import Nh from '@/components/Nh.vue'

export function usePoiHandlers(options) {
  const { poiStore, emit, mapTransform } = options

  /**
   * 让指定的 POI 位于屏幕中心（带平滑过渡动画）
   * @param {Object} poi - POI 对象
   */
  const centerOnPoi = (poi) => {
    if (!mapTransform) return
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    const MIN_SCALE = 1.2;
    const currentScale = mapTransform.scale.value;
    
    let targetScale = currentScale;
    
    if (currentScale < MIN_SCALE) {
      targetScale = MIN_SCALE;
    }
    
    let targetX = viewportWidth / 2 - poi.x * targetScale
    let targetY = viewportHeight / 2 - poi.y * targetScale
    
    const clamped = mapTransform.clampOffset(targetX, targetY, targetScale)
    targetX = clamped.x
    targetY = clamped.y
    
    mapTransform.isTransitioning.value = true
    
    if (currentScale !== targetScale) {
      mapTransform.scale.value = targetScale;
    }
    
    mapTransform.offsetX.value = targetX
    mapTransform.offsetY.value = targetY
    
    poiStore.selectPoi(poi);
    
    setTimeout(() => {
      mapTransform.isTransitioning.value = false
    }, 500)
  }

  /**
   * POI 点击事件处理
   * 点击切换选中状态并显示弹窗
   * @param {Object} poi - POI 对象
   */
  const handlePoiClick = (poi) => {
    // 如果点击的是已选中的 POI，则取消选中并关闭弹窗
    if (poiStore.selectedPoi?.id === poi.id) {
      poiStore.clearSelection()
      // 关闭已有的弹窗
      showDialog({}, Nh, {}, 'closeIfExist')
    } else {
      // 否则选中该 POI
      poiStore.selectPoi(poi)
      
      // ⭐️ 新增：让点击的 POI 居中显示
      centerOnPoi(poi)
      
      // 显示弹窗，使用 clearAllAndShow 模式确保一次只显示一个
      showDialog(
        { right: 250,
          
          title: poi.name,
          draggable: true 
        }, 
        Nh, 
        { poi }, 
        'clearAllAndShow'
      )
    }
    emit('poi-click', poi)
  }

  /**
   * POI 悬停事件处理
   * @param {Object} poi - POI 对象
   */
  const handlePoiHover = (poi) => {
    emit('poi-hover', poi)
  }

  /**
   * POI 离开事件处理
   * @param {Object} poi - POI 对象
   */
  const handlePoiLeave = (poi) => {
    emit('poi-leave', poi)
  }

  return {
    handlePoiClick,
    handlePoiHover,
    handlePoiLeave,
    centerOnPoi  // 暴露居中方法，方便外部调用
  }
}
