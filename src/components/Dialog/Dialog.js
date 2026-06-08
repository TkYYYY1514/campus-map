import { createApp, h } from "vue";
import DialogVue from "./Dialog.vue";

export const map = new WeakMap()
const cancelFnSet = new Set()

// 'clearAll' | 'clearSame' | 'overlay' | 'clearAllAndShow' | 'clearSameAndShow' | 'closeIfExist' | 'overlay'
// clearAll 关闭之前所有弹窗，如果之前有弹窗，关闭后此次不弹出
// clearAllAndShow 关闭之前所有弹窗，并弹出新的
// clearSame 关闭之前同一弹窗，如果之前有弹窗，关闭后此次不弹出
// clearSameAndShow 关闭之前同一弹窗，并弹出新的
// closeIfExist  新加  有则关闭，无则什么都不做（不创建新弹窗）
// 默认overlay是叠加，不关闭别的
function showDialog(props, component, childProps, mode = 'overlay') {
    //把所有的弹窗关闭
    if (mode === 'clearAll' || mode === 'clearAllAndShow') {
        const size = cancelFnSet.size
        cancelFnSet.forEach(cancelFn => {
            if (typeof cancelFn === 'function') {
                cancelFn()
            }
        })

        if (size && mode === 'clearAll') {
            console.log('clearAll: 关闭所有弹窗，不打开新弹窗')
            return
        }
    }

    //关闭同类弹窗
    if (mode === 'clearSame' || mode === 'clearSameAndShow') {
        const cancelFn = map.get(component)
        if (cancelFn) {
            cancelFn()
            if (mode === 'clearSame') {
                return
            }
        }
    }
    
    //  新增：closeIfExist - 有则关闭，无则什么都不做
    if (mode === 'closeIfExist') {
        const cancelFn = map.get(component)
        if (cancelFn) {
            cancelFn()  // 有弹窗就关闭
        }
        // 无论有没有弹窗，都不继续创建新弹窗
        return
    }

    // 创建新弹窗
    const mountDom = document.createElement('div')
    mountDom.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9998; pointer-events: none;'
    document.body.appendChild(mountDom)
    const p = new Promise((resolve, reject) => {
        const dialogInstance = createApp(h(DialogVue, {
            ...props,
            cancel,
        }, h(component, childProps)))

        dialogInstance.mount(mountDom)

        /**
         * 关闭
         */
        function cancel() {
            console.log('cancel')
            //卸载实例
            dialogInstance.unmount()
            //卸载容器
            mountDom.remove()
            //清楚map
            map.delete(component)
            // 从关闭函数集合中移除
            cancelFnSet.delete(cancel)
            //执行回调
            resolve(null)
        }
        map.set(component, cancel)
        // 添加到关闭函数集合
        cancelFnSet.add(cancel)
    })

    return p
}

export default showDialog