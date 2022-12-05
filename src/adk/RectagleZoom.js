/*
 * @author: 张瀚
 * @description: 选框放大功能
 */
import PickerHelper from "@/sdk/interactive/pickerHelper";
export default class {
    #viewer
    #pickerHelper
    constructor(viewer) {
        this.#viewer = viewer
        this.#pickerHelper = undefined
        //当前绘制中的图形
        this.rectangleEntity = undefined
    }
    /**
     * @author: 张瀚
     * @description: 开始选框放大，左键单击选取起始点放大，右键重置本次选择，左键双击退出功能
     * @param {Cesium.RectangleGraphics} rectangleOptions （可选）绘制的矩形的参数
     * @param {Function} rectangleOptions.zoomCallback （可选）每次框选缩放后的回调方法
     * @param {Function} rectangleOptions.rightClickCallback （可选）每次右键后的回调方法
     * @param {Function} rectangleOptions.finishCallback （可选）双击完成后的回调方法
     */
    pickAndZoom(rectangleOptions = {}) {
        //覆盖默认配置
        let newOptions = Object.assign({
            material: Cesium.Color.CYAN.withAlpha(0.5),
            //如果高度为0会有很多遮挡问题，为1米效果好看一点
            height: 1,
            //每次框选缩放后的回调
            zoomCallback: () => { },
            //每次右键后的回调
            rightClickCallback: () => { },
            //双击完成后的回调
            finishCallback: () => { }
        }, rectangleOptions)
        //先重置，取消上次功能
        this.cancel()
        this.#pickerHelper = new PickerHelper(this.#viewer)
        //改变鼠标指针样式
        this.#pickerHelper.setCursor("crosshair");
        //起点位置
        let startPoint = undefined
        //动态生成的绘制的矩形的坐标点
        let rectangleCoordinates = []
        newOptions.coordinates = new Cesium.CallbackProperty(() => rectangleCoordinates, false)
        this.#pickerHelper.on("LEFT_CLICK", event => {
            //单击鼠标左键绘制起点
            var cartesian = this.#pickerHelper.getPositionByEllipsoid(event.position);
            if (!cartesian) {
                return
            }
            if (!startPoint) {
                //选中起点
                startPoint = cartesian.clone()
                return
            }
            //起点和终点都选择了
            if (startPoint.equals(cartesian)) {
                //同一个点，不算
                return
            }
            //保持视角不变
            let camera = this.#viewer.camera
            this.#viewer.zoomTo(this.rectangleEntity, new Cesium.HeadingPitchRange(camera.heading, camera.pitch, camera.range)).then(() => {
                //拉近一点，因为原本的viewer的ZoomTo预留空间过大，这里是根据距离视线中心距离大致缩进了一点
                let moveAmount = (camera.getMagnitude() - 6374863) / 5
                if (moveAmount>100) {
                    camera.moveForward(moveAmount)
                }
                this.#viewer.entities.remove(this.rectangleEntity)
                this.rectangleEntity = undefined
                startPoint = undefined
                rectangleCoordinates.length = 0
                //一次框选放大完成了，触发一次回调
                newOptions.zoomCallback()
            })
        }).on("MOUSE_MOVE", event => {
            if (!startPoint) {
                //未选定起点
                return
            }
            let cartesian = this.#pickerHelper.getPositionByEllipsoid(event.endPosition);
            if (!cartesian) {
                return
            }
            //由起点终点计算矩形所需的端点，更新端点位置
            rectangleCoordinates = Cesium.Rectangle.fromCartesianArray([startPoint, cartesian])
            if (!this.rectangleEntity) {
                //创建矩形，坐标会动态更新
                this.rectangleEntity = this.#viewer.entities.add({
                    rectangle: newOptions
                })
            }
        }).on('RIGHT_CLICK', event => {
            //右键单击会重置本次绘制，然后可以继续绘制
            this.#viewer.entities.remove(this.rectangleEntity)
            this.rectangleEntity = undefined
            startPoint = undefined
            rectangleCoordinates.length = 0
            newOptions.rightClickCallback()
        }).on('LEFT_DOUBLE_CLICK', event => {
            //双击退出
            this.cancel()
            newOptions.finishCallback()
        })
    }
    /**
     * @author: 张瀚
     * @description: 取消框选，移除所有绘制的内容和鼠标事件
     */
    cancel() {
        this.#viewer.entities.remove(this.rectangleEntity)
        this.rectangleEntity = undefined
        if (this.#pickerHelper) {
            //改变鼠标指针为默认
            this.#pickerHelper.setCursor("default");
            this.#pickerHelper.off()
            this.#pickerHelper = undefined
        }
    }
}
