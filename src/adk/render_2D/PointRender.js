/**
 * @author: 张瀚
 * @description: 绘制点
 */
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'
import coordinate from "@/sdk/maths/coordinate.js"
export default class {
    #viewer
    #pickerHelper
    /**
    * @author: 张瀚
    * @param {Cesium.Viewer} viewer cesium的viewer对象
    */
    constructor(viewer) {
        this.#viewer = viewer
        this.#pickerHelper = undefined
        this.idExMap = {
            point: "point-"
        }
        this.drawingEntity = undefined
    }
    /**
     * @author: 张瀚
     * @description: 获取所有的带有点绘制的entity对象列表
     * @return {*} 可以直接操作的entity列表
     */
    getEntityList() {
        var list = []
        this.#viewer.entities.values.forEach(en => {
            if (en.id.startsWith(this.idExMap.point)) {
                list.push(en)
            }
        })
        return list
    }
    /**
     * @author: 张瀚
     * @description:  点击地图，绘制一个颜色点,双击确认，右键取消
     * @param {*} height 点距离地面的高度，为0且开启深度检测时有可能被底图遮挡
     * @param {Cesium.PointGraphics} options options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {*} options.colorString 点颜色字符串例如#FFFFFF
     * @param {*} options.pixelSize 点直径
     * @param {*} options.outlineColorString 外边框颜色字符串例如#000000
     * @param {*} options.outlineWidth 外边框粗细
     * @param {*} options.alpha 透明度0-1
     * @return {Promise} 可以获取到添加的点对象（假如成功添加的话）
     */
    pickAndDrawPointOnce(height = 0, options = {}) {
        let defaultOptions = {
            color: Cesium.Color.fromCssColorString(options.colorString || "#FFFFFF").withAlpha(options.alpha || 0.9),
            outlineColor: Cesium.Color.fromCssColorString(options.outlineColorString || "#000000").withAlpha(options.alpha || 0.9),
            outlineWidth: 0,
            pixelSize: 10,
            //增加点随距离缩放的功能以免拉高以后点太密集，从100米-1000000米距离上逐渐缩小到指定像素大小的百分之一
            scaleByDistance: new Cesium.NearFarScalar(100, 1, 1000000, 0.01),
        }
        //计算出新的参数
        let newOptions = Object.assign(defaultOptions, options)
        return new Promise((resolve, reject) => {
            let nowPosition
            //创建监听对象
            this._createPickerHelper()
            this.#pickerHelper.on("LEFT_DOUBLE_CLICK", () => {
                let entity = this.drawingEntity
                this.drawingEntity = undefined
                this.cancel()
                resolve(entity)
            }).on("MOUSE_MOVE", event => {
                let position = this.#pickerHelper.getPositionByRay(event)
                if (!position) {
                    return
                }
                nowPosition = coordinate.changePointHeight(position, height)
                if (!this.drawingEntity) {
                    let nowTime = Date.now()
                    this.drawingEntity = this.#viewer.entities.add({
                        name: "基础点" + nowTime,
                        id: this.idExMap.point + nowTime,
                        position: new Cesium.CallbackProperty((time, result) => nowPosition, false),
                        point: newOptions
                    })
                }
            }).on("RIGHT_CLICK", () => {
                this.cancel()
                reject()
            })
        })
    }
    _createPickerHelper(){
        this.cancel()
        this.#pickerHelper = new AgPickerHelper(this.#viewer)
        this.#pickerHelper.setCursor("crosshair");
    }
    cancel() {
        this.#viewer.entities.remove(this.drawingEntity)
        this.drawingEntity = undefined
        if (this.#pickerHelper) {
            this.#pickerHelper.off()
            this.#pickerHelper.setCursor("default")
            this.#pickerHelper = undefined
        }
    }
}