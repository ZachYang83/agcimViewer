/**
 * @author: 张瀚
 * @description: 绘制二维面
 */
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'
import coordinate from '@/sdk/maths/coordinate.js'
import * as turf from '@turf/turf'
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
            polygon: "polygon-",
            circle: "ellipse-circle-",
            arrow: "polygon-arrow-",
            arrows: "polygon-arrows-",
        }
        this.drawingEntity = undefined
    }
    /**
     * @author: 张瀚
     * @description: 获取所有的带有多边形绘制的entity对象列表
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
     * @description: 绘制多边形，左键点选添加端点，右键取消，双击确定
     * @param {Cesium.PolygonGraphics} options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {String} options.colorString 填充颜色字符串
     * @param {String} options.outlineColorString 轮廓线条默认是黑色
     * @param {Number} options.alpha 透明度0-1
     * @return {Promise} 回调里面是entity对象
     */
    pickAndDrawPolygon(options = {}) {
        let newOptions = this._createNewOptions(options)
        return new Promise((resolve, reject) => {
            let list = [], nowPosition, pointList = []
            //创建监听对象
            this._createPickerHelper()
            this.#pickerHelper.on("LEFT_CLICK", event => {
                //左键选中
                let position = this.#pickerHelper.getPositionByRay(event.position)
                if (!position) {
                    return
                }
                pointList.push(position)
                list = pointList.concat(nowPosition)
                if (!this.drawingEntity) {
                    const nowTime = Date.now()
                    newOptions.hierarchy = new Cesium.CallbackProperty(() => { return { positions: list } }, false)
                    this.drawingEntity = this.#viewer.entities.add({
                        name: "多边形-" + nowTime,
                        id: this.idExMap.polygon + nowTime,
                        polygon: newOptions
                    })
                }
            }).on("MOUSE_MOVE", event => {
                let position = this.#pickerHelper.getPositionByRay(event.endPosition)
                //鼠标移动
                if (position) {
                    nowPosition = position
                    list = pointList.concat(nowPosition)
                }
            }).on("LEFT_DOUBLE_CLICK", () => {
                //确认操作
                if (this.drawingEntity && list.length >= 2) {
                    let entity = this.drawingEntity
                    this.drawingEntity = undefined
                    this.cancel()
                    resolve(entity)
                    return
                }
                this.cancel()
                reject()
            }).on("RIGHT_CLICK", () => {
                //取消操作
                this.cancel()
                reject()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 绘制圆，左键选择圆心，鼠标和圆心距离为半径，双击左键确定，右键取消
     * @param {Cesium.EllipseGraphics} options 可选参数，下面仅列出备用参数或者常用的，如果需要更定制化的，可以直接传入类对应构造字段值
     * @param {String} options.colorString 填充颜色字符串
     * @param {String} options.outlineColorString 轮廓线条默认是黑色
     * @param {Number} options.alpha 透明度0-1
     * @return {Promise} 回调里面是entity对象
     */
    pickAndDrawCircle(options = {}) {
        let newOptions = this._createNewOptions(options)
        return new Promise((resolve, reject) => {
            let center, nowPoint, distance = 0
            //创建监听对象
            this._createPickerHelper()
            this.#pickerHelper.on("LEFT_CLICK", event => {
                //左键选中
                if (!this.drawingEntity) {
                    center = this.#pickerHelper.getPositionByRay(event.position)
                    if (!center) {
                        return
                    }
                    const nowTime = Date.now()
                    newOptions.semiMinorAxis = new Cesium.CallbackProperty((time, result) => distance, false),
                        newOptions.semiMajorAxis = new Cesium.CallbackProperty((time, result) => distance, false),
                        this.drawingEntity = this.#viewer.entities.add({
                            name: "圆-" + nowTime,
                            id: this.idExMap.circle + nowTime,
                            position: center,
                            ellipse: newOptions
                        })
                }
            }).on("MOUSE_MOVE", event => {
                //鼠标移动
                if (this.drawingEntity) {
                    nowPoint = this.#pickerHelper.getPositionByRay(event.endPosition)
                    if (nowPoint) {
                        //求两点距离,这里的计算是有问题的，是笛卡尔直线距离，而不是地面距离，地面距离其实还是要算弧度的,但差别不大
                        distance = Cesium.Cartesian3.distance(center, nowPoint)
                    }
                }
            }).on("LEFT_DOUBLE_CLICK", () => {
                //双击
                if (this.drawingEntity) {
                    let entity = this.drawingEntity
                    this.drawingEntity = undefined
                    this.cancel()
                    resolve(entity)
                    return
                }
                this.cancel()
                reject()
            }).on("RIGHT_CLICK", () => {
                //取消操作
                this.cancel()
                reject()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 绘制箭头，左键选择起点，双击结束，右键取消
     * @param {String} colorString 填充颜色字符串
     * @param {String} outlineColorString 轮廓线条默认是黑色
     * @param {Color} bgWidth 箭头宽度，指的是起点处的宽度,默认是高度/200
     * @param {Number} alpha 透明度0-1
     * @return {Promise} 回调里面是entity对象
     */
    pickAndDrawArrow(options = {}) {
        let newOptions = this._createNewOptions(options)
        return new Promise((resolve, reject) => {
            let bgPoint
            let list = []
            //创建监听对象
            this._createPickerHelper()
            this.#pickerHelper.on("LEFT_CLICK", event => {
                //左键选中
                if (this.drawingEntity) {
                    return
                }
                bgPoint = this.#pickerHelper.getPositionByRay(event)
                const nowTime = Date.now()
                newOptions.hierarchy = new Cesium.CallbackProperty(() => {
                    return {
                        positions: list
                    }
                }, false)
                this.drawingEntity = this.#viewer.entities.add({
                    name: "单箭头-" + nowTime,
                    id: this.idExMap.arrow + nowTime,
                    polygon: newOptions
                })
            }).on("MOUSE_MOVE", event => {
                if (!this.drawingEntity) {
                    return
                }
                //鼠标移动绘制箭头
                list = Cesium.Cartesian3.fromDegreesArray(this._drawArrow(bgPoint, this.#pickerHelper.getPositionByRay(event), options.bgWidth))
            }).on("LEFT_DOUBLE_CLICK", () => {
                //确认
                if (this.drawingEntity) {
                    let entity = this.drawingEntity
                    this.drawingEntity = undefined
                    this.cancel()
                    resolve(entity)
                    return
                }
                this.cancel()
                reject()
            }).on("RIGHT_CLICK", () => {
                //取消操作
                this.cancel()
                reject()
            })
        })
    }

    /**
     * @author: 张瀚
     * @description: 绘制多箭头，选一个顶点，每次左键绘制一个箭头
     * @param {String} colorString 填充颜色字符串
     * @param {String} outlineColorString 轮廓线条默认是黑色
     * @param {Color} bgWidth 箭头宽度，指的是起点处的宽度
     * @param {Number} alpha 透明度0-1
     * @return {Promise} 回调里面是entity对象
     */
    pickAndDrawArrows(options) {
        let newOptions = this._createNewOptions(options)
        return new Promise((resolve, reject) => {
            let bgPoint, list = [], entitieList = []
            //创建监听对象
            this._createPickerHelper()
            this.#pickerHelper.on("LEFT_CLICK", event => {
                let cartesian = this.#pickerHelper.getPositionByRay(event)
                //左键选中
                const nowTime = Date.now()
                //首次绘制
                if (!bgPoint) {
                    bgPoint = cartesian
                    if (!this.drawingEntity) {
                        newOptions.hierarchy = new Cesium.CallbackProperty(() => {
                            return {
                                positions: list
                            }
                        }, false)
                        this.drawingEntity = this.#viewer.entities.add({
                            name: "多箭头-" + nowTime,
                            id: this.idExMap.arrows + nowTime,
                            polygon: newOptions
                        })
                    }
                    return
                }
                //确认绘制了一个箭头
                let tempOptions = Object.assign({}, newOptions)
                tempOptions.hierarchy = {
                    positions: Cesium.Cartesian3.fromDegreesArray(this._drawArrow(bgPoint, cartesian, options.bgWidth))
                }
                entitieList.push(this.#viewer.entities.add({
                    name: "多箭头" + nowTime,
                    id: this.idExMap.arrows + nowTime,
                    polygon: tempOptions
                }))
            }).on("MOUSE_MOVE", event => {
                if (!bgPoint) {
                    return
                }
                let cartesian = this.#pickerHelper.getPositionByRay(event)
                //鼠标移动
                list = Cesium.Cartesian3.fromDegreesArray(this._drawArrow(bgPoint, cartesian, options.bgWidth))
            }).on("LEFT_DOUBLE_CLICK", () => {
                //双击完成
                this.cancel()
                resolve(entitieList)
            }).on("RIGHT_CLICK", () => {
                //取消操作
                this.cancel()
                entitieList.forEach(e => {
                    this.#viewer.entities.remove(e)
                })
                reject()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 这里的参数和默认值基本都一样所以抽取一下
     * @param {*} options
     * @return {*}
     */
    _createNewOptions(options) {
        let defaultOptions = {
            material: Cesium.Color.fromCssColorString(options.colorString || "#FFA200").withAlpha(options.alpha || 0.9),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString(options.outlineColorString || "#000000").withAlpha(options.alpha || 0.9),
            extrudedHeight: 0,
        }
        //计算出新的参数
        return Object.assign(defaultOptions, options)
    }

    /**
     * @author: 张瀚
     * @description: 由两点坐标获取一个箭头的坐标点列表
     * @param {*} bgPoint
     * @param {*} endPoint
     * @param {*} bgWidth 箭头宽度默认等于高度除以两百
     * @return {*}
     */
    _drawArrow(bgPoint, endPoint, bgWidth = this.#viewer.camera.positionCartographic.height / 200) {
        let bgPointCartographic = coordinate.cartesian3ToCartographic(bgPoint, "Degrees")
        let endPointCartographic = coordinate.cartesian3ToCartographic(endPoint, "Degrees")
        let options = { units: 'meters' }
        var line = turf.lineString([[bgPointCartographic.lng, bgPointCartographic.lat], [endPointCartographic.lng, endPointCartographic.lat]]);
        var length = turf.length(line, options)
        var l1 = turf.lineOffset(line, bgWidth, options);
        var ll1 = turf.lineOffset(line, 3 * bgWidth, options);
        var l2 = turf.lineOffset(line, -1 * bgWidth, options);
        var ll2 = turf.lineOffset(line, -3 * bgWidth, options);
        var pointList = []
        pointList = pointList.concat([bgPointCartographic.lng, bgPointCartographic.lat])
        pointList = pointList.concat(l2.geometry.coordinates[0])
        pointList = pointList.concat(turf.along(l2, length * 0.8, options).geometry.coordinates)
        pointList = pointList.concat(turf.along(ll2, length * 0.8, options).geometry.coordinates)
        pointList = pointList.concat([endPointCartographic.lng, endPointCartographic.lat])
        pointList = pointList.concat(turf.along(ll1, length * 0.8, options).geometry.coordinates)
        pointList = pointList.concat(turf.along(l1, length * 0.8, options).geometry.coordinates)
        pointList = pointList.concat(l1.geometry.coordinates[0])
        pointList = pointList.concat([bgPointCartographic.lng, bgPointCartographic.lat])
        return pointList
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