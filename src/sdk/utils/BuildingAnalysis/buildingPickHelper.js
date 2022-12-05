

/*
 * @author: pwz（潘文周）
 * @description: 建筑分析的通用类
 */
import PickerHelper from "@/sdk/interactive/pickerHelper.js"
import WfsHelper from "@/sdk/utils/wfsHelper.js"
import HighlightBuildingHelper from "@/sdk/utils/BuildingAnalysis/highlightBuildingHelper.js"
import BuildingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper";
import TurfHelper from "@/sdk/utils/turfHelper"



class BuildingPickHelper {
    constructor(option) {
        this.viewer = option.viewer;
        this.url = option.url;
        this.typename = option.typename;
        this.srsName = option.srsName || "EPSG:4326";
        this.wfsHelper = new WfsHelper({
            url: this.url,
            typename: this.typename,
            srsName: this.srsName,
        })
        this.drawPolygon = new agcim.interactive.Draw(this.viewer);
        this.pickerHelper = new PickerHelper(this.viewer);
        this.highlightBuildingHelper = new HighlightBuildingHelper(this.viewer);
    }
    /**
     * @author: pwz（潘文周）  
     * @description: 方法描述 绘制用于计算容积率的区域
     * @param {Object} option 绘制多边形的样式
     * @param {Object} outline 是否显示外边框
     * @param {Object} outlineWidth  外边框宽度
     * @param {Object} fill  填充颜色
     *  @param {Object} outlineColor  外边框颜色
     *  @param {Object} height  高度
     * @return {*}
     */
    draw(option = null) {
        this.clear();
        option = Object.assign({
            outline: true,
            outlineWidth: 1.0,
            fill: false,
            outlineColor: Cesium.Color.RED,
            height: 0.2
        }, option)
        return new Promise((res, rej) => {
            this.drawPolygon.drawPolygon(option,
                (points) => {
                    res(points)
                })
        })
    }
    /**
  * @author: ML（梅兰）
  * @description: 方法描述 拾取建筑模型
  * @param {*} callBack
  * @return {*}
  */
    async pick() {
        return new Promise((res, rej) => {
            this.pickerHelper.on("LEFT_CLICK", (movement) => {
                this.pickerHelper.remove("LEFT_CLICK")
                var pickedFeature = this.viewer.scene.pick(movement.position);
                if (!pickedFeature) return;
                //转换坐标
                var points = this.pickerHelper.getPickPosition(movement.position);
                res({
                    points,
                    pickedFeature,
                });
            });
        })

    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 视图飞向个Entity
     * @param {*} id Entity的id
     * @return {*}
     */
    flyToEntityByID(id, maximumHeight = 300) {
        let entity = this.queryEntityFromDataSources(id);
        if (entity) this.viewer.flyTo(entity, {
            maximumHeight: maximumHeight
        });
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 根据id获取DataSources里的Entity
     * @param {*} id
     * @return {*}
     */
    queryEntityFromDataSources(id) {
        let dataSources = this.viewer.dataSources._dataSources;
        for (let i = 0; i < dataSources.length; i++) {
            let entity = dataSources[i]._entityCollection.getById(id)
            if (entity) return entity;
        }
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 通过wfs查询结果获取建筑信息
     * @param {*}
     * @return {*}
     */
    getBuildingsByFeatrues(features) {
        let buildingArray = [];
        for (var i = 0; i < features.length; i++) {
            let feature = BuildingHelper.processWfsResult(features[i]);
            let center = TurfHelper.getCenter(features[i]).cartesian3;
            let tile = BuildingHelper.getBuildingByRay(this.viewer, [center, feature.geometry.coor[0][0], feature.geometry.coor[0][1]]);
            if (tile) buildingArray.push(tile);
        }
        return buildingArray;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 高亮建筑
     * @param {*} features
     * @return {*}
     */
    hightLightBuilding(features) {
        this.highlightBuildingHelper.hightLightBuildings(this.getBuildingsByFeatrues(features))
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 wfs包含查询，根据范围求包含的图层
     * @param {Array} points
     * @return {*}
     */
    async queryContainAreaByPolygon(points) {
        return await this.wfsHelper.containsPolygon({
            geometry: points,
        })
    }
    /**
   * @author: pwz（潘文周） 
   * @description: 方法描述 wfs相交查询，根据范围求相交的图层
   * @param {Array} points
   * @return {*}
   */
    async queryIntersectAreaByPolygon(points) {
        return await this.wfsHelper.intersectsPolygon({
            geometry: points,
        })
    }
    /**
       * @author: pwz（潘文周） 
       * @description: 方法描述 获取查询数据并计算面积和容积率
       * @param {Array} points
       * @return {*}
       */
    async queryContainAreaByPoint(points) {
        return await this.wfsHelper.intersectsPoint({
            geometry: points,
        })
    }
    /**
    * @author: pwz（潘文周） 
    * @description: 方法描述 清除结果
    * @param {*}
    * @return {*}
    */
    clear() {
        this.pickerHelper.remove("LEFT_CLICK");
        this.highlightBuildingHelper.remove();//清除建筑高亮
        this.drawPolygon.removeAll();
        this.drawPolygon.removeInputAction();
    }
}
export default BuildingPickHelper;