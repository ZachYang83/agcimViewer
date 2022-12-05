/*
 * @author: pwz（潘文周）
 * @description: 文件描述 控高分析
 */

import AgFeatureLayer from "@/sdk/layer/featureLayer";
import BuilingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper.js";
import PickerHelper from "@/sdk/interactive/pickerHelper.js"
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);

class ControlHeightAnalysis {
    constructor(option) {
        this.viewer = option.viewer;
        this.results = [];
        this.draw = new agcim.interactive.Draw(this.viewer);
        this.buildingAreaName = option.buildingAreaName;//建筑底面图层名称
        this.boxLayerName = option.boxLayerName;
        this.builingHelper = new BuilingHelper(this.viewer)
        this.pickerHelper = new PickerHelper(this.viewer);
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 开始分析
     * @param {*}
     * @return {*}
     */
    analysis(buildingAreas) {
        this.results = [];
        buildingAreas.forEach((buildingArea) => {
            let reult = this.builingHelper.computerBuildingHeight(this.builingHelper.filterPointsByDistance(buildingArea, 4), {
                boxLayerName: this.boxLayerName,
                buildingAreaName: this.buildingAreaName,
            });
            this.results.push(reult)
            this.addLableEntity({ text: reult.building.name + " " + reult.building.height + "m" }, reult.building.position)
        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 绘制控高范围
     * @param {*} callBack
     * @return {*}
     */
    drawControlHeightPolygon(callBack) {
        this.clear();
        this.draw.drawPolygon(
            {
                outline: true,
                outlineWidth: 1.0,
                fill: false,
                outlineColor: Cesium.Color.RED,
                height: 0.2,
            }
        ).then(result => {
            var points = result.positions;
            this.draw.removeAll();
            if (callBack) callBack(points, this.builingHelper.getBuildingAreaByRay(points, this.buildingAreaName));
        }, error => {
            console.log(error);
        });
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 绘制控高盒子
     * @param {*} option
     * @return {*}
     */
    addBoxLayer(option) {
        let potionsArr = [];
        for (let i = 0; i < option.points.length; i++) {
            let cartographic = Cesium.Cartographic.fromCartesian(option.points[i]);
            let cartesian = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
            potionsArr.push(cartesian)
        }
        agFeatureLayer.addEntity(this.viewer, {
            name: this.boxLayerName,
            polygon: {
                hierarchy: {
                    positions: potionsArr,
                },
                height: 0,
                extrudedHeight: option.limitHeight,
                material: Cesium.Color.WHITE.withAlpha(0.5),
            },
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
            pixelOffset: new Cesium.Cartesian2(0, 0),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("#f99d0d"),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
        label = Object.assign({}, label, option)
        let globPosition = this.pickerHelper.getGlobePosition(position);
        var polyline = {
            positions: [position, globPosition],
            material: Cesium.Color.GREEN,
            width: 2,
        };
        agFeatureLayer.addEntity(this.viewer, {
            label,
            position: position,
            polyline
        });
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除
     * @param {*}
     * @return {*}
     */
    clear() {
        agFeatureLayer.removeAll();
        this.results = [];
        if (this.draw) {
            this.draw.removeAll();
        }
    }
}
export default ControlHeightAnalysis;