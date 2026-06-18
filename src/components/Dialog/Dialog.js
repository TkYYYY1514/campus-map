import { createApp, h } from "vue";
import DialogVue from "./Dialog.vue";

export const map = new WeakMap()
const cancelFnSet = new Set()

// *   - 'overlay': 叠加模式，不关闭现有弹窗（默认）
// *   - 'clearAll': 关闭所有弹窗，不打开新弹窗
// *   - 'clearAllAndShow': 关闭所有弹窗，然后打开新弹窗
// *   - 'clearSame': 关闭同类弹窗，不打开新弹窗
// *   - 'clearSameAndShow': 关闭同类弹窗，然后打开新弹窗
// *   - 'closeIfExist': 有则关闭，无则什么都不做


function showDialog(props, component, childProps, mode = 'overlay') {
    // 把所有的弹窗关闭
            // showDialog.js
        if (mode === 'clearAll' || mode === 'clearAllAndShow') {
            const size = cancelFnSet.size
            // 不依赖 component，直接关闭所有
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

    // 关闭同类弹窗
    if (mode === 'clearSame' || mode === 'clearSameAndShow') {
        const cancelFn = map.get(component)
        if (cancelFn) {
            cancelFn()
            if (mode === 'clearSame') {
                return
            }
        }
    }
    
    // closeIfExist - 有则关闭，无则什么都不做
    if (mode === 'closeIfExist') {
        const cancelFn = map.get(component)
        if (cancelFn) {
            cancelFn()
        }
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
         * 关闭 - 向上飘动画（与 Dialog.vue 一致）
         */
        function cancel() {
            console.log('cancel')
            
            // 获取弹窗 DOM 元素
            const dialogEl = mountDom.querySelector('.dialog')
            if (dialogEl) {
                // 获取弹窗当前高度
                const height = dialogEl.offsetHeight
                // 向上飘出屏幕 + 淡出
                dialogEl.style.transition = 'opacity 0.5s ease-in-out, top 0.5s ease-in-out'
                dialogEl.style.opacity = '0'
                dialogEl.style.top = `-${height}px`
                
                setTimeout(() => {
                    destroyDialog()
                }, 500)
            } else {
                destroyDialog()
            }
            
            function destroyDialog() {
                dialogInstance.unmount()
                mountDom.remove()
                map.delete(component)
                cancelFnSet.delete(cancel)
                resolve(null)
            }
        }
        
        map.set(component, cancel)
        cancelFnSet.add(cancel)
    })

    return p
}

export default showDialog