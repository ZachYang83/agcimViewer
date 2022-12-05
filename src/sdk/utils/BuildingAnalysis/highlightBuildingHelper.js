

/*
 * @author: pwz（潘文周）
 * @description: 高亮wfs查询结果
 */


import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
class HighlightBuildingHelper {
    constructor(viewer) {
        this.viewer = viewer;
        this.buildings = [];
        this._hightLightClump = {};
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 高亮多边形
     * @param {*} features
     * @return {*}
     */
    hightLightPolygeo(features, option = Cesium.Color.RED.withAlpha(0.5)) {
        features.map(feature => {
            let id = feature.id + "_hightlight"
            if (this._hightLightClump[id]) {
                return
            }
            this.viewer.dataSources.add(
                Cesium.GeoJsonDataSource.load(
                    feature
                )
            ).then(data => {
                data.entities.values.map(entitie => {
                    entitie.polygon.material = option;
                })
                if (!this._hightLightClump[id]) this._hightLightClump[id] = data;
            })

        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 建筑高亮
     * @param {*} features
     * @param {*} option
     * @return {*}
     */
    hightLightBuildings(features, option) {
        let defaultStyle = {
            color: "rgba(255, 0, 0, 0.5)",
        }
        this.buildings = this.buildings.concat(features);
        this.buildings.map(feature => {
            feature.style = new Cesium.Cesium3DTileStyle(Object.assign({}, defaultStyle, option));
        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除建筑高亮
     * @param {*}
     * @return {*}
     */
    removeHighlightBuildings() {
        this.buildings.map(feature => {
            feature.style = null;
        })
        this.buildings = [];
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除基底面高亮
     * @param {*}
     * @return {*}
     */
    removehightLightPolygeo() {
        for (let i in this._hightLightClump) {
            this.viewer.dataSources.remove(this._hightLightClump[i]);
        }
        this._hightLightClump = {};
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除所有高亮
     * @param {*}
     * @return {*}
     */
    remove() {
        this.removehightLightPolygeo();
        agFeatureLayer.removeAll();//删除多边形的高亮样式
        this.removeHighlightBuildings();//删除建筑的高亮样式
    }
}
export default HighlightBuildingHelper;
