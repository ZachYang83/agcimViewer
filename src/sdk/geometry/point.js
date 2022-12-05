/**
 * Class 点
 */
class Point {
    /**
     * 构造函数
     * @param {string} name point名称
     * @param {cartesian3} position point位置
     * @param {object} options point属性对象
     */
    constructor(name, position, options) {
        this.name = name;
        this.position = position;
        this.options = options;
        this.agPoint = null;
        this.createEntity();
    }
    /**
     * 创建point
     */
    createEntity() {
        var point = {
            pixelSize: 5,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }

        this.agPoint = new Cesium.Entity({
            name: this.name,
            position: this.position,
            point: { ...point, ...this.options },
        });
    }
    /**
     * 添加到图层
     * @param {featureLayer} layer featureLayer图层对象
     */
    addToLayer(layer) {
        layer.addEntity(this.agPoint);
    }
    /**
     * 设置point位置
     * @param {cartesian3} position 笛卡尔坐标
     */
    setPosition(position) {
        this.agPoint.position = position;
    }
    /**
     * 获取point位置
     * @return {cartesian3} position笛卡尔坐标
     */
    getPosition() {
        return this.agPoint.position._value;
    }
    /**
     * 改变point大小
     * @param {number} pixelSize 像素大小
     */
    changeSize(pixelSize) {
        this.agPoint.point.pixelSize = pixelSize;
    };
    /**
     * 释放资源
     */
    dispose() {
        this.name = null;
        this.position = null;
        this.options = null;
        this.agPoint = null;
    }
}
export default Point;