/**
 * @author: 张瀚
 * @description: 绘制平面图形（填充图片或颜色）
 */
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'
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
            plane: "plane-"
        }
        this.drawingEntity = undefined
    }
    /**
     * @author: 张瀚
     * @description: 获取所有的带有图例绘制的entity对象列表
     * @return {*} 可以直接操作的entity列表
     */
    getEntityList() {
        var list = []
        this.#viewer.entities.values.forEach(en => {
            if (en.id.startsWith(this.idExMap.plane)) {
                list.push(en)
            }
        })
        return list
    }
    /**
     * @author: 张瀚
     * @description: 左键双击，绘制一个图片
     * @param {*} imageUrl 图片地址
     * @param {Cesium.PlaneGraphics} options options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {*} options.width 图片宽度(米)
     * @param {*} options.height 图片高度(米)
     * @param {*} options.colorString 叠加的颜色字符串例如#FFFFFF是不影响
     * @param {*} options.alpha 透明度0-1
     * @return {Promise} 可以获取到添加的点对象（假如成功添加的话）
     */
    pickAndDrawImageOnce(imageUrl, options = {}) {
        let defaultOptions = {
            plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
            dimensions: new Cesium.Cartesian2(options.width || 1, options.height || 1),
            material: new Cesium.ImageMaterialProperty({
                image: imageUrl,
                color: Cesium.Color.fromCssColorString(options.colorString || "#FFFFFF").withAlpha(options.alpha || 0.9),
                transparent: true
            }),
        }
        //计算出新的参数
        let newOptions = Object.assign(defaultOptions,options)
        return new Promise((resolve, reject) => {
            let nowPosition
            //创建监听对象
            this._createPickerHelper()
            this.#pickerHelper.on("LEFT_DOUBLE_CLICK",() => {
                let entity = this.drawingEntity
                this.drawingEntity = undefined
                this.cancel()
                resolve(entity)
            }).on("MOUSE_MOVE",event => {
                nowPosition = this.#pickerHelper.getPositionByRay(event)
                if (!nowPosition) {
                    return
                }
                if (!this.drawingEntity) {
                    let nowTime = Date.now()
                    this.drawingEntity = this.#viewer.entities.add({
                        name: "图片" + nowTime,
                        id: this.idExMap.plane + nowTime,
                        position: new Cesium.CallbackProperty((time, result) => {
                            return nowPosition
                        }, false),
                        plane: newOptions
                    })
                }
            }).on("RIGHT_CLICK",() => {
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