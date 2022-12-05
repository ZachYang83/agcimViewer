

/**
 * @author: pwz（潘文周） 
 * @description: 计算容积率
 */

import BuildingPickHelper from "@/sdk/utils/BuildingAnalysis/buildingPickHelper";
import BuilingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper.js";

class VolumeRate extends BuildingPickHelper {
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
        let buildingAllArea = 0, volumeRates = 0, queryArea = 0;
        return new Promise((res, rej) => {
            this.queryContainAreaByPolygon(data).then((result) => {
                queryArea = BuilingHelper.getArea(data, "meter"); //绘制区域的面积
                //没有数据直接返回
                if (!result.features || result.features.length < 1) return res({
                    area: queryArea,
                    buildingAllArea,
                    volumeRates
                });
                this.hightLightBuilding(result.features);//高亮建筑
                this.highlightBuildingHelper.hightLightPolygeo(result.features);//高亮建筑底面
                //建筑总面积
                buildingAllArea = BuilingHelper.getBuildingAreas(
                    result.features,
                    propety_floor,
                    propety_area
                ).buildingAllArea;
                // }
                //计算容积率
                volumeRates = BuilingHelper.getVolumeRates(
                    buildingAllArea,
                    queryArea
                );
                res({
                    area: queryArea,
                    buildingAllArea,
                    volumeRates
                })
            });
        })

    }

}
export default VolumeRate;