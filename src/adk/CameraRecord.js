/**
 * @lastUpdateBy : 张瀚
 * @description: 摄像头视角记录
 */
import camera from "@/sdk/camera/camera";
export default class {
    //主动控制下的视角移动，并且要执行的方法
    #inControlMoveEndCallback
    //下标
    #cursor
    //视角列表
    #viewArray
    #viewer
    constructor(viewer) {
        this.#viewer = viewer;
        this.#cursor = -1
        this.#viewArray = []
    }
    /**
     * @author: 张瀚
     * @description: 开始监听视角移动结束事件
     */
    listeningViewChange() {
        this.#viewer.camera.moveEnd.addEventListener(this.viewMoveEnd, this)
    }
    /**
     * @author: 张瀚
     * @description: 停止视角移动的监听
     */
    stopListeningViewChange() {
        this.#viewer.camera.moveEnd.removeEventListener(this.viewMoveEnd, this)
    }
    /**
     * @author: 张瀚
     * @description: 重置所有的内容
     */
    clear() {
        this.#cursor = -1
        this.#viewArray.length = 0
        this.#inControlMoveEndCallback = undefined
    }

    /**
     * @author: 张瀚
     * @description: 视角移动结束时触发的方法
     */
    viewMoveEnd() {
        //主动控制中的视角移动不做处理,直接触发
        if (this.#inControlMoveEndCallback) {
            this.#inControlMoveEndCallback()
            //触发一次就移除
            this.#inControlMoveEndCallback = undefined
            return
        }
        //存储新的视角，并且移除当前下标以后的所有视角，当前视角作为数组最后一位
        this.#viewArray.length = ++this.#cursor
        this.#viewArray.push(camera.getCameraAsJSON(this.#viewer))
    }
    /**
     * @author: 张瀚
     * @description: 前一视角
     */
    backView() {
        return new Promise((resolve, reject) => {
            if (this.#viewArray.length == 0 || this.#cursor <= 0) {
                reject()
                return
            }
            let cameraViewInfo = this.#viewArray[--this.#cursor]
            //传当前要移动的视角给外部，也许用得到
            this.#inControlMoveEndCallback = () => { resolve(cameraViewInfo) }
            camera.setCamera(this.#viewer, cameraViewInfo)
        })
    }
    /**
     * @author: 张瀚
     * @description: 后一视角
     * @param {*}
     * @return {*}
     */
    nextView() {
        return new Promise((resolve, reject) => {
            if (this.#cursor >= this.#viewArray.length - 1) {
                reject()
                return
            }
            let cameraViewInfo = this.#viewArray[++this.#cursor]
            //传当前要移动的视角给外部，也许用得到
            this.#inControlMoveEndCallback = () => { resolve(cameraViewInfo) }
            camera.setCamera(this.#viewer, cameraViewInfo)
        })
    }
}