


/**
 * @author: ydy (袁达懿) 
 * @description: 计算拆迁量 
 */
import BuildingPickHelper from "@/sdk/utils/BuildingAnalysis/buildingPickHelper";
import BuildingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper";
import BuildingPopupHelper from "@/sdk/utils/BuildingAnalysis/buildingPopupHelper.js"

class DemolitionAnalysis extends BuildingPickHelper {
    constructor(option) {
        super(option)
        this.viewer = option.viewer;
        this.buildingPopupHelper = new BuildingPopupHelper(this.viewer);
        this.featureResult = [];//储存每个基底面的信息
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 点击拾取建筑，显示拆迁信息
     * @param {*} demoliMoney 拆迁费用
     * @param {*} height popup高度
     * @return {*}
     */
    pickBuilding(demoliMoney, height) {
        this.pickerHelper.remove("LEFT_CLICK")
        this.pickerHelper.on("LEFT_CLICK", (movement) => {
            //转换坐标
            var points = this.pickerHelper.getPickPosition(movement.position);
            this.queryContainAreaByPoint(points).then(data => {
                if (data.features.length > 0) {
                    let feature = this.featureResult.find(item => item.id === data.features[0].id);
                    if (feature) {
                        this.buildingPopupHelper.buildingCenterPopup(feature, {
                            text: "建筑面积（平方米）:" + BuildingHelper.parseFloat(feature.buildingArea) +
                                "\n" + "拆迁费用（万元）:" + this.getDemoliCost(feature.buildingArea, demoliMoney)
                        }, height)
                    }
                }
            })
        })
        this.pickerHelper.remove("RIGHT_CLICK")
        this.pickerHelper.on("RIGHT_CLICK", (movement) => {
            var points = this.pickerHelper.getPickPosition(movement.position);
            this.queryContainAreaByPoint(points).then(data => {
                if (data.features.length > 0) {
                    let feature = this.featureResult.find(item => item.id === data.features[0].id);
                    if (feature) this.buildingPopupHelper.removePopup(feature)
                }
            })
        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 获取查询结果
     * @param {} drawPoints 查询的范围
     * @param {String} propety_area 基地面里的面积字段
     * @param {String} propety_floor 基地面里的楼高字段
     * @return {*}
     */
    async getResult(drawPoints, demoliMoney, propety_area, propety_floor) {
        // 根据绘制范围去查询wfs服务，求得范围内包含的基底面
        let d = await this.queryIntersectAreaByPolygon(drawPoints);
        let buildingAllArea = BuildingHelper.getArea(drawPoints, "meter");
        let result = this._getResult(d, demoliMoney, propety_area, propety_floor);
        this.pickBuilding(demoliMoney, propety_area, propety_floor);
        return Object.assign({}, {
            buildingAllArea
        }, result)

    }
    //根据查询结果计算建筑面积，和拆迁总费用
    _getResult(result, demoliMoney, propety_area, propety_floor) {
        this.featureResult = [];
        let demoliAllArea = 0;
        //没有数据直接返回
        if (!result.features || result.features.length < 1) return { demoliAllArea, demoliMoneyByAllCost: "" }
        this.hightLightBuilding(result.features);//高亮建筑
        this.highlightBuildingHelper.hightLightPolygeo(result.features);//高亮建筑底面
        //先从wfs服务里查出相交的基底面，然后判断，如果有面积字段，没有的话就调用接口计算面积
        result.features.map((item) => {
            let featureResult = BuildingHelper.processWfsResult(item, propety_floor, propety_area, "meter");
            //储存结果，用于点击查询
            this.featureResult.push(featureResult)
            demoliAllArea += featureResult.buildingArea
        })
        let demoliMoneyByAllCost = this.getDemoliCost(demoliAllArea, demoliMoney)
        return { demoliAllArea: BuildingHelper.parseFloat(demoliAllArea), demoliMoneyByAllCost }
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 拆迁总费用
     * @param {*} demoliAllArea 拆迁建筑面积
     * @param {*} demoliMoney 拆迁费用
     * @return {*}
     */
    getDemoliCost(demoliAllArea, demoliMoney) {
        return BuildingHelper.getDemoliCost(demoliAllArea, demoliMoney, 4)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除
     * @param {*}
     * @return {*}
     */
    remove() {
        this.clear();
        this.pickerHelper.remove("LEFT_CLICK")
        this.pickerHelper.remove("RIGHT_CLICK")
        this.buildingPopupHelper.remove();//清除popup
    }
}
export default DemolitionAnalysis;