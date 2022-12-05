/**
 * Class 线
 */
class Polyline {
    /**
     * 构造函数
     * @param {string} name polyline名称
     * @param {array} positions polyline笛卡尔坐标数组
     * @param {object} options polyline属性对象
     */
    constructor(name, positions, options) {
        this.name = name;
        this.positions = positions;
        this.options = options;
        this.agPolyline = null;
        this.createEntity(positions);
    }
    /**
     * 创建polyline
     * @param {array} positions polyline笛卡尔坐标数组
     */
    createEntity(positions) {
        var posArr;
        if (positions instanceof Array) {
            posArr = new Cesium.CallbackProperty(function () {
                return positions;
            }, false);
        } else {
            posArr = positions;
        }

        var polyline = {
            positions: posArr,
            material: Cesium.Color.GREEN,
            width: 2,
        };

        this.agPolyline = new Cesium.Entity({
            name: this.name,
            polyline: { ...polyline, ...this.options },
        });
    }
    /**
     * 添加到图层
     * @param {featureLayer} layer featureLayer图层对象
     */
    addToLayer(layer) {
        layer.addEntity(this.agPolyline);
    }
    /**
     * 设置polyline位置
     * @param {array} positions polyline笛卡尔坐标数组
     */
    setPosition(positions) {
        this.positions = positions;
        this.agPolyline.polyline.positions = positions;
    }
    /**
     * 获取polyline位置
     * @return {array} positions polyline笛卡尔坐标数组
     */
    getPosition() {
        return this.positions;
    }
    /**
     * 改变polyline材质
     * 可用来改变polyline颜色，设置为流动线等
     * @param {material} material polyline材质
     */
    changeMaterial(material) {
        this.agPolyline.polyline.material = material;
    }
    /**
     * 释放资源
     */
    dispose() {
        this.name = null;
        this.positions = null;
        this.options = null;
        this.agPolyline = null;
    }
}
export default Polyline;