/**
 * Class 多边形
 */
class Polygon {
  /**
   * 构造函数
   * @param {string} name polygon名称
   * @param {array} positions polygon笛卡尔坐标点数组
   * @param {object} options polygon属性对象
   */
  constructor(name, positions, options) {
    this.name = name;
    this.positions = positions;
    this.options = options;
    this.agPolygon = null;
    this.createEntity(positions);
  }
  /**
   * 创建polygon
   * @param {array} positions polygon笛卡尔坐标点数组
   */
  createEntity(positions) {
    var posArr;
    if (positions instanceof Array) {
      posArr = new Cesium.CallbackProperty(function () {
        return { positions };
      }, false);
    } else {
      posArr = positions;
    }

    var polygon = {
      hierarchy: posArr,
      material: Cesium.Color.RED.withAlpha(0.4),
      outline: true,
      outlineWidth: 10,
      fill: true,
      outlineColor: Cesium.Color.RED,
    };

    this.agPolygon = new Cesium.Entity({
      name: this.name,
      polygon: { ...polygon, ...this.options },
    });
  }
  /**
   * 添加到图层
   * @param {featureLayer} layer featureLayer图层对象
   */
  addToLayer(layer) {
    layer.addEntity(this.agPolygon);
  }
  /**
   * 设置polygon位置
   * @param {array} positions polygon笛卡尔坐标点数组
   */
  setPosition(positions) {
    this.positions = positions;
    this.agPolygon.polygon.hierarchy = positions;
  }
  /**
   * 获取polygon位置
   * @return {array} positions polygon笛卡尔坐标点数组
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
    this.agPolygon = null;
  }
}

export default Polygon;