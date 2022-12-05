/**
 * Class 广告牌
 */
class Billboard {
    /**
     * 构造函数
     * @param {string} name 广告牌名称
     * @param {cartesian3} position 广告牌坐标
     * @param {string} image 广告牌图片url
     * @param {object} options 广告牌属性对象
     */
    constructor(name, position, image, options) {
        this.name = name;
        this.position = position;
        this.image = image;
        this.options = options;
        this.agBillboard = null;
        this.createEntity();
    }
    /**
     * 创建广告牌对象
     */
    createEntity() {
        var billboard = {
            image: this.image,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        };
        this.agBillboard = new Cesium.Entity({
            name: this.name,
            position: this.position,
            billboard: { ...billboard, ...this.options }
        });
    }
    /**
     * 添加到图层
     * @param {featureLayer} layer featureLayer图层对象
     */
    addToLayer(layer) {
        layer.addEntity(this.agBillboard);
    }
    /**
     * 设置广告牌位置
     * @param {cartesian3} position 笛卡尔坐标
     */
    setPosition(position) {
        this.agBillboard.position = position;
    }
    /**
     * 获取广告牌位置
     * @return {cartesian3} position笛卡尔坐标
     */
    getPosition() {
        return this.agBillboard.position._value;
    }
    /**
     * 改变广告牌图片
     * @param {string} image 图片url
     */
    changeImage(image) {
        this.agBillboard.billboard.image = image;
    }
    /**
     * 释放资源
     */
    dispose() {
        this.name = null;
        this.position = null;
        this.image = null;
        this.options = null;
        this.agBillboard = null;
    }
}
export default Billboard;