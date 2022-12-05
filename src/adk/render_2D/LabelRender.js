/**
 * @author: 张瀚
 * @description: 文本渲染
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
            label: "label-"
        }
        //当前正在绘制的图形对象
        this.drawingEntity = undefined
    }
    /**
     * @author: 张瀚
     * @description: 获取所有的带有label绘制的entity对象列表
     * @return {*} 可以直接操作的entity列表
     */
    getEntityList() {
        var list = []
        this.#viewer.entities.values.forEach(en => {
            if (en.id.startsWith(this.idExMap.label)) {
                list.push(en)
            }
        })
        return list
    }
    /**
     * @author: 张瀚
     * @description:  点击地图，绘制一个Cesium.LabelGraphics
     * @param {*} text 文字内容
     * @param {*} height 点的高度，为0贴地但是倾斜时有可能被地形挡住
     * @param {Cesium.LabelGraphics} options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {*} options.fillColorString 字体颜色
     * @param {number} options.pixelSize 字体尺寸
     * @param {*} options.outlineColorString 外边框颜色
     * @param {*} options.outlineWidth 外边框粗细
     * @param {*} options.alpha 透明度0-1
     * @return {Promise} 可以获取到添加的点对象（假如成功添加的话）
     */
    pickAndDrawLabelOnce(text = "", height = 0, options = {}) {
        let defaultOptions = {
            text,
            //原始参数
            font: (options.pixelSize || 10) + "px sans-serif",
            fillColor: Cesium.Color.fromCssColorString(options.fillColorString || "#FFA200").withAlpha(options.alpha || 0.9),
            outlineColor: Cesium.Color.fromCssColorString(options.outlineColorString || "#FFA200").withAlpha(options.alpha || 0.9),
            outlineWidth: options.outlineWidth || 0,
            //增加点随距离缩放的功能以免拉高以后点太密集，从100米-1000000米距离上逐渐缩小到指定像素大小的百分之一
            scaleByDistance: new Cesium.NearFarScalar(100, 1, 100000, 0.01),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        }
        //计算出新的参数
        let newOptions = Object.assign(defaultOptions, options)
        return new Promise((resolve, reject) => {
            //创建监听对象
            this._createPickerHelper()
            let nowPosition
            this.#pickerHelper.on("LEFT_DOUBLE_CLICK", () => {
                let entity = this.drawingEntity
                this.drawingEntity = undefined
                this.cancel()
                resolve(entity)
            }).on("MOUSE_MOVE", event => {
                let cartesian = this.#pickerHelper.getPositionByRay(event.endPosition)
                if (!cartesian) {
                    return
                }
                nowPosition = coordinate.changePointHeight(cartesian, height)
                if (!this.drawingEntity) {
                    this.drawingEntity = this.#viewer.entities.add({
                        name: text.substr(0, 32),
                        id: this.idExMap.label + Date.now(),
                        position: new Cesium.CallbackProperty(() => nowPosition, false),
                        label: newOptions
                    })
                }
            }).on("RIGHT_CLICK", () => {
                this.cancel()
                reject()
            })
        })
    }
    _createPickerHelper() {
        this.cancel()
        this.#pickerHelper = new AgPickerHelper(this.#viewer)
        this.#pickerHelper.setCursor("crosshair");
    }
    cancel() {
        //移除当前正在绘制的图形
        this.#viewer.entities.remove(this.drawingEntity)
        this.drawingEntity = undefined
        if (this.#pickerHelper) {
            this.#pickerHelper.off()
            this.#pickerHelper.setCursor("default");
            this.#pickerHelper = undefined
        }
    }
}