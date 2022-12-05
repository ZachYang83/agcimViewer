/**
 * Class 文字标注
 */
class Label {
  /**
   * 构造函数
   * @param {string} name label名称
   * @param {cartesian3} position label位置
   * @param {string} text label内容
   * @param {object} options label属性对象
   */
  constructor(name, position, text, options) {
    this.name = name;
    this.position = position;
    this.text = text;
    this.options = options;
    this.agLabel = null;
    this.createEntity();
  }
  /**
   * 创建label对象
   */
  createEntity() {
    var label = {
      text: this.text,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString("#f99d0d"),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };

    this.agLabel = new Cesium.Entity({
      name: this.name,
      position: this.position,
      label: { ...label, ...this.options },
    });
  }
  /**
   * 添加到图层
   * @param {featureLayer} layer featureLayer图层对象
   */
  addToLayer(layer) {
    layer.addEntity(this.agLabel);
  }
  /**
   * 设置label位置
   * @param {cartesian3} position 笛卡尔坐标
   */
  setPosition(position) {
    this.agLabel.position = position;
  }
  /**
   * 获取label位置
   * @return {cartesian3} position笛卡尔坐标
   */
  getPosition() {
    return this.agLabel.position._value;
  }
  /**
   * 改变label内容
   * @param {string} text 文本内容
   */
  changeText(text) {
    this.agLabel.label.text = text;
  }
  /**
   * 释放资源
   */
  dispose() {
    this.name = null;
    this.position = null;
    this.text = null;
    this.options = null;
    this.agLabel = null;
  }
}
export default Label;
