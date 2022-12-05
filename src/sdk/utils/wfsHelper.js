
/*
 * @author: pwz（潘文周）
 * @description:  用于wfs服务接口查询
 */
import axios from "axios"
import coordinate from "@/sdk/maths/coordinate";


class WfsHelper {
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 构造函数
     * @param {*} option.url wfs服务url
     * @param {*} option.typename 图层名称
     * @param {*} option.srsName 坐标系名称
     * @param {*} option.version 版本
     * @return {*}
     */
    constructor(option) {
        this.url = option.url;
        this.typename = option.typename;
        this.srsName = option.srsName || "EPSG:4326";
        this.version = option.version || "1.1.0";
        this.service = "wfs";
        this.geoName = "the_geom";//默认用于空间查询的字段
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 获取元数据
     * @return {*}
     */
    async getCapabilities() {
        return await axios.get(this.url, {
            params: {
                service: this.service,
                version: this.version,
                request: "GetCapabilities",
                outputFormat: "application/json",
            }
        });
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 根据bbox范围查询
     * @param {Object} option 需要传入的限制条件和图层名称
     * @param {Array} option.bbox 查询的范围
     * @return {*} 
     */
    async getFeatureByExtent(option) {
        if (!option.extent) throw new Error("extent is undefined,you should input a extent")
        let bbox = option.extent.join() + "," + this.srsName
        return await axios.get(this.url, {
            params: {
                service: this.service,
                version: this.version,
                request: "GetFeature",
                maxFeatures: option.maxFeatures || 2000,
                outputFormat: option.outputFormat || "application/json",
                bbox,
                typename: this.typename,
            }
        });
    }
    /**
        * @author: pwz（潘文周） 
        * @description: 方法描述 获取wfs服务描述信息
        * @param {String} outputFormat 返回的数据格式
        * @return {*}
        */
    async describeFeatureType(outputFormat) {
        return await axios.get(this.url, {
            params: {
                service: this.service,
                version: this.version,
                request: "DescribeFeatureType",
                outputFormat: outputFormat || "application/json",
                typename: this.typename,
            }
        });

    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 使用cql_filter属性查询
     * @param {*} sql 拼接sql语句，例如查询某个字段值cql_filter=name=’兰州’ ，模糊查询 cql_filter=name+like+%27%25%E5%
     * @return {*}
     */
    async queryProperty(option) {
        let data = await axios.get(this.url, {
            params: {
                service: this.service,
                version: this.version,
                request: "GetFeature",
                outputFormat: option.outputFormat || "application/json",
                typename: this.typename,
                cql_filter: option.sql,
            }
        });
        return data.data;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述
     * @param {*} option.outputFormat 返回数据格式
     * @param {*} option.filter 过滤条件
     * @return {*}
     */
    async queryFeatrue(option) {
        let data = await axios.get(this.url, {
            params: {
                service: this.service,
                version: this.version,
                request: "GetFeature",
                outputFormat: option.outputFormat || "application/json",
                typename: this.typename,
                FILTER: option.filter,
            }
        });
        return data.data;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 根据点做相交查询
     * @param {Object} option 需要传入的限制条件和图层名称
     * @param {Cartesian3 } option.geometry 传入坐标点
     * @param {String} option.geoName 标识geometry的属性字段
     * @return {*}
     */
    intersectsPoint(option) {
        let geometry = option.geometry;
        if (!geometry) return;
        option.geoName = option.geoName ? option.geoName : this.geoName
        option.filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">' +
            '<Intersects><PropertyName>' +
            option.geoName +
            '</PropertyName><gml:Point srsName="' + this.srsName + '">' +
            '<gml:coordinates>' + coordinate.cartesian3sToWfsWGS84Stsring([geometry]) + '</gml:coordinates>' +
            '</gml:Point></Intersects></Filter>';
        return this.queryFeatrue(option);
    }

    /**
    * @author: pwz（潘文周） 
    * @description: 方法描述 根据线做相交查询
    * @param {Object} option 需要传入的限制条件和图层名称
    * @param {Cartesian3 []} option.geometry 传入坐标点数组
    * @param {String} option.geoName 标识geometry的属性字段
    * @return {*}
    */
    intersectsLine(option) {
        if (!option.geometry && option.geometry.length < 2) return;
        option.geoName = option.geoName ? option.geoName : this.geoName
        option.filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml"><Intersects>' +
            '<PropertyName>' + option.geoName + '</PropertyName>' +
            '<gml:LineString srsName="' + this.srsName + '">' +
            '<gml:coordinates>' + coordinate.cartesian3sToWfsWGS84Stsring(option.geometry) + '</gml:coordinates> ' +
            '</gml:LineString></Intersects></Filter>';;
        return this.queryFeatrue(option);
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 多边形相交查询
     * @param {Object} option 需要传入的限制条件和图层名称
     * @param {Cartesian3 []} option.geometry 传入坐标数组
     * @param {Cartesian3 []} option.geoName 标识geometry的属性字段
     * @return {*}
     */
    intersectsPolygon(option) {
        if (!option.geometry && option.geometry.length < 2) return;
        //不能使用模板字符串，因为查询条件里不能包含空格
        option.geoName = option.geoName ? option.geoName : this.geoName
        option.filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml"><Intersects>' +
            '<PropertyName>' + option.geoName + '</PropertyName><gml:Polygon srsName="' + this.srsName + '"><gml:exterior>' +
            '<gml:LinearRing  srsName="' + this.srsName + '"><gml:coordinates>' + WfsHelper.wfsQueryPolygon(option.geometry) + '</gml:coordinates></gml:LinearRing>' +
            '</gml:exterior></gml:Polygon></Intersects></Filter>';
        return this.queryFeatrue(option);
    }
    /**
  * @author: pwz（潘文周） 
  * @description: 方法描述 根据范围求出包含的数据
  * @param {Object} option 需要传入的限制条件和图层名称
  * @param {Cartesian3 []} option.geometry 传入坐标数组
  * @param {Cartesian3 []} option.geoName 标识geometry的属性字段
  * @return {*}
  */
    containsPolygon(option) {
        if (!option.geometry && option.geometry.length < 2) return;
        //不能使用模板字符串，因为查询条件里不能包含空格
        option.geoName = option.geoName ? option.geoName : this.geoName
        option.filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml"><Within>' +
            '<PropertyName>' + option.geoName + '</PropertyName><gml:Polygon srsName="' + this.srsName + '"><gml:exterior>' +
            '<gml:LinearRing  srsName="' + this.srsName + '"><gml:coordinates>' + WfsHelper.wfsQueryPolygon(option.geometry) + '</gml:coordinates></gml:LinearRing>' +
            '</gml:exterior></gml:Polygon></Within></Filter>';
        return this.queryFeatrue(option);
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 构造用于wfs服务查询的多边形
     * @param {Cartesian3 []} points 笛卡尔数组
     * @return {*}
     */
    static wfsQueryPolygon(points) {
        if (points[0].x != points[points.length - 1].x && points[0].y != points[points.length - 1].y) {
            points.push(points[0])
        }
        return coordinate.cartesian3sToWfsWGS84Stsring(points)
    }
}
export default WfsHelper