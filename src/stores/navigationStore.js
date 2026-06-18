// src/stores/navigationStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNavigationStore = defineStore('navigation', () => {
  // ========== 起点/终点 ==========
  const startPoint = ref({ type: null, id: null, name: null, x: null, y: null });
  const endPoint = ref({ type: null, id: null, name: null, x: null, y: null });

  const pickMode = ref(null); // 'start' 选起点 / 'end' 选终点

  // ========== 导航状态 ==========
  const isNavigating = ref(false);        // 是否导航中
  const isPaused = ref(false);            // 是否暂停
  const navigationProgress = ref(0);      // 进度 0~1
  const navigationDuration = ref(5000);   // 总时长(毫秒)
  const navigationStartTime = ref(0);     // 开始时间戳
  const currentWaypoints = ref(null);     // 当前路径点
  let navigationTimer = null;             // 动画循环句柄
  const MOVE_SPEED = 100;                 // 速度 像素/秒

  // ========== 设置起点/终点 ==========
  const setStartByPoi = (poi) => {
    startPoint.value = { type: 'poi', id: poi.id, name: poi.name, x: poi.x, y: poi.y };
  };
  const setStartByCoord = (x, y) => {
    startPoint.value = { type: 'coord', id: null, name: `(${Math.round(x)},${Math.round(y)})`, x, y };
  };
  const setEndByPoi = (poi) => {
    endPoint.value = { type: 'poi', id: poi.id, name: poi.name, x: poi.x, y: poi.y };
  };
  const setEndByCoord = (x, y) => {
    endPoint.value = { type: 'coord', id: null, name: `(${Math.round(x)},${Math.round(y)})`, x, y };
  };
  const clearStart = () => {
    startPoint.value = { type: null, id: null, name: null, x: null, y: null };
    if (isNavigating.value) stopNavigation();
  };
  const clearEnd = () => {
    endPoint.value = { type: null, id: null, name: null, x: null, y: null };
    if (isNavigating.value) stopNavigation();
  };
  const setPickMode = (mode) => { pickMode.value = mode; };
  const clearPickMode = () => { pickMode.value = null; };
  const setPointFromMap = (mode, x, y, poi = null) => {
    if (mode === 'start') poi ? setStartByPoi(poi) : setStartByCoord(x, y);
    else if (mode === 'end') poi ? setEndByPoi(poi) : setEndByCoord(x, y);
    clearPickMode();
  };

  // ========== 路径计算 ==========
  // 计算路径总长度
  const getPathLength = (waypoints) => {
    if (!waypoints || waypoints.length < 2) return 0;
    let len = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = waypoints[i + 1].x - waypoints[i].x;
      const dy = waypoints[i + 1].y - waypoints[i].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  };

  // 根据进度 0~1 计算当前位置（插值）
  const getPositionAtProgress = (progress, waypoints) => {
    if (!waypoints || waypoints.length < 2) return null;
    // 构建线段信息
    let totalLen = 0;
    const segs = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i], to = waypoints[i + 1];
      const dx = to.x - from.x, dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segs.push({ from, to, dx, dy, len, startDist: totalLen });
      totalLen += len;
    }
    // 找目标位置在哪段
    const target = progress * totalLen;
    for (const s of segs) {
      if (target <= s.startDist + s.len) {
        const t = (target - s.startDist) / s.len;
        return { x: s.from.x + s.dx * t, y: s.from.y + s.dy * t };
      }
    }
    return null;
  };

  // 通知地图移动视口（通过自定义事件）
  const updateViewport = (x, y) => {
    window.dispatchEvent(new CustomEvent('navigation-viewport-update', { detail: { x, y } }));
  };

  // ========== 导航控制 ==========
  // 开始导航（固定速度 100px/秒）
  /**
   * 开始导航模拟
   * 根据路径总长度和固定速度（100px/秒）计算总耗时，
   * 然后通过 requestAnimationFrame 逐帧更新进度，
   * 每帧计算小人位置并通知地图移动视口
   * 
   * @param {number} duration - 总时长（毫秒），默认5000，实际会被速度覆盖
   * @param {Array} waypoints - 路径点数组 [{x, y}, ...]
   */
  const startNavigation = (duration = 5000, waypoints = null) => {
    // 校验：必须有路径点且至少2个
    if (!waypoints || waypoints.length < 2) return;
    // 停止之前的导航
    stopNavigation();

    // 计算路径总长度（像素）
    const totalLen = getPathLength(waypoints);
    if (totalLen === 0) return;
    // 根据固定速度计算实际耗时（毫秒）
    const actualDuration = (totalLen / MOVE_SPEED) * 1000;

    // 重置导航状态
    isNavigating.value = true;
    isPaused.value = false;
    navigationProgress.value = 0;
    navigationDuration.value = actualDuration;
    navigationStartTime.value = Date.now();
    currentWaypoints.value = waypoints;

    /**
     * 逐帧更新函数（由 requestAnimationFrame 驱动）
     */
    const update = () => {
      // 如果已停止或暂停，停止更新
      if (!isNavigating.value || isPaused.value) return;
      
      // 计算已过时间占比 → 进度 0~1
      const elapsed = Date.now() - navigationStartTime.value;
      const progress = Math.min(elapsed / actualDuration, 1);
      navigationProgress.value = progress;

      // 根据进度计算小人位置，通知地图移动
      const pos = getPositionAtProgress(progress, waypoints);
      if (pos) updateViewport(pos.x, pos.y);

      // 未到终点 → 继续下一帧；到终点 → 结束导航
      if (progress < 1) {
        navigationTimer = requestAnimationFrame(update);
      } else {
        stopNavigation();
        window.dispatchEvent(new CustomEvent('navigation-complete'));
      }
    };
    // 启动动画循环
    navigationTimer = requestAnimationFrame(update);
  };

  /**
   * 暂停导航
   * 取消动画循环，保持当前进度不变
   */
  const pauseNavigation = () => {
    if (isNavigating.value && !isPaused.value) {
      isPaused.value = true;
      // 取消动画帧，停止更新
      if (navigationTimer) { 
        cancelAnimationFrame(navigationTimer); 
        navigationTimer = null; 
      }
      window.dispatchEvent(new CustomEvent('navigation-paused'));
    }
  };

  /**
   * 继续导航
   * 从当前进度重新计算已过时间，恢复动画循环
   */
  const resumeNavigation = () => {
    if (isNavigating.value && isPaused.value) {
      isPaused.value = false;
      
      // 关键：根据当前进度重新计算已过时间
      // 保证从暂停位置继续，而不是从头开始
      const elapsed = navigationDuration.value * navigationProgress.value;
      navigationStartTime.value = Date.now() - elapsed;

      const waypoints = currentWaypoints.value;
      const duration = navigationDuration.value;
      
      // 恢复动画循环（逻辑同 startNavigation）
      const update = () => {
        if (!isNavigating.value || isPaused.value) return;
        const elapsed2 = Date.now() - navigationStartTime.value;
        const progress = Math.min(elapsed2 / duration, 1);
        navigationProgress.value = progress;

        const pos = getPositionAtProgress(progress, waypoints);
        if (pos) updateViewport(pos.x, pos.y);

        if (progress < 1) {
          navigationTimer = requestAnimationFrame(update);
        } else {
          stopNavigation();
          window.dispatchEvent(new CustomEvent('navigation-complete'));
        }
      };
      navigationTimer = requestAnimationFrame(update);
      window.dispatchEvent(new CustomEvent('navigation-resumed'));
    }
  };

  /**
   * 停止导航
   * 取消动画循环，重置所有导航状态为初始值
   */
  const stopNavigation = () => {
    // 取消正在进行的动画帧
    if (navigationTimer) { 
      cancelAnimationFrame(navigationTimer); 
      navigationTimer = null; 
    }
    // 重置所有状态
    isNavigating.value = false;
    isPaused.value = false;
    navigationProgress.value = 0;
    navigationStartTime.value = 0;
    currentWaypoints.value = null;
  };

  const resetNavigation = () => { stopNavigation(); };
  const clearStartAndEnd = () => { clearStart(); clearEnd(); };

  // ========== 计算属性 ==========
  const hasValidStart = computed(() => startPoint.value.x !== null && startPoint.value.y !== null);
  const hasValidEnd = computed(() => endPoint.value.x !== null && endPoint.value.y !== null);
  const canNavigate = computed(() => hasValidStart.value && hasValidEnd.value);

  return {
    startPoint,
    endPoint,
    pickMode,
    isNavigating,
    isPaused,
    navigationProgress,
    navigationDuration,
    currentWaypoints,
    hasValidStart,
    hasValidEnd,
    canNavigate,
    
    setStartByPoi,
    setStartByCoord,
    setEndByPoi,
    setEndByCoord,
    clearStart,
    clearEnd,
    setPickMode,
    clearPickMode,
    setPointFromMap,
    startNavigation,
    pauseNavigation,
    resumeNavigation,
    stopNavigation,
    resetNavigation,
    clearStartAndEnd
  };
});