

/*
 * @author: pwz（潘文周）
 * @description: 建筑密度分析
 */

import BuildingPickHelper from "@/sdk/utils/BuildingAnalysis/buildingPickHelper";
import BuilingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper.js";


class BuildingDensity extends BuildingPickHelper {
    constructor(option) {
        super(option)
        this.viewer = option.viewer;
    }
    /**
        * @author: pwz（潘文周） 
        * @description: 方法描述
        * @param {} data 查询的范围
        * @param {String} area 基地面里的面积字段
        * @param {String} floor 基地面里的楼高字段
        * @return {*}
        */
    async getResult(data, propety_area, propety_floor) {
        let volumeRates = 0, allArea = 0, buidingDesnsity = 0, buidingAreaDesnsity = 0;
        return new Promise((res, rej) => {
            this.queryContainAreaByPolygon(data).then((result) => {
                //绘制区域的面积
                allArea = BuilingHelper.getArea(data, "meter");
                //没有数据直接返回
                if (!result.features || result.features.length < 1) return res({
                    allArea,
                    buildingAllArea,
                    volumeRates,
                    baseAllArea,
                    buidingDesnsity,
                    buidingAreaDesnsity
                });
                this.hightLightBuilding(result.features);//高亮建筑
                let { baseAllArea, buildingAllArea } = BuilingHelper.getBuildingAreas(
                    result.features,
                    propety_floor,
                    propety_area
                );
                //建筑密度=总建筑基底面积/区域总面积。
                buidingDesnsity = BuilingHelper.getBuidingDesnsity(
                    baseAllArea,
                    allArea
                );
                //建筑面积密度=总建筑面积/区域总面积
                buidingAreaDesnsity = BuilingHelper.getBuidingAreaDesnsity(
                    buildingAllArea,
                    allArea
                );
                res({
                    allArea,
                    buildingAllArea,
                    volumeRates,
                    baseAllArea,
                    buidingDesnsity,
                    buidingAreaDesnsity

                })
            });
        })

    }

}
export default BuildingDensity