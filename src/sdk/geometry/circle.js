/**
 * Class 圆
 */
class Circle {
    /**
     * 构造函数
     * @param {string} name 圆名称
     * @param {cartesian3} position 圆心坐标
     * @param {number} radius 半径
     * @param {object} options 圆属性对象
     */
    constructor(name, position, radius, options) {
        this.name = name;
        this.position = position;
        this.radius = radius;
        this.options = options;
        this.agCircle = null;
        this.createEntity(radius);
    }
    /**
     * 创建圆对象
     * @param {number} radius 半径
     */
    createEntity(radius) {
        var ellipse = {
            material: Cesium.Color.RED.withAlpha(0.4),
            semiMinorAxis: radius,
            semiMajorAxis: radius,
        };

        this.agCircle = new Cesium.Entity({
            name: this.name,
            position: this.position,
            ellipse: { ...ellipse, ...this.options }
        });
    }
    /**
     * 添加到图层
     * @param {featureLayer} layer featureLayer图层对象
     */
    addToLayer(layer) {
        layer.addEntity(this.agCircle);
    }
    /**
     * 设置圆位置
     * @param {cartesian3} position 笛卡尔坐标
     */
    setPosition(position) {
        this.agCircle.position = position;
    }
    /**
     * 获取圆位置
     * @return {cartesian3} position笛卡尔坐标
     */
    getPosition() {
        return this.agCircle.position._value;
    }
    /**
     * 改变圆的半径
     * @param {number} radius 半径
     */
    changeRadius(radius) {
        this.agCircle.ellipse.semiMinorAxis = radius;
        this.agCircle.ellipse.semiMajorAxis = radius;
    }
    /**
     * 释放资源
     */
    dispose() {
        this.name = null;
        this.position = null;
        this.radius = null;
        this.options = null;
        this.agCircle = null;
    }
}
export default Circle;