/*
 * @author: pwz（潘文周）
 * @description: 文件描述
 */
import agMath from "@/sdk/maths/math";
import picture from "../img/background.png";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import AgPolygon from "@/sdk/geometry/polygon";
import PickerHelper from "@/sdk/interactive/pickerHelper.js"
import BuilingHelper from "@/sdk/utils/BuildingAnalysis/buildingHelper.js";
import coordinate from "@/sdk/maths/coordinate.js"

var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
class BacklineAnalysis {
    constructor(viewer, buildingAreaName) {
        this.viewer = viewer;
        this.result = [];
        this.buildingAreaName = buildingAreaName;
        this.draw = new agcim.interactive.Draw(this.viewer);
        this.pickerHelper = new PickerHelper(this.viewer)
        this.builingHelper = new BuilingHelper(this.viewer)
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 绘制退线红线几何图形
     * @param {*} viewer
     * @param {*} callBack
     * @return {*}
     */
    drawBacklinePolygon(callBack) {
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
            //先清除结果
            if (callBack) callBack(points, this.builingHelper.getBuildingAreaByRay(points, this.buildingAreaName));
        }, error => {
            console.log(error);
        });
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 绘制建筑基底面
     * @param {*} buildPositions
     * @return {*}
     */
    addBuildingPolygon(buildPositions) {
        agFeatureLayer.addEntity(new AgPolygon("基底面", buildPositions))
    }
    /**
       * @author: pwz（潘文周） 
       * @description: 方法描述 退线分析
       * @param {*} backlineDistance 红线距离
       * @param {*} backlinePos 退线范围
       * @param {*} builidPosArr 建筑基底面数组
       * @param {*} isDrawBuildingPolygon 是否绘制
       * @return {*}
       */
    analysis(backlineDistance, backlinePos, builidPosArr, isDrawBuildingPolygon) {

        this.result = [];
        builidPosArr.forEach(builidPos => {
            let polylineArr = [];
            //绘制建筑底面
            if (isDrawBuildingPolygon) {
                this.addBuildingPolygon(builidPos);
            }
            // 遍历建筑底面顶点，找到顶点到退线红线的最短距离
            for (let i = 0; i < builidPos.length; i++) {
                polylineArr.push(this.getShortDistance(builidPos[i], backlinePos))
            }
            let _polylineArr = polylineArr.sort((a, b) => a.distance - b.distance).splice(0, 10);
            this.result.push(this._addPolyline(_polylineArr, backlineDistance))
        })
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述
     * @param {*} builidPoint 建筑底面顶点
     * @param {*} backlinePos 退距红线
     * @return {*}
     */
    getShortDistance(builidPoint, backlinePos) {
        //储存建筑底面顶点到各红线的距离
        let lineObject = [];
        //遍历退距红线，求建筑底面顶点到退距红线的距离
        for (let i = 0; i < backlinePos.length; i++) {
            if (i == backlinePos.length - 1) {
                lineObject.push(this.getShortDistancePointToLine(builidPoint, backlinePos[i], backlinePos[0]))
            } else {
                lineObject.push(this.getShortDistancePointToLine(builidPoint, backlinePos[i], backlinePos[i + 1]))
            }
        }
        let sortData = lineObject.sort(function (a, b) {
            return a.distance - b.distance
        })
        return sortData[0]
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述
     * @param {*} point 需要求距离的点
     * @param {*} start 线段起点
     * @param {*} end 线段终点
     * @return {*}
     */
    getShortDistancePointToLine(point, start, end) {
        let l1 = 0, l2 = 0, footPoint;
        footPoint = agMath.computeFootPoint(point, start, end);
        if (!this.pointInLine(footPoint, start, end)) {
            footPoint = null
        }
        if (footPoint) {
            //求垂点距离
            return {
                distance: agMath.getDistance(point, footPoint),
                points: [point, footPoint]
            }
        } else {
            //求到两端点距离,然后找到这两条线段最端的那条
            l1 = agMath.getDistance(point, start);
            l2 = agMath.getDistance(point, end);
            if (l1 > l2) {
                return {
                    distance: l2,
                    points: [point, end]
                }
            } else {
                return {
                    distance: l1,
                    points: [point, start]
                }
            }
        }
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 判断垂点是否在直线上
     * @param {*} point
     * @param {*} start
     * @param {*} end
     * @return {*}
     */
    pointInLine(point, start, end) {
        let minX, mixY, maxX, maxY;
        minX = Math.min(start.x, end.x)
        mixY = Math.min(start.y, end.y)
        maxX = Math.max(start.x, end.x)
        maxY = Math.max(start.y, end.y)
        if (point.x >= minX && point.x <= maxX && point.y >= mixY && point.y <= maxY) {
            return true;
        }
        return false
    }
    /**
     * @author: pwz（潘文周） 红线和建筑底面的最短距离的连线
     * @description: 方法描述
     * @param {*} polylineArr 最短距离连线数组
     * @param {*} backlineDistance 退距距离
     * @return {*}
     */
    _addPolyline(polylineArr, backlineDistance) {
        let material = Cesium.Color.GREEN, result = [];
        //合理的最小退线距离
        let minBacklineDistance = backlineDistance * 1.5
        for (let i = 0; i < polylineArr.length; i++) {
            let distance = polylineArr[i].distance;
            let obj = {
                name: i,
                distance: distance.toFixed(2),//实际距离 保留两位小数
                backlineDistance,//退线距离
                difference: (distance - backlineDistance).toFixed(2),
                conmpliance: true,//是否合规
            }
            if (distance < backlineDistance) {
                //小于退线距离，不合规
                material = Cesium.Color.RED;
                obj.conmpliance = false

            } else if (distance <= minBacklineDistance) {
                //合规但是小于合理最小退线距离
                material = Cesium.Color.GOLD;
            }
            //标注不合规的线
            var heightMidPoint = agMath.computeMidPoint(polylineArr[i].points[0], polylineArr[i].points[1]);
            this.addLableEntity(i, heightMidPoint, obj.distance, material);
            let line = agFeatureLayer.addEntity({
                name: obj.name,
                polyline: {
                    positions: polylineArr[i].points,
                    material: material,
                    width: 4,
                },
            });
            obj.object = line._id;
            result.push(obj)
        }
        return result
    }

    /**
       * 添加文字标注
       * @param {Cartesian3} position 标注坐标
       * @param {string} text 标注文字
       */
    addLableEntity(msg, position, text, backgroundColor) {
        agFeatureLayer.addEntity({
            label: {
                text: msg + ": " + text + "m",
                font: "16px Helvetica",
                pixelOffset: new Cesium.Cartesian2(-55, -12),
                showBackground: true,
                backgroundColor: backgroundColor,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                outlineWidth: 20,
                outlineColor: Cesium.Color.RED
            },
            position: position,

        });
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 飞行某条线
     * @param {*} id
     * @return {*}
     */
    flyToLine(id) {
        let entity = this.viewer.entities.getById(id);
        let positions = entity._polyline._positions._value
        this.viewer.scene.camera.flyTo({
            destination: coordinate.changePointAddHeight(agMath.computeMidPoint(positions[0], positions[1]), 20),
        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 释放内存清除绘制结果
     * @param {*}
     * @return {*}
     */
    dispose() {
        this.result = [];
        this.clear()
        this.draw.dispose();
        this.draw = null;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除控规分析的结果
     * @param {*}
     * @return {*}
     */
    clear() {
        agFeatureLayer.removeAll();
        if (this.draw) {
            this.draw.removeAll();
            // this.draw.dispose();
            this.draw.removeInputAction();
        }
    }
}
export default BacklineAnalysis;