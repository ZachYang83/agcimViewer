
/*
 * @author: ML（梅兰）
 * @description: 文件描述 建筑底面提取
 */

import BuildingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper";
import BuildingPickHelper from "@/sdk/utils/BuildingAnalysis/buildingPickHelper";
import TurfHelper from "@/sdk/utils/turfHelper"

class BuildingBottomSurface extends BuildingPickHelper {
    constructor(option) {
        super(option);
        this.viewer = option.viewer;
        this.results = [];
        this.pickedFeatureArry = [];
    }
    /**
       * @author: ML（梅兰）
       * @description: 方法描述 绘制建筑底面提取范围
       * @param {*} callBack
       * @return {*}
       */
    async drawPolygons(option) {
        let points = await this.draw(option)
        return {
            points,
            type: '1'
        }
    }
    /**
     * @author: ML（梅兰）
     * @description: 方法描述 拾取建筑模型
     * @param {*} callBack
     * @return {*}
     */
    async pickBuilding() {
        let data = await this.pick();
        return {
            points: data.points,
            type: '2'
        }
    }
    /**
     * @author: ML（梅兰）
     * @description: 方法描述 获取查询数据
     * @param {Array} points
     * @param {String} type  1-绘制区域  2-点击选取
     * @return {*}
     */
    async queryContainArea(points, type) {
        let data;
        if (type === '2') {
            data = await this.queryContainAreaByPoint(points);
        } else {
            data = await this.queryContainAreaByPolygon(points);
        }
        this.highlightBuildingHelper.hightLightPolygeo(data.features);//高亮建筑底面
        return data;
    }
    /**
     * @author: ML（梅兰）
     * @description: 方法描述 生成表格数据
     * @param {*}
     * @return {*}
     */
    createTableDataBywfs(building) {
        var result = [];
        //插入建筑类型和建筑位置数据
        for (var i = 0; i < building.length; i++) {
            let feature = BuildingHelper.processWfsResult(building[i]);
            let center = TurfHelper.getCenter(building[i]).cartesian3;
            let tile = BuildingHelper.getBuildingByRay(this.viewer, [center, feature.geometry.coor[0][0], feature.geometry.coor[0][1]]);
            if (tile) this.pickedFeatureArry.push(tile);
            var area = BuildingHelper.parseFloat(BuildingHelper.processWfsResult(building[i]).baseArea)
            result.push({
                id: building[i].id,
                name: building[i].id,
                area: area,
            });
        }
        this.toggleBuildings(false)
        return result
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 显示和隐藏建筑
     * @param {*} state
     * @return {*}
     */
    toggleBuildings(state) {
        this.pickedFeatureArry.forEach(function (item) {
            item.show = state;
        });
    }
    /**
     * @author: ML（梅兰）
     * @description: 方法描述 清除
     * @param {*}
     * @return {*}
     */
    remove() {
        this.results = [];
        this.toggleBuildings(true);
        this.pickedFeatureArry = [];
        this.clear();
    }
}
export default BuildingBottomSurface;