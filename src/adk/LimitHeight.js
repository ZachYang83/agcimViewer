/*
 * @author: pwz（潘文周） 
 * @description: 文件描述 限高计算
 */

import AgFeatureLayer from "@/sdk/layer/featureLayer"
import AgPickerHelper from "@/sdk/interactive/pickerHelper.js"
import agMath from "@/sdk/maths/math"
import coordinate from "@/sdk/maths/coordinate"

//起点的标点的样式
const startPointOption_default = {
    color: Cesium.Color.WHITE.withAlpha(0.7),
    pixelSize: 10,
    outlineColor: Cesium.Color.BLACK.withAlpha(0.7),
    outlineWidth: 2,
}
//起点的文字提示的样式
const startLabelOption_default = {
    text: '起点',
    font: 16 + "px sans-serif",
    showBackground: true,
    backgroundColor: Cesium.Color.GOLD.withAlpha(0.7),
    fillColor: Cesium.Color.BLACK.withAlpha(0.9),
    outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
    pixelOffset: new Cesium.Cartesian2(0, -40),
    outlineWidth: 1,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE
}
//参照点的标点的样式
const endPointOption_default = {
    color: Cesium.Color.WHITE.withAlpha(0.7),
    pixelSize: 10,
    outlineColor: Cesium.Color.BLACK.withAlpha(0.7),
    outlineWidth: 2,
}
//参照点的文字提示的样式
const endLabelOption_default = {
    text: '参照点',
    font: 16 + "px sans-serif",
    showBackground: true,
    backgroundColor: Cesium.Color.CADETBLUE.withAlpha(0.7),
    fillColor: Cesium.Color.BLACK.withAlpha(0.9),
    outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
    pixelOffset: new Cesium.Cartesian2(0, -40),
    outlineWidth: 1,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE
}
//参照点和起点的连线样式
const lineOption_default = {
    material: Cesium.Color.YELLOW,
    width: 8,
}
//默认配置
const startEndOption_default = {
    startPointOption: startPointOption_default,
    startLabelOption: startLabelOption_default,
    endPointOption: endPointOption_default,
    endLabelOption: endLabelOption_default,
    LineOption: lineOption_default,
}
//参照点和起点的连线的id
const startEndLineId = Cesium.createGuid()
//计算点的样式
const pointOption_default = {
    pixelSize: 8,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
}
//计算点距离起点文字提示的样式
const distanceLabelOption_default = {
    text: "距起点{{toStart}} m\n距终点{{toEnd}} m\n距离地面{{height}} m",
    font: "14px Helvetica",
    pixelOffset: new Cesium.Cartesian2(0, -50),
    showBackground: true,
    backgroundColor: Cesium.Color.CORAL,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
}
//计算点和地面的连线的样式
const heightPolylineOption_default = {
    material: Cesium.Color.RED, width: 2
}
const computeOption_default = {
    pointOption: pointOption_default,
    distanceLabelOption: distanceLabelOption_default,
    heightPolylineOption: heightPolylineOption_default,
}

export default class LimitHeightCalculation {
    #viewer
    #agFeatureLayer
    #picker
    constructor(viewer) {
        this.#viewer = viewer
        this.#agFeatureLayer = new AgFeatureLayer(this.#viewer)
        //缓存的起点终点对象
        this.startPosition = undefined
        this.endPosition = undefined
        this.#picker = new AgPickerHelper(this.#viewer)
    }
    /**
     * @author: 张瀚 
     * @description: 左键先选取起点，双击确认终点，右键取消
     * @param {Cesium.PointGraphics  可选} options.startPointOption：起点的标点的样式
     * @param {Cesium.LabelGraphics  可选} options.startLabelOption：起点的文字提示的样式
     * @param {Cesium.PointGraphics  可选} options.endPointOption：参照点的标点的样式
     * @param {Cesium.LabelGraphics  可选} options.endLabelOption：参照点的文字提示的样式
     * @param {Cesium.LabelGraphics  可选} options.LineOption：参照点和起点的连线
     * @return {Promise}
     */
    async pickStartAndEndPoint(options = {}) {
        options = this.assignMore(options, startEndOption_default);//给参数赋默认值
        this.clear()
        //创建起点对象
        this.#agFeatureLayer.addEntity({
            position: new Cesium.CallbackProperty(() => {
                return this.startPosition
            }, false),
            point: options.startPointOption,
            label: options.startLabelOption
        })
        try {
            this.#picker.setCursor("pointer")
            //左键单击选取起点
            let result = await this.#picker.pickOnce(false, position => {
                this.startPosition = position
            })
            this.endPosition = result.position
            this.#agFeatureLayer.addEntity({
                position: new Cesium.CallbackProperty(() => this.endPosition, false),
                point: options.endPointOption,
                label: options.endLabelOption
            })
            //左键双击选取终点
            result = await this.#picker.pickOnce(true, position => {
                this.endPosition = position
            })
            //移除监听,重置鼠标
            this.#picker.reset()
            //绘制连接起点和终点的连线
            this.#agFeatureLayer.addEntity({
                id: startEndLineId,
                name: options.LineOption.name,
                polyline: Object.assign({}, lineOption_default, options.LineOption, { positions: [this.startPosition, this.endPosition] })
            })
            return this.getEntityList()
        } catch (error) {
            //右键取消绘制
            this.clear()
            throw new Error("右键取消")
        }
    }

    /**
     * @author: 张瀚 
     * @description: 选中连线上的计算点
     * @param {*}
     * @param {Cesium.PointGraphics 可选} options.pointOption：计算点的样式
     * @param {Cesium.LabelGraphics 可选} options.distanceLabelOption：计算点距离起点文字提示的样式,占位符{{toStart}}、{{toEnd}}、{{height}}
     * @param {Cesium.LineGraphics 可选} options.heightPolylineOption：计算点和地面的连线的样式
     * @return {*}
     */
    async pickComputePoint(options = {}) {
        options = this.assignMore(options, computeOption_default)
        options.tempDistanceLabelText = options.distanceLabelOption.text
        options.distanceLabelText = options.distanceLabelOption.text
        options.distanceLabelOption.text = new Cesium.CallbackProperty(() => options.distanceLabelText, false)
        options.heightPolylinePositions = []
        options.heightPolylineOption.positions = new Cesium.CallbackProperty(() => options.heightPolylinePositions, false)
        //如果还未选择起始点和创建连线，则无法执行
        if (!this.startPosition || !this.endPosition) {
            throw new Error("请先选择起点终点，创建连线！")
        }
        //重置监听器
        this.#picker.reset()
        let nowPosition
        //创建计算点和地面连线
        let computePoint = this.#agFeatureLayer.addEntity({
            point: options.pointOption,
            label: options.distanceLabelOption,
            position: new Cesium.CallbackProperty(() => nowPosition, false),
            polyline: options.heightPolylineOption,
        })
        //默认不显示直到鼠标移动到连线上
        computePoint.show = false
        try {
            await this.#picker.pickOnce(true, (position, event) => {
                //判断是否移动到了连线上
                let entityList = this.#viewer.scene.drillPick(event.endPosition)
                if (entityList.some(entity => {
                    return (entity.id instanceof Cesium.Entity) && entity.id.id == startEndLineId
                })) {
                    if (!position) {
                        return
                    }
                    //移动到了连线上时修改鼠标样式和更新坐标
                    this.#picker.setCursor("pointer")
                    computePoint.show = true
                    //更新配置信息
                    nowPosition = position
                    this.updateComputePointAndLabel(nowPosition, options)
                    return
                }
                //否则设置为默认样式
                this.#picker.setCursor("default")
                computePoint.show = false
            })
            //选中了点，通过当前计算点有没有显示就知道是不是在连线上
            this.#picker.reset()
            if (computePoint.show) {
                return computePoint
            }
            throw new Error("没有选中连线上的点！")
        } catch (error) {
            //取消监听，移除绘制的两个对象
            this.#picker.reset()
            this.#agFeatureLayer.removeEntity(computePoint)
            throw new Error("右键取消绘制")
        }
    }
    /**
     * @author: 张瀚 
     * @description: 更新连线上计算点的位置
     * @param {cartesian3 } computePoint 计算点的位置
     * @param {cartesian3 } startPoint 起点的位置
     * @param {Cesium.PointGraphics 可选} options.computePoint：计算点的样式
     * @param {Cesium.LabelGraphics 可选} options.distanceLabelOption：计算点文字提示的样式
     * @param {Cesium.LineGraphics 可选} options.heightPolylineOption：计算点和地面的连线的样式
     * @return {*}
     */
    async updateComputePointAndLabel(nowPosition, options) {
        //计算点到地面的距离
        let globHeight, terrainProvider = this.#viewer.terrainProvider
        //有地形的情况，从地形上获取高度信息
        if (terrainProvider && terrainProvider._layers && terrainProvider._layers.length > 0) {
            let positions = [Cesium.Cartographic.fromCartesian(nowPosition)]
            var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions)
            let data = await promise.then(updatedPositions => updatedPositions)
            globHeight = data[0].height
        } else {
            globHeight = 0
        }
        //计算点垂直对应的地面上的点
        let globPosition = coordinate.changePointHeight(nowPosition, globHeight)
        //计算距离地面高度信息,单位米
        let height = agMath.getDistance(globPosition, nowPosition).toFixed(2)
        //计算点距离起点和终点的距离,单位米
        let toStartDistance = agMath.getDistance(this.startPosition, nowPosition).toFixed(2)
        let toEndDistance = agMath.getDistance(this.endPosition, nowPosition).toFixed(2)
        //更新距离文字
        options.distanceLabelText = options.tempDistanceLabelText.replaceAll(/{{toStart}}/g, toStartDistance).replaceAll(/{{toEnd}}/g, toEndDistance).replaceAll(/{{height}}/g, height)
        //更新地面连线坐标
        options.heightPolylinePositions = [nowPosition, globPosition]
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  给多层对象赋默认值
     * @param {Object} newD 需要被赋默认值的对象
     * @param {Object} oldD 默认值
     * @return {*}
     */
    assignMore(newD = {}, oldD = {}) {
        let options = {}
        for (let item in oldD) {
            options[item] = Object.assign({}, oldD[item], newD[item])
        }
        return options
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  清除掉所有的绘制图层
     * @param {*}
     * @return {*}
     */
    clear() {
        this.#agFeatureLayer.removeAll()
        this.#picker.reset()
        this.startPosition = undefined
        this.endPosition = undefined
    }
    /**
     * @lastUpdateBy : 张瀚
     * @description: 获取所有绘制对象列表，前3个是起点、终点、起点终点连线，后面的全是计算点系列的，一个计算点是一个entity
     * @return {Array}
     */
    getEntityList() {
        return this.#agFeatureLayer._entities
    }
}
