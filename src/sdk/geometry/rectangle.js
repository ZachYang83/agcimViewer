/**
 * Class 矩形
 */
class Rectangle {
    /**
     * 构造函数
     * @param {string} name rectangle名称
     * @param {array} positions rectangle对角坐标数组{p1,p2}
     * @param {object} options rectangle属性对象
     */
    constructor(name, positions, options) {
        this.name = name;
        this.positions = positions;
        this.options = options;
        this.agRectangle = null;
        this.createEntity(positions);
    }
    /**
     * 创建rectangle
     * @param {array} positions rectangle对角坐标数组{p1,p2}
     */
    createEntity(positions) {
        var posArr;
        if (positions instanceof Array) {
            posArr = new Cesium.CallbackProperty(function () {
                var rectangle = Cesium.Rectangle.fromCartesianArray(positions);
                return rectangle;
            }, false);
        } else {
            posArr = positions;
        }

        var rectangle = {
            coordinates: posArr,
            material: Cesium.Color.RED.withAlpha(0.4),
            outline: true,
            outlineWidth: 10,
            fill: true,
            outlineColor: Cesium.Color.fromCssColorString('#f99d0d'),
        };

        this.agRectangle = new Cesium.Entity({
            name: this.name,
            rectangle: { ...rectangle, ...this.options },
        });
    }
    /**
     * 添加到图层
     * @param {featureLayer} layer featureLayer图层对象
     */
    addToLayer(layer) {
        layer.addEntity(this.agRectangle);
    }
    /**
     * 设置rectangle位置
     * @param {array} positions rectangle对角坐标数组{p1,p2}
     */
    setPosition(positions) {
        this.positions = positions;
        this.agRectangle.rectangle.coordinates = Cesium.Rectangle.fromCartesianArray(positions);
    }
    /**
     * 获取rectangle位置
     * @return {array} positions rectangle对角坐标数组{p1,p2}
     */
    getPosition() {
        return this.positions;
    }
    /**
     * 释放资源
     */
    dispose() {
        this.name = null;
        this.positions = null;
        this.options = null;
        this.agRectangle = null;
    }
}
export default Rectangle;