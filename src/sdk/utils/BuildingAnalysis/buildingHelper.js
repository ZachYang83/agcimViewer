/*
 * @author: pwz（潘文周）
 * @description: 文件描述 用于存放和建筑相关的一些计算
 */
import PickerHelper from "@/sdk/interactive/pickerHelper.js"
import * as turf from '@turf/turf'
import coordinate from "@/sdk/maths/coordinate.js"
import agMath from "@/sdk/maths/math";
import TurfHelper from "@/sdk/utils/turfHelper"
class BuilingHelper {
    constructor(viewer) {
        this.viewer = viewer;
        this.pickerHelper = new PickerHelper(this.viewer)
    }
    /**
       * @author: pwz（潘文周） 
       * @description: 方法描述 通过射线的方式获取建筑基底面
       * @param {*} points 基底面坐标数组
       * @param {*} buildingAreaName 基底面图层名称
       * @return {*}
       */
    static getBuildingAreaByRay(points, buildingAreaName) {
        let buidingObjects = {};
        for (let i = 1; i < points.length; i++) {
            var startPoint = points[i];
            for (let j = i + 1; j < points.length; j++) {
                if (Cesium.Cartesian3.equals(points[j], startPoint)) continue;//起点和终点坐标一样做射线会报错
                let result = this.pickerHelper.axisDrillPickFromRay(points[j], startPoint) || [];
                result.forEach(item => {
                    if (item.object && item.object.id && item.object.id._id && item.object.id._id.includes(buildingAreaName)) {
                        let _builidPoint = item.object.id._polygon._hierarchy._value.positions
                        if (BuilingHelper.booleanContains(_builidPoint, points)) {
                            if (!buidingObjects[item.object.id._id]) {
                                buidingObjects[item.object.id._id] = { positions: _builidPoint, object: item.object }
                            }
                        }
                    }
                })

            }
        }
        return Object.values(buidingObjects)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 几何范围做射线
     * @param {*}
     * @return {*}
     */
    static getObjectByAeraRay(viewer, points) {
        let result = [];
        for (let i = 1; i < points.length; i++) {
            result.push(PickerHelper.verticalDrillPickFromRay(viewer, points[i]))
        }
        return result
    }

    /**
   * @author: pwz（潘文周） 
   * @description: 方法描述 用来判断两个几何图形是否是包含关系
   * @param {*} pointsA
   * @param {*} pointsB
   * @return {*}
   */
    static booleanContains(pointsA, pointsB) {
        let geometryA = [], geometryB = [];
        if (pointsB[0].x != pointsB[pointsB.length - 1].x || pointsB[0].y != pointsB[pointsB.length - 1].y) pointsB.push(pointsB[0]);
        geometryA.push(TurfHelper.transformCoordsArray(pointsA))
        geometryB.push(TurfHelper.transformCoordsArray(pointsB))
        return turf.booleanContains(turf.polygon(geometryB), turf.polygon(geometryA));
    }

    /**
      * @author: pwz（潘文周） 
      * @description: 方法描述 用建筑底面计算建筑的高度
      * @param {*} area 基底面坐标数组
      * @param {*} option.boxLayerName 控规盒子图层名称
      * @param {*} option.buildingAreaName 基底面图层名称
      * @return {*}
      */
    static computerBuildingHeight(area, option) {
        let result = {};
        for (let i = 0; i < area.length; i++) {
            let areaCartographic = Cesium.Cartographic.fromCartesian(area[i]);
            let cartesian = Cesium.Cartesian3.fromRadians(areaCartographic.longitude, areaCartographic.latitude, 1000);
            let results = this.pickerHelper.axisDrillPickFromRay(area[i], cartesian);
            let buildingMaxHeight = 0;//用于储存建筑最高高度
            let buildingMaxHeightPosition = null;//用于储存建筑最高高度点位置
            for (let i = 0; i < results.length; i++) {
                if (!results[i].position) continue
                let _cartographics = Cesium.Cartographic.fromCartesian(results[i].position);
                let objHeight = _cartographics.height.toFixed(2)
                //获取控规盒子高度
                if (results[i].object && results[i].object.id && results[i].object.id._name == option.boxLayerName) {
                    result.box = {
                        name: option.boxLayerName,
                        height: objHeight,
                        object: results[i].object.id,
                        position: results[i].position
                    }
                }
                //获取基地面高度
                if (results[i].object && results[i].object.id && results[i].object.id._id.includes(option.buildingAreaName)) {
                    result.area = {
                        name: option.buildingAreaName,
                        height: objHeight,
                        object: results[i].object.id,
                        position: results[i].position
                    }
                }
                //房屋高度
                if (results[i].object && results[i].object._content) {
                    if (buildingMaxHeight < objHeight) {
                        buildingMaxHeight = objHeight;
                        buildingMaxHeightPosition = results[i].position;
                    };
                    result.building = {
                        name: "建筑高度",
                        height: buildingMaxHeight,
                        position: buildingMaxHeightPosition
                    }
                }
            }
        }
        return result;
    }
    /**
    * @author: pwz（潘文周） 
    * @description: 方法描述 过滤密集点
    * @param {*} points
    * @return {*}
    */
    static filterPointsByDistance(points = [], distance = 3) {
        var filterPoint = [];
        if (points.length < 20 || points.length == 0) {
            return points
        }
        filterPoint.push(points[0])
        let currentPoint = filterPoint[0];
        for (let i = 0; i < points.length; i++) {
            let _distance = agMath.getDistance(currentPoint, points[i]);
            //储存超过指定距离的点
            if (_distance > distance) {
                currentPoint = points[i]
                filterPoint.push(currentPoint)
            }
        }
        return filterPoint;

    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 获取建筑
     * @param {*}
     * @return {*}
     */
    static getBuildingByRay(viewer, points) {
        let buildingObject = null;
        points = points.splice(0, 3);//用建筑底面的三个点去求建筑
        let result = BuilingHelper.getObjectByAeraRay(viewer, points)
        result.map(item => {
            item.map(da => {
                if (da.object instanceof Cesium.Cesium3DTileFeature) {
                    buildingObject = da.object.primitive
                }
            })
        })
        return buildingObject;
    }

    /**
  * @author: pwz（潘文周） 
  * @description: 方法描述  计算面积
  * @param {Cartesian3 []} positions 坐标数组
  *  @param {String} unit 单位平方米或者平方千米
  *  @param {Number} index 保留小数点位数
  * @return {*}
  */
    static getArea(positions, unit = "meter", index) {
        return BuilingHelper.parseFloat(agMath.getArea(positions, unit), index)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 处理wfs查询结果，返回基地面面积，房屋面积
     * @param {*} feature geojson对象。wfs查询结果
     * @param {String} propety_floor 基底面楼高字段
     * @param {String} propety_area 基底面面积字段
     * @param {String} unit 面积单位，平方米或者平方千米
     * @return {*} feature.floor 建筑层数， feature.baseArea建筑基底面面积， feature.buildingArea建筑面积
     */
    static processWfsResult(feature, propety_floor, propety_area, unit = "meter") {
        let floorHeight = 1, baseArea = 0, buildingArea = 0;
        //增加楼层字段
        feature.floor = floorHeight;
        if (propety_floor in feature.properties || propety_floor in feature) {
            floorHeight = Number.parseFloat(feature.properties[propety_floor]) || Number.parseFloat(feature[propety_floor]);
            feature.floor = floorHeight;
        }
        if (propety_area in feature.properties || propety_area in feature) {
            baseArea = Number.parseFloat(feature.properties[propety_area]) || Number.parseFloat(feature[propety_area]);
            feature.baseArea = baseArea;
            feature.buildingArea = baseArea * feature.floor;
            feature.geometry.coor = [];
            feature.geometry.coordinates.map(coors => {
                coors.map(coor => {
                    let points = coordinate.WGS84ArraysToCartesian3(coor);
                    feature.geometry.coor.push(points);
                })
            })
        } else {
            feature.geometry.coor = [];
            feature.geometry.coordinates.map(coors => {
                coors.map(coor => {
                    let points = coordinate.WGS84ArraysToCartesian3(coor);
                    feature.geometry.coor.push(points);
                    buildingArea += agMath.getArea(points, unit) * floorHeight;
                })
            })
            //基底面字段
            feature.baseArea = BuilingHelper.parseFloat(TurfHelper.getArea(feature));
            //建筑面积字段
            feature.buildingArea = buildingArea;
        }
        return feature;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 获取建筑总面积，基底面总面积
     * @param {Object} features 要素集合
     * @param {String} floor 楼层字段
     * @param {String} propety_area 面积字段
     * @param {String} unit 面积单位，米或者千米
     * @return {*}
     */
    static getBuildingAreas(features, propety_floor, propety_area, unit = "meter", index = 2) {
        let buildingAllArea = 0, baseAllArea = 0;
        features.map((item) => {
            let result = BuilingHelper.processWfsResult(item, propety_floor, propety_area, unit);
            buildingAllArea += result.buildingArea;
            baseAllArea += result.baseArea
        })
        return {
            buildingAllArea: BuilingHelper.parseFloat(buildingAllArea, index),
            baseAllArea: BuilingHelper.parseFloat(baseAllArea, index),
        }
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 建筑面积密度=总建筑面积/区域总面积
     * @param {Number} buildingAllArea 建筑总面积
     * @param {Number} allArea 区域总面积
     *  @param {Number} index 保留小数点位数
     * @return {*} 返回建筑密度
     */
    static getBuidingAreaDesnsity(buildingAllArea, allArea, index) {
        return BuilingHelper.parseFloat(buildingAllArea / allArea, index)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 //建筑密度=总建筑基底面积/区域总面积。
     * @param {Number} baseAllArea 总建筑基底面积
     * @param {Number} allArea 区域总面积
     * @param {Number} index 保留小数点位数
     * @return {*}
     */
    static getBuidingDesnsity(baseAllArea, allArea, index) {
        return BuilingHelper.parseFloat(baseAllArea / allArea * 100, index)
    }
    /**
    * @author: pwz（潘文周） 
    * @description: 方法描述 计算容积率
    * @param {*} buildingAllArea 建筑
    * @param {*} area
    * @return {*}
    */
    static getVolumeRates(buildingAllArea, area, index) {
        return BuilingHelper.parseFloat(buildingAllArea / area, index)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 拆迁费用 拆迁总面积* 拆迁费用 = 拆迁总费用
     * @param {*} buildingAllArea 拆迁面积
     * @param {*} cost 拆迁费用
     * @param {*} index 小数点位数
     * @return {*} 
     */
    static getDemoliCost(buildingAllArea, cost, index) {
        return BuilingHelper.parseFloat(buildingAllArea * cost, index)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 保留浮点数小数点位数
     * @param {Number} data
     * @param {Number} index 保留小数点的位数
     * @return {Number} 
     */
    static parseFloat(data, index = 2) {
        return Number.parseFloat(Number.parseFloat(data).toFixed(index))
    }
}
export default BuilingHelper;
