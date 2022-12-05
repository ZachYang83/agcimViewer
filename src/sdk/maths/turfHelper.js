

/*
 * @author: pwz（潘文周）
 * @description: 用于二维的空间计算
 */
import * as turf from '@turf/turf'
import coordinate from "@/sdk/maths/coordinate.js"

class TurfHelper {
    /**
    * @author: pwz（潘文周） 
    * @description:  将单个世界坐标转成数组形式的经纬度坐标,三维坐标转二维坐标
    * @param {Cartesian3} cartesian3 世界坐标点
    * @return {Array} 返回格式例如 [-5, 52]
    */
    static transformCartesian3(cartesian3) {
        let cartographic = coordinate.Cartesian3_to_WGS84(cartesian3)
        return [cartographic.lng, cartographic.lat]
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  将世界坐标构造用于turf计算的点
     * @param {Cartesian3} cartesian3 世界坐标点
     * @return {Object} 返回 turf的point对象
     */
    static point(cartesian3) {
        return turf.point(TurfHelper.transformCartesian3(cartesian3))
    }
    /**
   * @author: pwz（潘文周） 
   * @description:  将世界坐标构造用于turf计算的线
   * @param {Cartesian3 []} cartesian3Array 世界坐标数组
   * @return {Object} 返回 turf的line对象
   */
    static lineString(cartesian3Array) {
        return turf.lineString(TurfHelper.transformCoordsArray(cartesian3Array))
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  将世界坐标构造用于turf计算的多边形
     * @param  {Cartesian3 []} cartesian3Array 世界坐标数组
     * @return {Object} 返回 turf的polygon对象
     */
    static polygon(cartesian3Array) {
        let array = JSON.parse(JSON.stringify(cartesian3Array))
        array = TurfHelper.closePolygeoCartesian3s(array)
        return turf.polygon([TurfHelper.transformCoordsArray(array)])
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 根据传入的坐标情况构建点，线，多边形
     */
    static feature(cartesian3Array) {
        if (cartesian3Array.length == 2) {
            return TurfHelper.lineString(cartesian3Array)
        } else if (cartesian3Array.length > 2) {
            return TurfHelper.polygon(cartesian3Array)
        }
        return TurfHelper.point(cartesian3Array)
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  获取面积,只能用于二维
     * @param {	GeoJSON} feature 传入	GeoJSON 要素
     * @return {Number} 返回以平方米为单位的面积
     */
    static getArea(feature) {
        return turf.area(feature);
    }
    /**
    * @author: pwz（潘文周） 
    * @description:  获取中点，二维坐标转三维坐标
    * @param {GeoJSON} feature 传入geoJson对象
    * @return {Object} 返回经纬度，世界坐标， geoJson点对象
    */
    static getCenter(feature) {
        let center = turf.center(feature);
        let coor = turf.getCoord(center);
        let cartesian3 = Cesium.Cartesian3.fromDegrees(coor[0], coor[1])
        return {
            geometry: center,
            coor,
            cartesian3
        }
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 获取世界坐标数组的中心点
     * @param {*}
     * @return {*}
     */
    static getCenterCartesian3s(cartesian3Array) {
        let feature = TurfHelper.feature(cartesian3Array)
        return TurfHelper.getCenter(feature).cartesian3
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  提取geoJson对象里的坐标数组
     * @param {GeoJSON} feature 传入geoJson对象
     * @return {Array} 返回数组形式的经纬度坐标 
     */
    static getCoords(feature) {
        return turf.getCoords(feature);
    }
    /**
     * @author: pwz（潘文周）  
     * @description:  提取geoJson对象里的坐标数组转成世界坐标数组,二维坐标转三维坐标
     * @param {GeoJSON} feature 传入geoJson对象
     * @return {Cartesian3 []} 返回世界坐标数组
     */
    static getCoordsCartesian3(feature) {
        let coors = TurfHelper.getCoords(feature);
        return coors.map(coor => {
            return coor.map(item => {
                return coordinate.WGS84ArraysToCartesian3(item);
            })
        })
    }
    /**
    * @author: pwz（潘文周） 
    * @description:  转换特定格式的坐标串,三维坐标转二维坐标
    * @param {Cartesian3 []} cartesian3Array 世界坐标数组
    * @return {*} 返回格式例如 [[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]
    */
    static transformCoordsArray(cartesian3Array) {
        let cartographics = coordinate.cartesian3ToCartographicMany(cartesian3Array, "Degrees")
        return cartographics.map(item => {
            return [item.lng, item.lat]
        })
    }
    /**
    * @description: 方法描述  将feature转成用于wfs查询的字符串
    * @param {GeoJSON } feature 
    * @return {*} 返回用于wfs查询的字符串例如  113.37473621,23.10370166 113.37473647,23.1037024 113.37477098,23.10372272
    */
    static featurecoorToWfsWGS84Stsring(feature) {
        let coorArray = TurfHelper.turf.getCoords(feature);
        if (feature.geometry.type === "Point") return coorArray.join();
        if (feature.geometry.type === "LineString") return coorArray.reduce((a, b) => a.join() + " " + b.join());
        if (feature.geometry.type === "Polygon") {
            let coorStr = "";
            coorArray.forEach(coors => {
                if (coors.length % 2 != 0) {
                    for (let i = 0; i < coors.length - 1; i++) {
                        coorStr += coors[i].join() + " " + coors[i + 1].join() + " ";
                        i++;
                    }
                    coorStr += coors[coors.length - 1].join();
                } else {
                    for (let i = 0; i < coors.length; i++) {
                        coorStr += coors[i].join() + " " + coors[i + 1].join() + " ";
                        i++;
                    }
                }

            })
            return coorStr;
        }

    }
    /**
     * @author: pwz（潘文周） 
     * @description:  传入两组图形的坐标数组，判断图形的相交情况
     * @param {Array} coorsA 图形A坐标数组
     * @param {Array} coorsB 图形B坐标数组
     * @return {Boolean} true相交，false不想交
     */
    static intersect(coorsA, coorsB) {
        return turf.intersect(
            turf.polygon(coorsA),
            turf.polygon(coorsB)
        );
    }

    /**
     * @author: pwz（潘文周） 
     * @description:  求两个多边形的包含关系
     * @param {Polygeo} geometryA 多边形A
     * @param {Polygeo} geometryB 多边形B
     * @return {Boolean} 包含返回true,不包含返回false
     */
    static booleanContains(geometryA, geometryB) {
        return turf.booleanContains(geometryA, geometryB)
    }
    /**
   * @author: pwz（潘文周） 
   * @description:  传入两组图形的坐标数组，判断图形的相交情况
   * @param {cartesian3 || cartesian3 []} cartesian3ArrayA 世界坐标或者世界坐标数组
   * @param {cartesian3 || cartesian3 []} cartesian3ArrayB 世界坐标或者世界坐标数组
   * @return {Boolean} true相交，false不想交
   */
    static intersectCartesian3s(cartesian3ArrayA, cartesian3ArrayB) {
        return turf.intersect(
            TurfHelper.polygon(cartesian3ArrayA),
            TurfHelper.polygon(cartesian3ArrayB)
        );
    }
    /**
* @author: pwz（潘文周） 
* @description:  传入两组图形的坐标数组，判断图形的相交情况
* @param {cartesian3 || cartesian3 []} cartesian3ArrayA 世界坐标或者世界坐标数组
* @param {cartesian3 || cartesian3 []} cartesian3ArrayB 世界坐标或者世界坐标数组
* @return {Boolean} true相交，false不想交
*/
    static lineIntersectCartesian3s(cartesian3ArrayA, cartesian3ArrayB) {
        let result = turf.lineIntersect(
            TurfHelper.feature(cartesian3ArrayA),
            TurfHelper.feature(cartesian3ArrayB)
        );
        return result.features.length > 0
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  判断两组世界坐标的多边形是否存在第一个多边形包含第二个多边形
     * @param {cartesian3 []} cartesian3ArrayA 世界坐标数组
     * @param {cartesian3 []} cartesian3ArrayB 世界坐标数组
     * @return {Boolean}  包含返回true,不包含返回false
     */
    static booleanContainsByCartesian3s(cartesian3ArrayA, cartesian3ArrayB) {
        return TurfHelper.booleanContains(TurfHelper.feature(cartesian3ArrayA), TurfHelper.feature(cartesian3ArrayB));
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  求点到直线最近的点(点不一定在直线上)
     * @param {cartesian3} cartesian3 某个点
     * @param {cartesian3} startCartesian3 直线的起点
     * @param {cartesian3} endCartesian3 直线终点
     * @return {cartesian3} 返回点到直线在平面上投影的垂点
     */
    static nearestPointOnLineCartesian32d(cartesian3, startCartesian3, endCartesian3) {
        let point = TurfHelper.point(cartesian3);
        let line = TurfHelper.lineString([startCartesian3, endCartesian3]);
        var snapped = turf.nearestPointOnLine(line, point, { units: 'kilometers' });
        let coor = turf.getCoord(snapped);
        return Cesium.Cartesian3.fromDegrees(coor[0], coor[1])
    }
    /**
  * @author: pwz（潘文周） 
  * @description:  求点到线最近的点(点在直线上)
  * @param {cartesian3} cartesian3 某个点
  * @param {cartesian3} startCartesian3 直线的起点
  * @param {cartesian3} endCartesian3 直线终点
  * @return {cartesian3} 返回点在直线上的垂足
  */
    static nearestPointOnLineCartesian33d(cartesian3, startCartesian3, endCartesian3) {
        let midiePoint = TurfHelper.nearestPointOnLineCartesian32d(cartesian3, startCartesian3, endCartesian3);//求得经纬度上的中点
        let l1 = turf.distance(TurfHelper.point(midiePoint), TurfHelper.point(startCartesian3));
        let l2 = turf.distance(TurfHelper.point(startCartesian3), TurfHelper.point(endCartesian3), { units: 'kilometers' })
        let k = l1 / l2;
        let ab = Cesium.Cartesian3.subtract(endCartesian3, startCartesian3, new Cesium.Cartesian3())
        let kab = Cesium.Cartesian3.multiplyByScalar(ab, k, new Cesium.Cartesian3())
        let c = Cesium.Cartesian3.add(kab, startCartesian3, new Cesium.Cartesian3())
        return c;
    }
    /**
     * @author: pwz（潘文周） 
     * @description:  构造闭合多边形,多边形数组的第一个坐标和最后一个坐标不一样，就将第一个坐标添加进数组
     * @param {cartesian3 []} cartesian3Array 世界坐标数组
     * @return {cartesian3 []} 返回闭合的多边形世界坐标数组
     */
    static closePolygeoCartesian3s(cartesian3Array) {
        if (!Cesium.Cartesian3.equals(cartesian3Array[0], cartesian3Array[cartesian3Array.length - 1])) {
            cartesian3Array.push(cartesian3Array[0])
        }
        return cartesian3Array
    }
    /**
     * @author: 张航
     * @description:  判断点是否在多边形内
     * @param {cartesian3} pointCartesian3 点 世界坐标
     * @param {cartesian3 []} polygonCartesian3Array 多边形世界坐标数组
     * @return {boolean} 
     */
    static isPointInPolygon(pointCartesian3, polygonCartesian3Array) {
        let point = this.point(pointCartesian3),
            polygon = this.polygon(polygonCartesian3Array)
        return turf.booleanPointInPolygon(point, polygon)
    }
    /**
        * @author: pwz（潘文周） 
        * @description: 根据多边形划分网格，并返回位于多边形内网格交点
        * @param {cartesian3 []} cartesian3Array
        * @param {Number} interval 间距
        * @return {cartesian3 []} 于多边形内网格交点
        */
    static getGridPointWithinPolygon(cartesian3Array, interval, units = 'meters') {
        let polygon = TurfHelper.polygon(cartesian3Array);
        let extent = TurfHelper.turf.bbox(polygon);
        var intersectPoint = [];
        var squareGrid = TurfHelper.turf.pointGrid(extent, interval, { units });
        squareGrid.features.forEach(item => {
            let coor = TurfHelper.turf.getCoord(item);
            if (TurfHelper.turf.booleanWithin(TurfHelper.turf.point(coor), polygon)) {
                intersectPoint.push(coor)
            }
        })
        return intersectPoint.map(coor => Cesium.Cartesian3.fromDegrees(coor[0], coor[1]))
    }
    /**
  * @author: pwz（潘文周） 
  * @description: 按照固定间距分割线段
  * @param {cartesian3 []} cartesian3Array
  * @param {Number} interval 间距
  * @return {cartesian3 []} 返回线段上的分割点坐标
  */
    static getLineStepPoints(cartesian3Array, interval, units = 'meters') {
        let lineChunkArr = TurfHelper.turf.lineChunk(TurfHelper.lineString(cartesian3Array), interval, { units });
        let stepPoints = lineChunkArr.features.map(feature => {
            let c = TurfHelper.turf.getCoords(feature);
            return Cesium.Cartesian3.fromDegrees(c[0][0], c[0][1])
        })
        return stepPoints
    }
}
//将原生的turf对象绑定到类名
TurfHelper.turf = turf;
export default TurfHelper