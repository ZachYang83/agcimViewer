
/*
 * @author: pwz（潘文周）
 * @description:  建筑量分析
 */

import BuilingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper.js";
import BuildingPickHelper from "@/sdk/utils/BuildingAnalysis/buildingPickHelper";
class StatisticsBuilding extends BuildingPickHelper {
    constructor(option) {
        super(option)
        this.viewer = option.viewer;
    }
    /**
       * @author: pwz（潘文周） 
       * @description: 方法描述
       * @param {} data 查询的范围
       * @param {String} propety_area 基地面里的面积字段
       * @param {String} propety_floor 基地面里的楼高字段
       * @return {*}
       */
    async getResult(data, propety_area, propety_floor) {
        return new Promise((res, rej) => {
            this.queryContainAreaByPolygon(data).then((result) => {
                var building = [];
                this.hightLightBuilding(result.features);//高亮建筑
                this.highlightBuildingHelper.hightLightPolygeo(result.features);//高亮建筑底面
                result.features.forEach((item, i) => {
                    var features = BuilingHelper.processWfsResult(item, propety_floor, propety_area);
                    building.push({
                        type: item.id,
                        id: item.id,
                        area: BuilingHelper.parseFloat(features.baseArea, 2),
                        buildingArea: BuilingHelper.parseFloat(features.buildingArea, 2),
                    });
                });
                res(this.calculate(building))
            })

        })
    }
    /**
     * @author: pwz（夏豪） 
     * @description: 方法描述 计算相同类型建筑面积，数量
     * @param {Array} building
     * @return {*}
     */
    calculate(building) {
        var buildingArr = [];
        for (var m = 0; m < building.length;) {
            var number = 0;
            var area = 0;
            var buildingArea = 0;
            for (var n = m; n < building.length; n++) {
                if (building[m].type == building[n].type) {
                    number++;
                    area = building[n].area + area;
                    buildingArea = building[n].buildingArea + buildingArea;
                }
            }
            var type = building[m].type;
            buildingArr.push({ name: building[m].id, type, id: building[m].id, number, area, buildingArea });
            m += number;
        }
        return buildingArr
    }

}

export default StatisticsBuilding