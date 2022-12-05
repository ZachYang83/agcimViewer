/*
 * @author: pwz（潘文周） 
 * @description: 文件描述 限高计算
 */

import AgFeatureLayer from "@/sdk/layer/featureLayer";
import coordinate from "@/sdk/maths/coordinate.js"
import PickerHelper from "@/sdk/interactive/pickerHelper.js"
import agMath from "@/sdk/maths/math";
let agFeatureLayer = new AgFeatureLayer(CIM.viewer);

class LimitHeightCalculation {
    constructor(option) {
        this.viewer = option.viewer;
        this.computerPoints = [];//计算点数组
        this.startEndPoints = [];//起始点数组
        this.draw = new agcim.interactive.Draw(this.viewer);
        this.pickerHelper = new PickerHelper(this.viewer);
        this.startEndLineName = "连线";
        this.computerLineName = "计算连线"
        this.startEndLineStatue = false;//是否可以继续绘制景观点和参照点
        this.resuilts = [];//储存计算结果
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 选择景观点和参照点
     * @param {*}
     * @return {*}
     */
    selectStartAndEndPoint() {
        let that = this;
        if (that.startEndLineStatue) return;
        that.draw.drawPoint(
            {
                pixelSize: 10,
                color: Cesium.Color.BLUE,
                outline: true,
                outlineWidth: 2.0,
                fill: Cesium.Color.BLUE,
                outlineColor: Cesium.Color.BLUE,
                height: 0.4,
            }
        ).then(result => {
            var points = result.positions;
            that.startEndPoints.push(...points);
            if (that.startEndPoints.length == 2) {
                that.startEndLineStatue = true;//超过两个点不再绘制
                that.cteateStartEndLine({
                    positions: that.startEndPoints,
                    name: that.startEndLineName,
                    material: Cesium.Color.YELLOW,
                    width: 6
                });
            }
        }, error => {
            console.log(error);
        });
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 选中连线上的计算点
     * @param {*}
     * @return {*}
     */
    selecteComputerPoints() {
        let that = this;
        that.pickerHelper.remove("LEFT_CLICK")
        this.pickerHelper.on("LEFT_CLICK", function (movement) {
            debugger
            let object = that.pickerHelper.getPickObject(movement.position);
            if (object && object.id && object.id.name == "连线") {
                let position = that.pickerHelper.getPickPosition(movement.position);
                let globPosition = that.pickerHelper.getGlobePosition(position);
                if (position && globPosition) {
                    that.renderComputerPoint([position, globPosition], that.startEndPoints[0])
                }
            }
            that.pickerHelper.remove("LEFT_CLICK")

        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述
     * @param {*} positions 计算点和计算点和地面点组成的数组
     * @param {*} startPoint 景观点
     * @return {*}
     */
    renderComputerPoint(positions, startPoint) {
        //绘制计算点和地面的垂线
        this.cteateLine({ positions, name: this.computerLineName, material: Cesium.Color.RED, width: 2 });
        //绘制计算点
        this.cteatePonit({
            name: "计算点",
            positions: positions[0],
            color: Cesium.Color.BLUE
        })
        //绘制计算点到地面点的距离
        let distance = agMath.getDistance(startPoint, positions[0]).toFixed(2);
        let height = agMath.getDistance(positions[1], positions[0]).toFixed(2);
        let distanceText = "计算点" + (this.resuilts.length + 1) + "  " + distance.toString() + "m";
        //绘制计算点到起点的距离
        this.addLableEntity({ text: distanceText, backgroundColor: Cesium.Color.GREEN }, positions[0])
        this.addLableEntity({ text: height.toString() + "m", backgroundColor: Cesium.Color.GREEN }, agMath.computeMidPoint(positions[1], positions[0]))
        this.resuilts.push({
            distance,
            height,
            name: "计算点" + (this.resuilts.length + 1)
        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 起点和终点的连线
     * @param {*} option
     * @return {*}
     */
    cteateStartEndLine(option) {
        this.cteateLine(option);
        this.addLableEntity({ text: "景观点" }, coordinate.changePointAddHeight(option.positions[0], 8));
        this.addLableEntity({ text: "参照点" }, coordinate.changePointAddHeight(option.positions[1], 8));
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 创建连线
     * @param {*} option
     * @return {*}
     */
    cteateLine(option) {
        agFeatureLayer.addEntity({
            name: option.name,
            polyline: {
                show: true,
                positions: option.positions,
                material: option.material,
                width: option.width || 4,
            },
        });
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 绘制点
     * @param {*} option
     * @return {*}
     */
    cteatePonit(option) {
        var point = {
            pixelSize: 5,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
        agFeatureLayer.addEntity({
            name: option.name.toString(),
            point,
            position: option.positions,
        });
    }
    /**
   * 添加文字标注
   * @param {Cartesian3} position 标注坐标
   * @param {string} text 标注文字
   */
    addLableEntity(option, position) {
        let label = {
            text: "",
            font: "16px Helvetica",
            pixelOffset: new Cesium.Cartesian2(0, -12),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("#f99d0d"),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
        label = Object.assign({}, label, option)
        agFeatureLayer.addEntity({
            label,
            position: position,
        });
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除掉所有的绘制图层
     * @param {*}
     * @return {*}
     */
    clear() {
        agFeatureLayer.removeAll(this.viewer);
        this.startEndPoints = [];
        this.pickerHelper.remove("LEFT_CLICK")
        this.draw.removeAll();
        this.startEndLineStatue = false;
        this.resuilts = [];
    }

}
export default LimitHeightCalculation