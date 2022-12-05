/**
 * @author: 张瀚
 * @description: 定点环绕
 */
import PickerHelper from "@/sdk/interactive/pickerHelper";

export default class {
    #viewer
    #pickerHelper
    constructor(viewer) {
        this.#viewer = viewer;
        this.#pickerHelper = undefined;
        //当前选中的位置绘制的点
        this.pickPoint = undefined
        //每帧旋转的角度
        this.rotateStepOnTick = 0.5
        //当前环绕的视角
        this.headingPitchRange = undefined
        //每帧渲染时执行的调整环绕角度、camera位置的方法
        this.exection = () => {
            this.headingPitchRange.heading += Cesium.Math.toRadians(this.rotateStepOnTick)
            this.#viewer.zoomTo(this.pickPoint, this.headingPitchRange);
        }
        //缓存的配置
        this._cacheEnableInputs = undefined
    }
    /**
     * @author: 张瀚
     * @description: 左键选取点，移动到屏幕中央，然后开始环绕，右键取消。
     *               //TODO 如果是摄像头贴地情况下有可能会到地下，需要解决
     *               //TODO 考虑增加回调方法，可以把选中的点坐标抛出去，方便外部做处理
     * @param {*} rotateStepOnTick 每一帧旋转的角度,修改的是heading值
     * @return {Promise} 当结束环绕后会触发resolve
     */
    pickAndSurround(rotateStepOnTick = 0.5) {
        this.setRotateStepOnTick(rotateStepOnTick)
        return new Promise((resolve, reject) => {
            this.cancel()
            this.#pickerHelper = new PickerHelper(this.#viewer);
            // 改变指针
            this.#pickerHelper.setCursor("crosshair");
            // 右键退出
            this.#pickerHelper.on("LEFT_CLICK", e => {
                if (this.pickPoint) {
                    return
                }
                // 左键拾取坐标点
                this.surroundByPosition(this.#pickerHelper.getPreciseCartesian(e));
                this.#pickerHelper.setCursor("default");
            }).on('RIGHT_CLICK', event => {
                this.cancel()
                resolve()
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 绕拾取点旋转
     * @param {Cesium.Cartesian3} pickPosition 围绕的点
     */
    surroundByPosition(pickPosition) {
        //绘制一个透明的点，主要用于定位
        this.pickPoint = this.#viewer.entities.add({
            position: pickPosition,
            point: {
                color: Cesium.Color.BLUE.withAlpha(0),
                pixelSize: 1,
            },
        })
        let distance = Cesium.Cartesian3.distance(pickPosition, this.#viewer.camera.positionWC);
        this.headingPitchRange = new Cesium.HeadingPitchRange(this.#viewer.camera.heading, this.#viewer.camera.pitch, distance);
        //-90度时不能旋转，不太明白为什么
        if (this.headingPitchRange.pitch - Cesium.Math.toRadians(-90) < Cesium.Math.toRadians(0.01)) {
            this.headingPitchRange.pitch += Cesium.Math.toRadians(0.01)
        }
        //移动到屏幕中央然后开始旋转
        this.#viewer.zoomTo(this.pickPoint, this.headingPitchRange).then(() => {
            //保存当前的配置，虽然大概率是true，但是还是以防万一吧
            this._cacheEnableInputs = this.#viewer.scene.screenSpaceCameraController.enableInputs
            this.#viewer.scene.screenSpaceCameraController.enableInputs = false;
            //开始旋转
            this.#viewer.clock.onTick.addEventListener(this.exection);
        });
    }
    /**
     * @author: 张瀚
     * @description: 停止环绕，重置配置
     */
    cancel() {
        //移除环绕和监听
        this.#viewer.clock.onTick.removeEventListener(this.exection);
        if (this.#pickerHelper) {
            this.#pickerHelper.setCursor("default");
            this.#pickerHelper.off()
            this.#pickerHelper = undefined
        }
        if(this.pickPoint){
            this.#viewer.entities.remove(this.pickPoint)
            this.pickPoint = undefined
        }
        //还原配置
        if (this._cacheEnableInputs) {
            this.#viewer.scene.screenSpaceCameraController.enableInputs = this._cacheEnableInputs;
            this._cacheEnableInputs = undefined
        }
    }
    /**
     * @author: 张瀚
     * @description: 设置每帧旋转角度
     * @param {*} rotateStepOnTick 每一帧旋转的角度,修改的是heading值
     */
    setRotateStepOnTick(rotateStepOnTick = 0.5) {
        this.rotateStepOnTick = rotateStepOnTick
    }
};