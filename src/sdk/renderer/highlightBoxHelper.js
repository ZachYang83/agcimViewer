/**
 * class HighlightBoxHelper 高亮盒子
 */
class HighlightBoxHelper {
    constructor(viewer) {
        this.viewer = viewer;
        this.boxlist = null;
        this.initialize();
    }
    initialize() {
        this.boxlist = [];
    }
    /**
     * 新增高亮盒子
     * @param {Cesium.Cartesian3} center 盒子中心点
     * @param {Cesium.Cartesian3} dimensions 盒子的尺寸 （长宽高）
     * @param {Cesium.HeadingPitchRoll} hpr 盒子的朝向，俯仰角，旋转角，默认(0,0,0)(可选项)
     * @param {Cesium.Color} c 盒子颜色（可选项）
     */
    addBox(center, dimensions, hpr, color) {
        var scene = this.viewer.scene;
        let c = color || Cesium.Color.YELLOW.withAlpha(0.3);
        var boxGeometry = Cesium.BoxGeometry.fromDimensions({
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            dimensions: dimensions,
        });
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        // 改变矩形方向
        var hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(hpr) || Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(0.0, 0.0, 0.0));
        var hrp1 = Cesium.Matrix4.fromRotationTranslation(
            hprRotation,
            new Cesium.Cartesian3(0.0, 0.0, 0.0)
        );
        Cesium.Matrix4.multiply(modelMatrix, hrp1, modelMatrix);
        var primitive = scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: boxGeometry,
                    modelMatrix: modelMatrix,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(c),
                        show: new Cesium.ShowGeometryInstanceAttribute(true),
                    },
                    id: center
                }),
                show: true,
                classificationType: Cesium.ClassificationType.BOTH,
            })
        );
        this.boxlist.push(primitive);
        return primitive;
    }
    /**
     * 显示高亮盒子
     * @param {*} box 
     */
    showBox(box) {
        if (!(box instanceof Cesium.ClassificationPrimitive)) return;
        if (this.boxlist.indexOf(box) === -1) return;
        box.show = true;
    }
    /**
     * 隐藏高亮盒子
     * @param {*} box 
     */
    hideBox(box) {
        if (!(box instanceof Cesium.ClassificationPrimitive)) return;
        if (this.boxlist.indexOf(box) === -1) return;
        box.show = false;
    }
    /**
     * 获取已创建的高亮盒子列表
     */
    getBoxlist() {
        return this.boxlist;
    }
    /**
     * 移除单个高亮盒子
     * @param {*} box 
     */
    removeBox(box) {
        if (!(box instanceof Cesium.ClassificationPrimitive)) return;
        if (this.boxlist.indexOf(box) === -1) return;
        this.boxlist.splice(this.boxlist.indexOf(box), 1);
        let succuss = this.viewer.scene.primitives.remove(box);
        return succuss;
    }
    /**
     * 移除所有高亮盒子
     * @param {*} box 
     */
    removeAllBoxes() {
        for (let i = 0; i < this.boxlist.length; i++) {
            let box = this.boxlist[i];
            this.viewer.scene.primitives.remove(box);
        }
        this.boxlist = [];
    }
}

export default HighlightBoxHelper;