
/*
 * @author: pwz（潘文周）
 * @description: 用于二维的空间计算
 */
import * as turf from '@turf/turf'
import coordinate from "@/sdk/maths/coordinate.js"
import { point } from '@turf/turf';
class TurfHelper {
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 获取面积,只能用于二维
     * @param {*} 
     * @return {*}
     */
    static getArea(features) {
        return turf.area(features);
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 获取中点，二维坐标转三维坐标
     * @param {*} features 传入geoJson对象
     * @return {*} 返回经纬度，世界坐标， geoJson点对象
     */
    static getCenter(features) {
        let center = turf.center(features);
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
     * @description: 方法描述 提取geoJson对象里的坐标数组
     * @param {*}
     * @return {*}
     */
    static getCoords(features) {
        return turf.getCoords(features);
    }
    /**
     * @author: pwz（潘文周）  
     * @description: 方法描述 提取geoJson对象里的坐标数组转成世界坐标数组,二维坐标转三维坐标
     * @param {*}
     * @return {*}
     */
    static getCoordsCartesian3(features) {
        let coors = TurfHelper.getCoords(features);
        return coors.map(coor => {
            return coor.map(item => {
                return coordinate.WGS84ArraysToCartesian3(item);
            })
        })
    }
    /**
   * @author: pwz（潘文周） 
   * @description: 方法描述 转换特定格式的坐标串,三维坐标转二维坐标
   * @param {Cartesian3 []} cartesian3Array 世界坐标数组
   * @return {*} 返回格式例如 [[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]
   */
    static transformCoordsArray(cartesian3Array) {
        let cartographics = coordinate.cartesian3ToCartographicMany(cartesian3Array, "Degrees")
        return cartographics.map(item => {
            return [item.lng, item.lat]
        })
    }
    static intersect(points1, points2) {
        return turf.intersect(
            turf.polygon(points1),
            turf.polygon(points2)
        );
    }

}
export default TurfHelper