/**
 * @lastUpdateBy : 张瀚
 * @description: 定点观察
 */
import AgCamera from '@/sdk/camera/camera.js'
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import agMath from "@/sdk/maths/math";
import coordinate from "@/sdk/maths/coordinate.js"
import FirstOfView from '@/adk/FirstOfView'

const targeterPointOption_default = {
    color: Cesium.Color.WHITE.withAlpha(0.7),
    pixelSize: 10,
    outlineColor: Cesium.Color.BLACK.withAlpha(0.7),
    outlineWidth: 2,
}
const targeterLabelOption_default = {
    text: '景点',
    font: 16 + "px sans-serif",
    showBackground: true,
    backgroundColor: Cesium.Color.GOLD.withAlpha(0.7),
    fillColor: Cesium.Color.BLACK.withAlpha(0.9),
    outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
    pixelOffset: new Cesium.Cartesian2(0, -25),
    outlineWidth: 1,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE
}
const watcherPointOption_default = {
    color: Cesium.Color.WHITE.withAlpha(0.7),
    pixelSize: 10,
    outlineColor: Cesium.Color.BLACK.withAlpha(0.7),
    outlineWidth: 2,
}
const watcherLabelOption_default = {
    text: '观察点',
    font: 16 + "px sans-serif",
    showBackground: true,
    backgroundColor: Cesium.Color.CADETBLUE.withAlpha(0.7),
    fillColor: Cesium.Color.BLACK.withAlpha(0.9),
    outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
    pixelOffset: new Cesium.Cartesian2(0, -25),
    outlineWidth: 1,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE
}

export default class {
    #viewer
    #agFeatureLayer
    #picker
    constructor(viewer) {
        this.#viewer = viewer;
        this.#agFeatureLayer = new AgFeatureLayer(viewer)
        this.watcherPoint = undefined
        this.targeterPoint = undefined
        this.watcherPointHeight = undefined
        this.firstOfView = new FirstOfView(viewer)
        this.isWatcher = undefined
    }
    /**
     * @author: 张瀚
     * @description: 选取景点和观察点，双击确认
     * @param {Number} options.watcherHeight：观察者视线高度
     * @param {Cesium.PointGraphics} options.targeterPointOption：景点的标点的样式
     * @param {Cesium.LabelGraphics} options.targeterLabelOption：景点的文字提示的样式
     * @param {Cesium.PointGraphics} options.watcherPointOption：观察点的标点的样式
     * @param {Cesium.LabelGraphics} options.watcherLabelOption：观察点的文字提示的样式
     * @return {Promise} 异步回调只有成功的，不会有失败的
     */
    startPickPoint(options = {}) {
        let newOptions = Object.assign({
            watcherHeight: 1.7,
            targeterPointOption: targeterPointOption_default,
            targeterLabelOption: targeterLabelOption_default,
            watcherPointOption: watcherPointOption_default,
            watcherLabelOption: watcherLabelOption_default,
        }, options)
        return new Promise((resolve) => {
            this.cancel()
            this.#picker = new AgPickerHelper(this.#viewer);
            //取消默认双击事件
            this.#viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            //先选景点，再选观察点，双击确认
            let tempLabel, tempPoint, nowPosition;
            this.#picker.on('LEFT_CLICK', event => {
                if (!this.targeterPoint) {
                    nowPosition = this.#viewer.scene.pickPosition(event.position);
                    //设置景点
                    let targetPosition = nowPosition.clone()
                    this.targeterPoint = this.#agFeatureLayer.addEntity({
                        position: new Cesium.CallbackProperty(() => {
                            if (this.isWatcher == false) {
                                //跟着当前视角走
                                targetPosition = this.#viewer.camera.positionWC.clone()
                            }
                            return targetPosition
                        }, false),
                        point: newOptions.targeterPointOption
                    });
                    this.#agFeatureLayer.addEntity({
                        position: new Cesium.CallbackProperty(() => targetPosition, false),
                        label: newOptions.targeterLabelOption
                    });
                    //调整样式为观察点
                    this.#agFeatureLayer.removeEntity(tempLabel);
                    this.#agFeatureLayer.removeEntity(tempPoint);
                    tempLabel = this.#agFeatureLayer.addEntity({
                        position: new Cesium.CallbackProperty(() => nowPosition, false),
                        label: newOptions.watcherLabelOption
                    });
                    tempPoint = this.#agFeatureLayer.addEntity({
                        position: new Cesium.CallbackProperty(() => nowPosition, false),
                        point: newOptions.watcherPointOption
                    });
                }
            }).on('MOUSE_MOVE', event_1 => {
                nowPosition = this.#viewer.scene.pickPosition(event_1.endPosition);
                if (this.targeterPoint && nowPosition) {
                    //观察者有高度
                    nowPosition = coordinate.changePointAddHeight(nowPosition, newOptions.watcherHeight)
                }
                if (!tempLabel) {
                    //创建提示
                    tempLabel = this.#agFeatureLayer.addEntity({
                        position: new Cesium.CallbackProperty(() => nowPosition, false),
                        label: newOptions.targeterLabelOption
                    });
                }
                if (!tempPoint) {
                    tempPoint = this.#agFeatureLayer.addEntity({
                        position: new Cesium.CallbackProperty(() => nowPosition, false),
                        point: newOptions.targeterPointOption
                    });
                }
            }).on('LEFT_DOUBLE_CLICK', event_2 => {
                //设置观察点
                nowPosition = this.#viewer.scene.pickPosition(event_2.position);
                nowPosition = coordinate.changePointAddHeight(nowPosition, newOptions.watcherHeight)
                let watcherPosition = nowPosition.clone()
                this.watcherPoint = this.#agFeatureLayer.addEntity({
                    position: new Cesium.CallbackProperty(() => {
                        if (this.isWatcher == true) {
                            //跟着当前视角走
                            watcherPosition = this.#viewer.camera.positionWC.clone()
                        }
                        return watcherPosition
                    }, false),
                    point: newOptions.watcherPointOption
                });
                this.#agFeatureLayer.addEntity({
                    position: new Cesium.CallbackProperty(() => watcherPosition, false),
                    label: newOptions.watcherLabelOption
                });
                //完成选点
                this.#agFeatureLayer.removeEntity(tempLabel);
                this.#agFeatureLayer.removeEntity(tempPoint);
                this.#picker.off();
                this.#picker = undefined;
                //记录观察点的高度
                let lp = this.#viewer.scene.globe.ellipsoid.cartesianToCartographic(nowPosition)
                this.watcherPointHeight = lp.height
                resolve();
            }).on('RIGHT_CLICK', event_3 => {
                this.#agFeatureLayer.removeAll();
                tempLabel = undefined;
                tempPoint = undefined;
                this.targeterPoint = undefined;
                this.watcherPoint = undefined;
            })
        })
    }
    /**
     * @author: 张瀚
     * @description: 退出并且清除全部对象
     */
    cancel() {
        this.firstOfView.disable()
        if (this.#picker) {
            this.#picker.off()
            this.#picker = undefined
        }
        this.#agFeatureLayer.removeAll()
        this.targeterPoint = undefined
        this.watcherPoint = undefined
        this.isWatcher = undefined
    }
    /**
     * @author: 张瀚
     * @description: 切换到观察点视角，此时只能键盘操作，鼠标不能操作
     * @param {*}
     * @return {*}
     */
    flyToWatcher() {
        if (!this.watcherPoint || !this.targeterPoint) {
            return
        }
        this.isWatcher = undefined
        let point = this.getCameraJsonFromTwoPoint(this.watcherPoint.position.getValue(), this.targeterPoint.position.getValue())
        point.complete = () => { this.isWatcher = true }
        this.#viewer.camera.flyTo(point)
        this.firstOfView.enable()
    }
    flyToTargeter() {
        if (!this.watcherPoint || !this.targeterPoint) {
            return
        }
        this.isWatcher = undefined
        let point = this.getCameraJsonFromTwoPoint(this.targeterPoint.position.getValue(), this.watcherPoint.position.getValue())
        point.complete = () => { this.isWatcher = false }
        this.#viewer.camera.flyTo(point)
        this.firstOfView.enable()
    }
    getCameraJsonFromTwoPoint(fromPoint, toPoint) {
        var heading = agMath.getHeading(fromPoint, toPoint);
        var pitch = agMath.getPitch(fromPoint, toPoint);
        return {
            destination: fromPoint,
            orientation: {
                heading: heading,
                pitch: pitch,
                roll: 0.0,
            }
        }
    }
    /**
     * @author: 张瀚
     * @description: 设置步长
     * @param {*} moveStep 步长（米）
     */
    setMoveStep(moveStep = 1) {
        this.firstOfView.setMoveStep(moveStep)
    }
}