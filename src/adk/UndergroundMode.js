/**
 * @author: 
 * @description: 地下模式
 */
import AgCamera from '@/sdk/camera/camera.js'
import coordinate from "@/sdk/maths/coordinate.js"
import AgScene from "@/sdk/scene/scene.js"
export default class {
    #agScene
    #oldCameraPosition
    #viewer
    constructor(viewer) {
        this.#viewer = viewer
        this.#agScene = new AgScene(viewer)
        this.alpha = 0.3;
    }
    /**
     * @author: 
     * @description: 开启地下模式
     * @return {*}
     */
    enable() {
        CIM.viewer.scene.globe.translucency.enabled = true;
        CIM.viewer.scene.globe.translucency.frontFaceAlpha = this.alpha;
    }
    /**
     * @author: 
     * @description: 关闭地下模式
     * @return {*}
     */
    cancel() {
        CIM.viewer.scene.globe.translucency.enabled = false;
        // CIM.viewer.scene.globe.translucency.frontFaceAlphaByDistance = 1;
    }
    /**
     * 打开渐隐模式
     */
    openTranslucencyControl() {
        CIM.viewer.scene.globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(
            400.0,
            0.0,
            800.0,
            1.0
        );
    }
    /**
     * 关闭渐隐模式
     */
    closeTranslucencyControl() {
        CIM.viewer.scene.globe.translucency.frontFaceAlphaByDistance = undefined;
    }
    /**
     * @author: 
     * @description: 设置底图透明度
     * @param {*} alpha
     * @return {*}
     */
    setMapAlpha(alpha) {
        CIM.viewer.scene.globe.translucency.frontFaceAlpha = alpha;
    }
}