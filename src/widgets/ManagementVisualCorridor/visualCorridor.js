/*
 * @author: 张瀚
 * @description: 视廊管控的sdk
 */
import AgFeatureLayer from "@/sdk/layer/featureLayer.js";
import coordinate from "@/sdk/maths/coordinate.js"
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'
import * as turf from '@turf/turf'
export default class {
    #pickerHelper
    #viewer
    constructor(viewer) {
        this.#viewer = viewer
        this.#pickerHelper = undefined
        this.agFeatureLayer = new AgFeatureLayer(viewer)
        this.hierarchyArray = []
    }
    /**
    * @author: 张瀚
    * @description: 移除所有和视廊相关的对象
    */
    reset() {
        this.agFeatureLayer.removeAll()
        if (this.#pickerHelper) {
            this.#pickerHelper.off()
        }
        this.hierarchyArray.length = 0
    }
    /**
     * @author: 张瀚
     * @description: 选取和绘制城市道路视廊，单位都是米
     * @param {*} startHeight 起点高度
     * @param {*} startWidth 起点宽度
     * @param {*} endHeight 终点高度
     * @param {*} endWidth 终点宽度
     * @param {*} polygonOption 绘制的立体图形样式
     * @return {*} 回调，绘制后的entity回调
     */
    pickAndDrawRoadVisualCorridor(options = {}) {
        this.reset()
        let defaultOptions = {
            startHeight: 1.7,
            startWidth: 3,
            endHeight: 10,
            endWidth: 10,
            polygonOptions: {
                material: Cesium.Color.SALMON.withAlpha(0.3),
                perPositionHeight: true
            },
            startLabelOption: {
                text: "起点",
                font: "16px Helvetica",
                pixelOffset: new Cesium.Cartesian2(0, -20),
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#faad14").withAlpha(0.8),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                outlineWidth: 20,
                outlineColor: Cesium.Color.RED
            },
            endLabelOption: {
                text: "终点",
                font: "16px Helvetica",
                pixelOffset: new Cesium.Cartesian2(0, -20),
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#faad14").withAlpha(0.8),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                outlineWidth: 20,
                outlineColor: Cesium.Color.RED
            }
        }
        let newOptions = Object.assign(defaultOptions, options)
        return new Promise((resolve, reject) => {
            //创建监听对象
            let startPoint, endPoint, isPickingStart = true
            this.createPointAndLabelEntity(newOptions.startLabelOption, () => startPoint)
            this.#pickerHelper = new AgPickerHelper(this.#viewer)
            this.#pickerHelper.on("LEFT_CLICK", event => {
                //左键点击事件
                if (isPickingStart) {
                    //选中了观察点
                    let position = this.#pickerHelper.getPositionByEllipsoid(event.position)
                    if (!position) {
                        return
                    }
                    startPoint = coordinate.changePointHeight(position, options.startHeight / 2)
                    this.createPointAndLabelEntity(newOptions.endLabelOption, () => endPoint)
                    isPickingStart = false
                }
            }, true).on("MOUSE_MOVE", event => {
                let position = this.#pickerHelper.getPositionByEllipsoid(event.endPosition)
                if (!position) {
                    return
                }
                //鼠标移动事件且获取转换后的经纬度
                if (isPickingStart) {
                    //还未选中，所以是预览观察点状态
                    startPoint = coordinate.changePointHeight(position, options.startHeight / 2)
                    return
                }
                //预览景点位置
                endPoint = coordinate.changePointHeight(position, options.endHeight / 2)
                newOptions.watcherPoint = startPoint
                newOptions.targetPoint = endPoint
                this.drawRoadVisualCorridor(newOptions)
            }, true).on("LEFT_DOUBLE_CLICK", () => {
                if (isPickingStart) {
                    //还没有选完点呢，无效
                    return
                }
                //选中了景点，结束绘制
                this.#pickerHelper.off()
                resolve()
            }).on("RIGHT_CLICK", () => {
                //鼠标右键，执行监听移除
                this.reset()
                reject()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 选取和绘制景点视廊，单位都是米
     * @param {*} watcherHeight 观察者（视线）高度
     * @param {*} watcherRadius 观察者半径
     * @param {*} targetHeight 景点高度
     * @param {*} targetRadius 景点半径
     * @param {*} lineCount 每个面有几条边，越多越接近圆
     * @param {*} polygonOption 绘制的立体图形样式
     * @return {*} 回调，绘制后的entity回调
     */
    pickAndDrawLandscapeVisualCorridor(options = {}) {
        this.reset()
        let defaultOptions = {
            watcherHeight: 1.7,
            watcherRadius: 3,
            targetHeight: 10,
            targetRadius: 10,
            lineCount: 3,
            polygonOptions: {
                material: Cesium.Color.SALMON.withAlpha(0.3),
                // outline: true,
                // outlineColor: Cesium.Color.WHITE.withAlpha(0.1),
                perPositionHeight: true
            },
            watcherLabelOption: {
                text: "景点",
                font: "16px Helvetica",
                pixelOffset: new Cesium.Cartesian2(0, -20),
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#faad14").withAlpha(0.8),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                outlineWidth: 20,
                outlineColor: Cesium.Color.RED
            },
            targetLabelOption: {
                text: "观察点",
                font: "16px Helvetica",
                pixelOffset: new Cesium.Cartesian2(0, -20),
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#faad14").withAlpha(0.8),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                outlineWidth: 20,
                outlineColor: Cesium.Color.RED
            }
        }
        let newOptions = Object.assign(defaultOptions, options)
        return new Promise((resolve, reject) => {
            //创建监听对象
            let watcherPoint, targetPoint, isPickingWatcher = true
            this.createPointAndLabelEntity(newOptions.watcherLabelOption, () => watcherPoint)
            this.#pickerHelper = new AgPickerHelper(this.#viewer)
            this.#pickerHelper.on("LEFT_CLICK", event => {
                //左键点击事件
                if (isPickingWatcher) {
                    //选中了观察点
                    let position = this.#pickerHelper.getPositionByEllipsoid(event.position)
                    if (!position) {
                        return
                    }
                    watcherPoint = coordinate.changePointHeight(position, newOptions.watcherHeight)
                    this.createPointAndLabelEntity(newOptions.targetLabelOption, () => targetPoint)
                    isPickingWatcher = false
                }
            }, true).on("MOUSE_MOVE", event => {
                let position = this.#pickerHelper.getPositionByEllipsoid(event.endPosition)
                if (!position) {
                    return
                }
                //鼠标移动事件且获取转换后的经纬度
                if (isPickingWatcher) {
                    //还未选中，所以是预览观察点状态
                    watcherPoint = coordinate.changePointHeight(position, newOptions.watcherHeight)
                    return
                }
                //预览景点位置
                targetPoint = coordinate.changePointHeight(position, newOptions.targetHeight)
            }, true).on("LEFT_DOUBLE_CLICK", () => {
                if (isPickingWatcher) {
                    //还没有选完点呢，无效
                    return
                }
                //选中了景点，结束绘制
                this.#pickerHelper.off()
                newOptions.watcherPoint = watcherPoint
                newOptions.targetPoint = targetPoint
                this.drawVisualCorridor(newOptions)
                resolve()
            }).on("RIGHT_CLICK", () => {
                //鼠标右键，执行监听移除
                this.reset()
                reject()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 创建一个标签
     * @param {*} labelOption 标签文字
     * @param {Function} getPositionFunction 坐标回调
     */
    createPointAndLabelEntity(labelOption, getPositionFunction = () => { }) {
        let alpha = 0.8
        this.agFeatureLayer.addEntity({
            position: new Cesium.CallbackProperty(getPositionFunction, false),
            point: {
                color: Cesium.Color.fromCssColorString("#ff0000").withAlpha(alpha),
                pixelSize: 5,
                outlineColor: Cesium.Color.fromCssColorString("#000000").withAlpha(alpha),
                outlineWidth: 2,
            }
        })
        //绘制标题
        if (!labelOption) {
            return
        }
        this.agFeatureLayer.addEntity({
            position: new Cesium.CallbackProperty(getPositionFunction, false),
            label: labelOption
        })
    }
    /**
     * @author: 张瀚
     * @description: 绘制多边形
     * @param {*} watcherPoint 观察点
     * @param {*} watcherRadius 观察点半径
     * @param {*} targetPoint 景点
     * @param {*} targetRadius 景点半径
     */
    drawVisualCorridor(options = {}) {
        let pA = options.watcherPoint
        let pB = options.targetPoint
        let aR = options.startWidth
        let bR = options.targetRadius
        let lineCount = options.lineCount
        if (lineCount < 3) {
            //至少是三条边才能构成面
            return
        }
        if (lineCount > 10) {
            //就是要画圆啦
            lineCount = 40
        }
        let aList = [], bList = [], pList = []
        //TODO 根据配置的边数量绘制不同的形状，但是现在有旋转的问题，还不能解决，所以现在就只画圆了
        switch (lineCount) {
            case 3:
                //内接正三角形
                aList.push(this._getPointByACDistance(pA, pB, aR)[0])
                let pACList = this._getPointByACDistance(pA, pB, 0.5 * aR)
                //只留下远的那个
                let pAC = Cesium.Cartesian3.distance(pACList[0], aList[0]) > Cesium.Cartesian3.distance(pACList[1], aList[0]) ? pACList[0] : pACList[1]
                //求圆交点
                aList = aList.concat(this._getPointByCWithCircleInA(pA, pB, pAC, aR))

                bList.push(this._getPointByACDistance(pB, pA, bR)[0])
                let pBCList = this._getPointByACDistance(pB, pA, 0.5 * bR)
                let pBC = Cesium.Cartesian3.distance(pBCList[0], bList[0]) > Cesium.Cartesian3.distance(pBCList[1], bList[0]) ? pBCList[0] : pBCList[1]
                bList = bList.concat(this._getPointByCWithCircleInA(pB, pA, pBC, bR))

                //排列好点顺序才能绘制所有的面,三角体的五个面需要绘制五个entity面
                pList.push(aList)
                pList.push(bList)
                pList.push([aList[0], bList[0], bList[2], aList[1]])
                pList.push([aList[1], bList[2], bList[1], aList[2]])
                pList.push([aList[2], bList[1], bList[0], aList[0]])
                break
            case 4:
                //内接正方形
                break
            default:
                //默认是圆，如果要为圆，边数需要能被4整除,且要保持圆润，所以边数会有所调整
                let size = parseInt(lineCount / 4)
                let getListFunction = (p1, p2, size, r) => {
                    let per = r / size
                    let tempList = [], resultList = []
                    for (let i = 0; i < size + 4; i++) {
                        let tr = per * i
                        if (i == size + 3) {
                            tr = per * size
                        } else if (i >= size) {
                            tr = per * (size - 1) + per / 4 + per / 4 * (i - size)
                        }
                        let list = this._getPointByACDistance(p1, p2, tr)
                        if (list.length > 0) {
                            tempList.unshift(list[0])
                        }
                        if (list.length > 1) {
                            tempList.push(list[1])
                        }
                    }
                    tempList.forEach((it, index) => {
                        let list = this._getPointByCWithCircleInA(p1, p2, it, r)
                        if (list.length > 0) {
                            resultList.splice(index, 0, list[0])
                        }
                        if (list.length > 1) {
                            resultList.splice(index + 1, 0, list[1])
                        }
                    })
                    return resultList
                }
                aList = getListFunction(pA, pB, size, aR)
                bList = getListFunction(pB, pA, size, bR)
                pList.push(aList)
                pList.push(bList)
                //绘制边面
                aList.forEach((it, index) => {
                    pList.push([it, bList[0 - index < 0 ? bList.length - index : 0], bList[bList.length - index - 1], aList[index + 1 >= aList.length ? 0 : index + 1]])
                })
                break
        }
        //绘制
        pList.forEach(positions => {
            let polygonOptions = Object.assign({}, options.polygonOptions)
            polygonOptions.hierarchy = {
                positions
            }
            this.agFeatureLayer.addEntity({
                polygon: polygonOptions
            })
        })

    }
    /**
     * @author: 张瀚
     * @description: 平面中已知两点，求两点连线的过A点的垂直线上，距离A点一定距离的点的坐标（长度大于零则有两个）
     * @param {*} pA A点
     * @param {*} pB B点，和A点同在XY轴平面上
     * @param {*} distance 所求C点与A点的距离，C点在AB点连线的垂直且过A点的直线上
     * @return {Array} 根据距离有一个或者两个点
     */
    _getPointByACDistance(pA, pB, distance) {
        let dx = pB.x - pA.x
        let dy = pB.y - pA.y
        if (distance <= 0 || (dx == 0 && dy == 0)) {
            //长度小于等于0，那就只有一个点，且与A点重合，如果AB点在同一个点没法划线也不行
            return [pA.clone()]
        }
        //两点连线斜率
        let tanAB = dy / dx
        //过pA与直线相切的直线，斜率为-1/tanxyAB
        let tan_AB = -1 / tanAB
        //已知距离和斜率可求该点坐标
        let dxCA = Math.sqrt(Math.pow(distance, 2) * Math.pow(dy, 2) / (Math.pow(dy, 2) + Math.pow(dx, 2)))
        let dyCA = Math.sqrt(Math.pow(distance, 2) - Math.pow(dxCA, 2))
        //会有两个点，根据斜率来看
        if (tan_AB < 0) {
            //两个差值一正一负
            return [new Cesium.Cartesian3(pA.x + dxCA, pA.y - dyCA, pA.z), new Cesium.Cartesian3(pA.x - dxCA, pA.y + dyCA, pA.z)]
        }
        //两个值同符号
        return [new Cesium.Cartesian3(pA.x + dxCA, pA.y + dyCA, pA.z), new Cesium.Cartesian3(pA.x - dxCA, pA.y - dyCA, pA.z)]
    }
    /**
     * @author: 张瀚
     * @description: 以A为圆心，在XY轴平面绘制一个半径为R的圆，AB点在XY轴平面的连线的过A点的垂直线上，绘制了一点C，C与A的距离小于A圆半径，求过C点的AB平行线与A圆交点
     * @param {*} pA
     * @param {*} pB
     * @param {*} pC
     * @param {*} r
     * @return {Array} pC和pA距离等于A圆半径时只有一个点，小于有两个，大于没有
     */
    _getPointWithCircleByPoint(pA, pB, pC, r) {
        let dAC = Cesium.Cartesian2.distance(pA, pC).toFixed(7)
        if (dAC > r) {
            //距离超过了圆的半径是没有交点的
            return []
        }
        if (dAC == r) {
            //相交处只有一个点
            return [pC.clone()]
        }
        let dx = pB.x - pA.x
        let dy = pB.y - pA.y
        //两点在xy上的连线直线方程(x-pA.x)/dx = (y - pA.y)/dy，斜率为dy / dx
        let tanxyAB = new Big(dy / dx)
        //过点pC画AB平行线，与圆相交，交点pD，可知(yD - yC)/(xD - xC) = tanxyAB
        //与圆方程式联立简化
        let tempA = tanxyAB.mul(-pC.x).add(pC.y).sub(pA.y)
        //简化后的一元二次方程(tanxyAB²+1)*pxD²+(-2pxA-2tanxyAB*tempA)pxD+(pxA²+tempA² - r²)
        //a = tanxyAB² + 1
        let a = tanxyAB.pow(2).add(1)
        //b = 2 * tanxyAB * tempA - 2 * pA.x
        let b = tanxyAB.mul(2).mul(tempA).sub(2 * pA.x)
        //c = pA.x * pA.x + tempA * tempA - r * r
        let c = new Big(pA.x).pow(2).add(tempA.pow(2)).sub(r * r)
        let pxD1 = b.mul(-1).add(b.pow(2).sub(a.mul(4).mul(c)).sqrt()).div(a.mul(2))
        let pxD2 = b.mul(-1).sub(b.pow(2).sub(a.mul(4).mul(c)).sqrt()).div(a.mul(2))
        let pyD1 = tanxyAB.mul(pxD1.sub(pC.x)).add(pC.y)
        let pyD2 = tanxyAB.mul(pxD2.sub(pC.x)).add(pC.y)
        return [new Cesium.Cartesian3(pxD1.toNumber(), pyD1.toNumber(), pC.z), new Cesium.Cartesian3(pxD2.toNumber(), pyD2.toNumber(), pC.z)]
    }
    /**
     * @author: 张瀚
     * @description: 以A为圆心，在XY轴平面绘制一个半径为R的圆，AB点在XY轴平面的连线的过A点的垂直线上，绘制了一点C，C与A的距离小于A圆半径，求过C点的AB平行线与A圆交点，旋转至于AB连线垂直时坐标
     * @param {*} pA
     * @param {*} pB
     * @param {*} pC
     * @param {*} r
     * @return {Array}
     */
    _getPointByCWithCircleInA(pA, pB, pC, r) {
        let dxyAB = Cesium.Cartesian2.distance(pA, pB)
        let dAB = Cesium.Cartesian3.distance(pA, pB)
        let cosAB = dxyAB / dAB
        let sinAB = (pB.z - pA.z) / dAB
        let pDResult = this._getPointWithCircleByPoint(pA, pB, pC, r)
        if (pDResult.length == 0) {
            return []
        }
        if (pDResult.length == 1) {
            //这个点是最尽头的点，圆切线点，在AC轴上，不需要旋转
            return pDResult

        }
        //有两个圆上的点了，但是是xy轴平面的，需要绕AC轴旋转到与AB垂直平面上
        let pD1 = pDResult[0]
        let pD2 = pDResult[1]

        //然后求距离,两个点距离C点距离都一样
        let distance = new Big(Cesium.Cartesian2.distance(pC, pD1))
        //调整点的z坐标
        let z = distance.mul(cosAB)
        //根据与pB点距离来决定旋转方向
        let pD2IsNear = Cesium.Cartesian3.distance(pB, pD1) > Cesium.Cartesian3.distance(pB, pD2)
        if (pD2IsNear) {
            pD1.z = z.add(pD1.z).toNumber()
            pD2.z = z.sub(pD2.z).mul(-1).toNumber()
        } else {
            pD1.z = z.sub(pD1.z).mul(-1).toNumber()
            pD2.z = z.add(pD2.z).toNumber()
        }
        //调整xy，都在连线上前进一段距离
        let s = distance.mul(sinAB)
        let dx = s.mul(pD1.x - pC.x).div(distance)
        let dy = s.mul(pD1.y - pC.y).div(distance)
        pD1.x = dx.add(pC.x).toNumber()
        pD1.y = dy.add(pC.y).toNumber()
        dx = s.mul(pD2.x - pC.x).div(distance)
        dy = s.mul(pD2.y - pC.y).div(distance)
        pD2.x = dx.add(pC.x).toNumber()
        pD2.y = dy.add(pC.y).toNumber()
        return [pD1, pD2]
    }
    /**
     * @author: 张瀚
     * @description: 绘制道路景观通廊，选择两点，两点地面垂直投影，垂直于两点连线，两侧偏移一定距离，形成一个六面体。
     * @param {*} options
     */
    drawRoadVisualCorridor(options = {}) {
        //计算起点终点的落地投影经纬度
        let startPoint = options.watcherPoint
        let endPoint = options.targetPoint
        //求投影点的经纬度
        let startGroudLAL = coordinate.cartesian3ToCartographic(startPoint, "Degrees")
        let endGroudLAL = coordinate.cartesian3ToCartographic(endPoint, "Degrees")
        //两点连线，往左右各偏移指定起点矩形宽度一半，可以求得两个端点坐标
        let line = turf.lineString([[startGroudLAL.lng, startGroudLAL.lat], [endGroudLAL.lng, endGroudLAL.lat]])
        //计算起点的四个点坐标
        let needAdd = this.hierarchyArray.length == 0
        let groudAndTopPoint1 = this._getGroudAndTopPointByLineOffset(line, options.startWidth / 2, options.startHeight)
        let groudAndTopPoint2 = this._getGroudAndTopPointByLineOffset(line, -options.startWidth / 2, options.startHeight)
        //计算终点的四个点坐标
        let groudAndTopPoint3 = this._getGroudAndTopPointByLineOffset(line, options.endWidth / 2, options.endHeight, 1)
        let groudAndTopPoint4 = this._getGroudAndTopPointByLineOffset(line, -options.endWidth / 2, options.endHeight, 1)
        //绘制
        this.hierarchyArray.splice(0, 1, [groudAndTopPoint1.groudPoint, groudAndTopPoint1.topPoint, groudAndTopPoint2.topPoint, groudAndTopPoint2.groudPoint])
        this.hierarchyArray.splice(1, 1, [groudAndTopPoint3.groudPoint, groudAndTopPoint3.topPoint, groudAndTopPoint4.topPoint, groudAndTopPoint4.groudPoint])
        this.hierarchyArray.splice(2, 1, [groudAndTopPoint1.groudPoint, groudAndTopPoint1.topPoint, groudAndTopPoint3.topPoint, groudAndTopPoint3.groudPoint])
        this.hierarchyArray.splice(3, 1, [groudAndTopPoint2.groudPoint, groudAndTopPoint2.topPoint, groudAndTopPoint4.topPoint, groudAndTopPoint4.groudPoint])
        this.hierarchyArray.splice(4, 1, [groudAndTopPoint1.groudPoint, groudAndTopPoint2.groudPoint, groudAndTopPoint4.groudPoint, groudAndTopPoint3.groudPoint])
        this.hierarchyArray.splice(5, 1, [groudAndTopPoint1.topPoint, groudAndTopPoint2.topPoint, groudAndTopPoint4.topPoint, groudAndTopPoint3.topPoint])
        if (needAdd) {
            this.hierarchyArray.forEach((positions, index) => {
                let polygonOptions = Object.assign({}, options.polygonOptions)
                polygonOptions.hierarchy = new Cesium.CallbackProperty(() => {
                    return {
                        positions: this.hierarchyArray[index]
                    }
                }, false)
                this.agFeatureLayer.addEntity({
                    polygon: polygonOptions
                })
            })
        }
    }
    /**
     * @author: 张瀚
     * @description: 计算某一条线，偏移一定距离后，某一端点的笛卡尔坐标，以及其一定高度后的另一个点的笛卡尔坐标
     * @param {*} line turf的连线，起点到终点
     * @param {*} offset 偏移距离
     * @param {*} height 高度
     * @param {*} coordinatesIndex 如果是算起点的，是0，算终点的是1
     * @return {*}
     */
    _getGroudAndTopPointByLineOffset(line, offset, height, coordinatesIndex = 0) {
        //计算偏移后的线
        let offsetLine = turf.lineOffset(line, offset, { units: 'meters' })
        //取其中一端点的新经纬度坐标
        let groudLAL = offsetLine.geometry.coordinates[coordinatesIndex]
        //转笛卡尔坐标计算底点和高点坐标
        let groudPoint = coordinate.cartographicToCartesian3({
            lng: groudLAL[0],
            lat: groudLAL[1],
            alt: 0
        })
        let topPoint = coordinate.cartographicToCartesian3({
            lng: groudLAL[0],
            lat: groudLAL[1],
            alt: height
        })
        return {
            topPoint,
            groudPoint
        }
    }
}