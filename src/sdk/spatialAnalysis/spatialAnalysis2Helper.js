import {
    Callbacks
} from "jquery";
import agMath from "@/sdk/maths/math";
import cartesian3Helper from "@/sdk/spatialAnalysis/cartesian3Helper";
import * as martinez from "martinez-polygon-clipping";
import {
    LEFTBUFFER,
    RIGHTBUFFER,
    DOUBLEBUFFER
} from "@/sdk/spatialAnalysis/bufferType";

class SpatialAnalysis2Helper {
    constructor() {

    }
    /**
     * 计算圆弧和线段的交点，尚未严格测试
     * @function CircleLineIntersectPoint
     * @param {Cartesian3[]} circlePathPoints 圆弧点数组
     * @param {Cartesian3[]} line 线段点数组
     * @param {Number} epsilon 允许误差，默认0.05
     * @return {Object[]} 相交点数组，Object.index:交点在圆弧数组中的索引，Object.data:相交点坐标（Cartesian3）  [{"index":index,"data":point}...]
     */
    circleLineIntersectPoint(circlePathPoints, line, epsilon = 0.05) {
        let dir = cartesian3Helper.subtract(line[1], line[0]);
        let intersectPoints = [];
        let min = 360;
        for (let index = 0; index < circlePathPoints.length; index++) {
            let point = circlePathPoints[index];
            let dir2 = cartesian3Helper.subtract(point, line[0]);
            //let angle = agMath.computeAngle(dir2[1],dir2[0],dir[0])
            let angle = Cesium.Cartesian3.angleBetween(dir2, dir);
            angle = angle * 180 / Math.PI;
            if (angle <= epsilon && min > angle) {
                min = angle;
                intersectPoints.push({
                    "index": index,
                    "data": point
                });
            }
        }
        return intersectPoints;
    }

    cartesian3PointsToGeometry(Points) {
        let coordinates = [];
        for (let index = 0; index < Points.length; index++) {
            let coordinate = [];
            coordinate.push(Points[index].x)
            coordinate.push(Points[index].y)
            coordinates.push(coordinate);
        }
        let geometry = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [coordinates]
            }
        }
        return geometry;
    }

    /**
     * 线段沿垂线方向移动一段距离
     * @function lineMoveInPerpendicularDirection
     * @param {Cartesian3[]} line 线笛卡尔点数组
     * @param {Number} distance 移动的距离
     * @param {bufferType} direction 沿垂线的哪个方向
     * @return {Cartesian3[]} 结果笛卡尔点数组
     */
    lineMoveInPerpendicularDirection(line, distance, direction) {
        let upNormal = new Cesium.Cartesian3(0, 0, 1);
        let offset = cartesian3Helper.subtract(line[1], line[0]);
        let p1p0 = cartesian3Helper.normalize(cartesian3Helper.cross(offset, upNormal));
        let movedPoints = [];
        let p0, p1;

        if (direction === RIGHTBUFFER) {
            p0 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, distance), line[0]);
            p1 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, distance), line[1]);

        } else if (direction === LEFTBUFFER) {
            p0 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, -1 * distance), line[0]);
            p1 = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(p1p0, -1 * distance), line[1]);
        }
        movedPoints.push(p0);
        movedPoints.push(p1);
        return movedPoints;
    }

    /**
     * 判断点是否在多边形内
     * @function isInPolygon
     * @param {Cartesian2} point 需要判断的点
     * @param {Array} polygonPoints 多边形的笛卡尔点二维数组
     * @return {Bool} true:在，false:不在
     */
    isInPolygon(point, polygonPoints) {
        var counter = 0;
        var i;
        var xinters;
        var p1, p2;
        var pointCount = polygonPoints.length;
        p1 = polygonPoints[0];

        for (i = 1; i <= pointCount; i++) {
            p2 = polygonPoints[i % pointCount];
            if (
                point.x > Math.min(p1[0], p2[0]) &&
                point.x <= Math.max(p1[0], p2[0])
            ) {
                if (point.y <= Math.max(p1[1], p2[1])) {
                    if (p1[0] != p2[0]) {
                        xinters =
                            (point.x - p1[0]) *
                            (p2[1] - p1[1]) /
                            (p2[0] - p1[0]) +
                            p1[1];
                        if (p1[1] == p2[1] || point.y <= xinters) {
                            counter++;
                        }
                    }
                }
            }
            p1 = p2;
        }
        if (counter % 2 == 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 判断点是否在多环多边形内，对于每个环，若还存在内环，仅判断第一个环
     * @function isInPolygons
     * @param {Cartesian2} point 需要判断的点
     * @param {Array} polygonPoints 多边形的笛卡尔点四维数组
     * @return {Bool} true:在，false:不在
     */
    isInPolygons(point, plygons) {
        let isInsidePolygon = false;
        for (let index = 0; index < plygons.length; index++) {
            let plygon = plygons[index][0];
            if (this.isInPolygon(point, plygon)) {
                isInsidePolygon = true;
                break;
            }
        }
        return isInsidePolygon;
    }

    /**
     * 点转圆,z值保持不变
     * @function pointToCircle
     * @param {Cartesian3} point 圆心坐标
     * @param {Number} radius 圆半径
     * @return {Cartesian3[]} 圆弧坐标点
     */
    pointToCircle(point, radius) {
        let finenessCircle = 360;
        let circlePoints = [];
        for (let i = 0; i <= finenessCircle; i++) {
            var offsetX = Math.cos(i * Math.PI / 180) * radius;
            var offsetY = Math.sin(i * Math.PI / 180) * radius;
            circlePoints.push(new Cesium.Cartesian3(point.x + offsetX, point.y + offsetY, point.z));
        }
        return circlePoints;
    }

    /**
     * 多边形合并
     * @function polygonUnion
     * @param {Cartesian3[]} polygon1 多边形笛卡尔点数组
     * @param {Cartesian3[]} polygon2 多边形笛卡尔点数组
     * @return {Number[[[[]]]]} 合并后的多边形笛卡尔点四维数组
     */
    polygonUnion(polygon1, polygon2) {
        let geometry1 = this.cartesian3PointsToGeometry(polygon1);
        let geometry2 = this.cartesian3PointsToGeometry(polygon2);
        var union = martinez.union(geometry1.coordinates, geometry2.coordinates);
        return union;
    }

     /**
     * 多边形合并
     * @function polygonsUnion
     * @param {Cartesian3[[]]} polygons 多边形笛卡尔点二维数组
     * @return {Number[[[[]]]]} 合并后的多边形笛卡尔点四维数组
     */
    polygonsUnion(polygons) {
        if(polygons.length<=0){
            return null;
        }

        let union = this.cartesian3PointsToGeometry(polygons[0]).geometry.coordinates;
        for (let index = 1; index < polygons.length; index++) {
            let geo = this.cartesian3PointsToGeometry(polygons[index]);
            union = martinez.union(union, geo.geometry.coordinates);
        }
        return union;
    }


    /**
     * 对点集排序（逆时针），点都在xoy一个平面，尚未严格测试
     * @function sortPoint
     * @param {Cartesian3[]} points 需要排序的点
     * @return {Cartesian3[]} 排序好的点
     */
    sortPoint(points) {
        var letfButtom = points[0];
        for (let i = 1; i < points.length; i++) {
            if (letfButtom.x > points[i].x)
                letfButtom = points[i];
        }
        var list = [];
        var dir = new Cesium.Cartesian3(0, -1, 2);
        for (let j = 0; j < points.length; j++) {
            let p = cartesian3Helper.subtract(points[j], letfButtom);
            if (p.x == 0 && p.y == 0) {
                list.push({
                    "point": points[j],
                    "angle": 0
                });
                continue;
            }
            try {
                let angle = Cesium.Cartesian3.angleBetween(p, dir);
                list.push({
                    "point": points[j],
                    "angle": angle
                });
            } catch (error) {}

        }
        list.sort(function (a, b) {
            return a.angle - b.angle
        })
        var result = [];
        for (let k = 0; k < list.length; k++) {
            result.push(list[k].point);
        }
        return result;
    }


}
export default new SpatialAnalysis2Helper();