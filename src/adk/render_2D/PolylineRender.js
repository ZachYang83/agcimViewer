/**
 * @author: 张瀚
 * @description: 用于绘制二维的折线
 */
import circleCalculation from '@/sdk/utils/circleCalculation.js'
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
            polyline: "polyline-",
            freeline: "polyline-freeline-",
            arc: "polyline-arc-",
        }
        this.drawingEntity = undefined
    }
    /**
     * @author: 张瀚
     * @description: 获取所有的带有折线绘制的entity对象列表
     * @return {*} 可以直接操作的entity列表
     */
    getEntityList() {
        var list = []
        this.#viewer.entities.values.forEach(en => {
            let id = en.id
            for (const exKey in this.idExMap) {
                if (id.startsWith(this.idExMap[exKey])) {
                    list.push(en)
                    break
                }
            }
        })
        return list
    }
    /**
     * @author: 张瀚
     * @description: 绘制折线，左键单击选取端点，鼠标移动预览效果，左键双击确认绘制，右键取消。
     * @param {Number} height 线条距离地面高度,默认0,可能会被挡住
     * @param {Cesium.PolylineGraphics} options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {String} options.colorString 线条颜色
     * @param {Number} options.width 线条像素宽度，默认10
     * @param {Number} options.alpha 透明度0-1
     * @return {Promise} 回调里面是entity对象
     */
    pickAndDrawPolyline(height = 0, options = {}) {
        let defaultOptions = {
            material: Cesium.Color.fromCssColorString(options.colorString || "#FFA200").withAlpha(options.alpha || 0.9),
            width: options.width || 10,
        }
        //计算出新的参数
        let newOptions = Object.assign(defaultOptions, options)
        return new Promise((resolve, reject) => {
            //创建监听对象
            this._createPickerHelper()
            let list = []
            let nowTime = Date.now()
            newOptions.positions = new Cesium.CallbackProperty(() => list, false)
            this.drawingEntity = this.#viewer.entities.add({
                name: "折线-" + nowTime,
                id: this.idExMap.polyline + nowTime,
                polyline: newOptions
            })
            this.#pickerHelper.on("LEFT_CLICK", event => {
                let position = this.#pickerHelper.getPositionByRay(event.position)
                if (!position) {
                    return
                }
                //左键选中
                list.push(coordinate.changePointHeight(position, height))
            }).on("MOUSE_MOVE", event => {
                //鼠标移动
                if (list.length == 0) {
                    //还没有点  啥都不做
                    return
                }
                let position = this.#pickerHelper.getPositionByRay(event.endPosition)
                if (!position) {
                    return
                }
                if (list.length < 2) {
                    list.push(coordinate.changePointHeight(position, height))
                } else {
                    list[list.length - 1] = coordinate.changePointHeight(position, height)
                }
            }).on("LEFT_DOUBLE_CLICK", event => {
                //确认完成
                if (list.length >= 2) {
                    //坐标点数量达标
                    let entity = this.drawingEntity
                    this.drawingEntity = undefined
                    this.cancel()
                    resolve(entity)
                    return
                }
                this.cancel()
                reject()
            }).on("RIGHT_CLICK", event => {
                this.cancel()
                reject()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 绘制自由线，左键单击开始绘制，双击结束绘制，右键取消绘制
     * @param {Number} height 线条距离地面高度,默认0,可能会被挡住
     * @param {Cesium.PolylineGraphics} options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {String} options.colorString 线条颜色
     * @param {Number} options.width 线条像素宽度，默认10
     * @param {Number} options.alpha 透明度0-1
     * @return {Promise} 回调里面是entity对象
     */
    pickAndDrawFreeline(height = 0, options = {}) {
        let defaultOptions = {
            material: Cesium.Color.fromCssColorString(options.colorString || "#FFA200").withAlpha(options.alpha || 0.9),
            width: options.width || 10,
        }
        //计算出新的参数
        let newOptions = Object.assign(defaultOptions, options)
        return new Promise((resolve, reject) => {
            //创建监听对象
            this._createPickerHelper()
            let list = []
            let nowTime = Date.now()
            newOptions.positions = new Cesium.CallbackProperty(() => list, false)
            this.drawingEntity = this.#viewer.entities.add({
                name: "自由线-" + nowTime,
                id: this.idExMap.freeline + nowTime,
                polyline: newOptions
            })
            this.#pickerHelper.on("LEFT_CLICK", event => {
                //左键选中开始绘制
                let position = this.#pickerHelper.getPositionByRay(event.position)
                position ? list.push(coordinate.changePointHeight(position, height)) : undefined
            }).on("MOUSE_MOVE", event => {
                //鼠标移动
                if (list.length == 0 || stop) {
                    return
                }
                let position = this.#pickerHelper.getPositionByRay(event.endPosition)
                position ? list.push(coordinate.changePointHeight(position, height)) : undefined
            }).on("LEFT_DOUBLE_CLICK", event => {
                //双击确认
                if (list.length != 0) {
                    let entity = this.drawingEntity
                    this.drawingEntity = undefined
                    resolve(entity)
                    this.cancel()
                    return
                }
                this.cancel()
                reject()
            }).on("LEFT_DOWN", () => {
                //拖动地图时不绘制以免错乱
                stop = true
            }).on("LEFT_UP", () => {
                //拖动地图时不绘制以免错乱
                stop = false
            }).on("RIGHT_CLICK", () => {
                //取消
                this.cancel()
                reject()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 绘制圆弧,左键选择两个点，然后鼠标当前位置第三个点绘制圆弧
     * @param {Cesium.PolylineGraphics} options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {String} options.colorString 线条颜色
     * @param {Number} options.width 线条像素宽度，默认10
     * @param {Number} options.alpha 透明度0-1
     * @return {Promise} 回调里面是entity对象
     */
    pickAndDrawArc(height = 0, options = {}) {
        let defaultOptions = {
            material: Cesium.Color.fromCssColorString(options.colorString || "#FFA200").withAlpha(options.alpha || 0.9),
            width: options.width || 10,
        }
        //计算出新的参数
        let newOptions = Object.assign(defaultOptions, options)
        return new Promise((resolve, reject) => {
            //创建监听对象
            this._createPickerHelper()
            //当前选中点
            let pointList = []
            let positionList = []
            let nowTime = Date.now()
            newOptions.positions = new Cesium.CallbackProperty(() => positionList, false)
            this.drawingEntity = this.#viewer.entities.add({
                name: "圆弧-" + nowTime,
                id: this.idExMap.arc + nowTime,
                polyline: newOptions
            })
            this.#pickerHelper.on("LEFT_CLICK", event => {
                let cartesian = this.#pickerHelper.getPositionByRay(event)
                if (!cartesian) {
                    return
                }
                //要先选择两个点才能配合当前鼠标位置绘制圆弧
                if (pointList.length < 2) {
                    pointList.push(cartesian)
                }
            }).on("MOUSE_MOVE", event => {
                let cartesian = this.#pickerHelper.getPositionByRay(event)
                if (!cartesian) {
                    return
                }
                //鼠标移动
                if (pointList.length == 2) {
                    pointList.push(cartesian)
                } else if (pointList.length == 3) {
                    pointList[2] = cartesian
                }
                //计算
                if (pointList.length != 3) {
                    positionList = []
                    return
                }
                //通过3点求圆心坐标
                let c1 = coordinate.cartesian3ToCartographic(pointList[0], "Degrees")
                let c2 = coordinate.cartesian3ToCartographic(pointList[1], "Degrees")
                let c3 = coordinate.cartesian3ToCartographic(pointList[2], "Degrees")
                let x1 = c1.lng
                let y1 = c1.lat
                let x2 = c2.lng
                let y2 = c2.lat
                let x3 = c3.lng
                let y3 = c3.lat
                let center = circleCalculation.threePointGetCircle(x1, y1, x2, y2, x3, y3)
                if (!center) {
                    //坐标无效
                    positionList = []
                    return
                }
                //画一个圆
                let tempList = []
                for (let index = 0; index < 360; index++) {
                    var p = circleCalculation.getPointInCircle(center.x, center.y, center.r, index)
                    tempList.push(p)
                }
                //计算最靠近两个点的位置
                let index1, minD1, index2, minD2, index3, minD3
                tempList.forEach((item, index) => {
                    let d1 = Math.pow(item.x - x1, 2) + Math.pow(item.y - y1, 2)
                    if (!minD1 || d1 < minD1) {
                        minD1 = d1
                        index1 = index
                    }
                    let d2 = Math.pow(item.x - x2, 2) + Math.pow(item.y - y2, 2)
                    if (!minD2 || d2 < minD2) {
                        minD2 = d2
                        index2 = index
                    }
                    let d3 = Math.pow(item.x - x3, 2) + Math.pow(item.y - y3, 2)
                    if (!minD3 || d3 < minD3) {
                        minD3 = d3
                        index3 = index
                    }
                })
                //只保留当前坐标所在的那一段
                let minIndex = Math.min(index1, index2)
                let maxIndex = Math.max(index1, index2)
                if (index3 <= maxIndex && index3 >= minIndex) {
                    tempList = tempList.slice(minIndex, maxIndex)
                } else {
                    tempList = tempList.slice(maxIndex, tempList.length).concat(tempList.slice(0, minIndex))
                }
                positionList = tempList.map(item => Cesium.Cartesian3.fromDegrees(item.x, item.y, height))
            }).on("LEFT_DOUBLE_CLICK", event => {
                //双击确认绘制结果
                if (pointList.length == 3) {
                    //结束了
                    let entity = this.drawingEntity
                    this.drawingEntity = undefined
                    this.cancel()
                    resolve(entity)
                }
            }).on("RIGHT_CLICK", event => {
                //取消操作
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
        this.#viewer.entities.remove(this.drawingEntity)
        this.drawingEntity = undefined
        if (this.#pickerHelper) {
            this.#pickerHelper.setCursor("default");
            this.#pickerHelper.off()
            this.#pickerHelper = undefined
        }
    }
}