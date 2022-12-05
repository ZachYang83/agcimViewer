/*
 * @author: pwz（潘文周）
 * @description: 文件描述
 */

import AgFeatureLayer from "@/sdk/layer/featureLayer";
import PickerHelper from "@/sdk/interactive/pickerHelper.js"
import BuilingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper.js";
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);


class RegulatoryPlanningAnalysis {
    constructor(option) {
        this.viewer = option.viewer;
        this.layerId = null;
        this.results = [];
        this.areaLayerName = option.areaLayerName || "基底面";
        this.boxLayerName = option.boxLayerName || "二类居住用地";
        this.pickerHelper = new PickerHelper(this.viewer)
        this.builingHelper = new BuilingHelper(this.viewer)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 初始化控规数据，包括控规盒子数据，建筑底面数据
     * @param {*} layer
     * @return {*}
     */
    getData(option) {
        this.loadBoxLayer(option.boxArea);//添加控规图层
        this.addBuildingPolygon(option.buildingArea);//添加建筑底面
        this.viewer.scene.globe.depthTestAgainstTerrain = false;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 加载控规盒子
     * @param {*}
     * @return {*}
     */
    loadBoxLayer(boxArea) {
        let potionsArr = [];
        for (let i = 0; i < boxArea.length; i++) {
            let cartographic = Cesium.Cartographic.fromCartesian(boxArea[i]);
            let cartesian = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
            console.log(cartesian)
            potionsArr.push(cartesian)
        }
        agFeatureLayer.addEntity({
            name: this.boxLayerName,
            polygon: {
                hierarchy: {
                    positions: potionsArr,
                },
                height: 0,
                extrudedHeight: 80,
                material: Cesium.Color.WHITE.withAlpha(0.8),
            },
        });
    }
    analysis(buildingArea) {
        this.results = [];
        let reult = this.builingHelper.computerBuildingHeight(buildingArea, {
            boxLayerName: this.boxLayerName,
            buildingAreaName: this.areaLayerName,
        });
        this.results.push(reult)
        return this.getAnaResult()
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 返回控规分析结果
     * @param {*}
     * @return {*}
     */
    getAnaResult() {
        return this.results
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除控规分析结果
     * @param {*}
     * @return {*}
     */
    clear() {
        this.results = [];
        CIM.layerTree.removeLayerById(this.layerId, this.viewer);
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        agFeatureLayer.removeAll(this.viewer)
    }

    /**
 * @author: pwz（潘文周） 
 * @description: 方法描述 绘制建筑底面（模拟数据）
 * @param {*}
 * @return {*}
 */
    addBuildingPolygon(buildingArea) {
        let potionsArr = [];
        for (let i = 0; i < buildingArea.length; i++) {
            let cartographic = Cesium.Cartographic.fromCartesian(buildingArea[i]);
            let cartesian = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
            potionsArr.push(cartesian)
        }
        agFeatureLayer.addEntity({
            name: this.areaLayerName,
            polygon: {
                hierarchy: {
                    positions: potionsArr,
                },
                height: 0,
                material: Cesium.Color.BLUE.withAlpha(0.5),
            },
        });
    }
}
export default RegulatoryPlanningAnalysis;