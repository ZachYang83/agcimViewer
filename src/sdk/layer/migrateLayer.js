import agMath from "../maths/math";
import axiosWraper from "@/views/js/net/axiosWraper";
import FeatureLayer from "./featureLayer"

/**
 * Class MigrateLayer 迁徙图层  待开发，不可用
 */
class MigrateLayer extends FeatureLayer {
    constructor() {
        super(CIM.viewer);
    }

    /**
     * let gzCentrePnt = [113.54, 23.33]
     * @param {*} origin 
     * @param {*} distinations 
     * @private
     */
    addRows(viewer, origin, distinations) {
        let arcs = []
        distinations.forEach(city => {
            let cityPnt = [Number(city.Longitude), Number(city.Latitude)]
            let arc = agMath._get3DArc(origin, cityPnt, 12000, 10)
            arcs.push(arc)
        })
        for (let arc of arcs) {
            var glowingLine = viewer.entities.add({
                name: 'migrateEntitie',
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArrayHeights(arc),
                    width: 10,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.5,
                        taperPower: 0.5,
                        color: Cesium.Color.AQUAMARINE
                    })
                }
            });
            this._entities.push(glowingLine);
        }
    }

   
    /**
     * 添加一条数据
     * @param {*} viewer 
     * @param {*} origin 
     * @param {*} distination 
     * @param {*} option 
     * @private
     */
    addRow(viewer, origin, distination, option) {
        option = option || {};
        option.name = option.name || 'migrateEntitie';

        let arc = agMath._get3DArc(origin, distination, 12000, 10);
        var glowingLine = viewer.entities.add({
            name: option.name,
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(arc),
                width: 10,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.5,
                    taperPower: 0.5,
                    color: Cesium.Color.AQUAMARINE
                })
            }
        });
        this._entities.push(glowingLine);
    }
    /**
     * 示例数据添加
     * @param {*} viewer 
     * @private
     */
    addSample(viewer) {
        let gdOtherCityPntsList = [
            { "id": 2, "adcode": 440200, "name": "韶关市", "Longitude": 113.779512488613, "Latitude": 24.8175910895776 },
            { "id": 3, "adcode": 440300, "name": "深圳市", "Longitude": 114.142018714885, "Latitude": 22.6425973654546 },
            { "id": 5, "adcode": 440500, "name": "汕头市", "Longitude": 116.59889059498, "Latitude": 23.3273745829977 },
            { "id": 4, "adcode": 440400, "name": "珠海市", "Longitude": 113.362649674132, "Latitude": 22.1503689182871 },
            { "id": 17, "adcode": 441900, "name": "东莞市", "Longitude": 113.880312178205, "Latitude": 22.9315871327682 },
            { "id": 6, "adcode": 440600, "name": "佛山市", "Longitude": 112.949963979305, "Latitude": 23.0039840755167 },
            { "id": 18, "adcode": 442000, "name": "中山市", "Longitude": 113.398855145883, "Latitude": 22.5170824033121 },
            { "id": 7, "adcode": 440700, "name": "江门市", "Longitude": 112.677820279547, "Latitude": 22.26519147317 },
            { "id": 8, "adcode": 440800, "name": "湛江市", "Longitude": 110.169057636115, "Latitude": 21.0729381182318 },
            { "id": 9, "adcode": 440900, "name": "茂名市", "Longitude": 110.958424569426, "Latitude": 22.0074705109458 },
            { "id": 10, "adcode": 441200, "name": "肇庆市", "Longitude": 112.210447082222, "Latitude": 23.5350843479851 },
            { "id": 11, "adcode": 441300, "name": "惠州市", "Longitude": 114.507638994895, "Latitude": 23.2327307831745 },
            { "id": 12, "adcode": 441400, "name": "梅州市", "Longitude": 116.084149039087, "Latitude": 24.2005510772629 },
            { "id": 13, "adcode": 441500, "name": "汕尾市", "Longitude": 115.537808294811, "Latitude": 23.0041041656374 },
            { "id": 14, "adcode": 441600, "name": "河源市", "Longitude": 114.962782855367, "Latitude": 24.0418894648769 },
            { "id": 15, "adcode": 441700, "name": "阳江市", "Longitude": 111.779577228436, "Latitude": 22.0252818306084 },
            { "id": 16, "adcode": 441800, "name": "清远市", "Longitude": 112.880237377036, "Latitude": 24.3114870121995 },
            { "id": 20, "adcode": 445100, "name": "潮州市", "Longitude": 116.790306303385, "Latitude": 23.7828861192292 },
            { "id": 21, "adcode": 445200, "name": "揭阳市", "Longitude": 116.124307245222, "Latitude": 23.3337134940774 },
            { "id": 22, "adcode": 445300, "name": "云浮市", "Longitude": 111.798897816936, "Latitude": 22.8133287792784 }]
        this.addRows(viewer, [113.54, 23.33], gdOtherCityPntsList)
    }
    /**
     * 从服务器获得数据
     */
    /**
     * 从服务器获得数据
     * @param {*} viewer 
     * @param {*} url 
     * @private
     */
    loadFrom(viewer, url) {
        url = `/MongoDBTable/getAll/epidemic_d_migration`;
        let self = this;
        axiosWraper.getData(url).then(function (data) {
            //self.loadFromData(viewer, data);
        })
    }
};

export default new MigrateLayer();