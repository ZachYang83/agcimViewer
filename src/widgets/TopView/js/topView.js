/*
 * @author: pwz（潘文周）
 * @description: 文件描述
 */
/*
 * @author: pwz（潘文周）
 * @description: 顶视图
 */

import camera from "../../../sdk/camera/camera"
import coordinate from "@/sdk/maths/coordinate.js"
import math from "@/sdk/maths/math"
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'


class TopView {
    constructor(viewer) {
        this.viewer = viewer;
        this.tempEnableTilt = true
        this.pickerHelper = undefined
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 将相机放在在当前屏幕中心点上方，向下看，锁定视角，直到退出或者双击
     */
    topView() {
        if (this.pickerHelper) {
            this.close()
        }
        return new Promise((resolve, reject) => {
            this.tempEnableTilt = this.viewer.scene.screenSpaceCameraController.enableTilt
            if (this.viewer.camera.pitch - Cesium.Math.toRadians(-90) < 0.000001) {
                //当前是俯视状态了，不需要再改视角
                this.viewer.scene.screenSpaceCameraController.enableTilt = false
                this.pickerHelper = new AgPickerHelper(this.viewer)
                this.pickerHelper.on('LEFT_DOUBLE_CLICK', event => {
                    this.close()
                    //已经退出了视角
                    resolve()
                })
                return
            }
            let center = camera.getCenterPosition(this.viewer);
                let centerPoint = Cesium.Cartesian3.fromDegrees(center.lon, center.lat, center.height);
                let distance = math.getDistance(centerPoint, this.viewer.camera.position);
                let centerPointAddHeight = coordinate.changePointHeight(centerPoint, distance);
                var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(centerPointAddHeight, centerPoint, new Cesium.Cartesian3()), new Cesium.Cartesian3());
                this.viewer.camera.flyTo({
                    destination: centerPointAddHeight,
                    orientation: direction,
                    complete: () => {
                        //锁定视角
                        this.viewer.scene.screenSpaceCameraController.enableTilt = false
                        this.pickerHelper = new AgPickerHelper(this.viewer)
                        this.pickerHelper.on('LEFT_DOUBLE_CLICK', event => {
                            this.close()
                            //已经退出了视角
                            resolve()
                        })
                    }
                });
        })
    }
    close() {
        this.viewer.scene.screenSpaceCameraController.enableTilt = this.tempEnableTilt
        if (this.pickerHelper) {
            this.pickerHelper.off()
            this.pickerHelper = undefined
        }
    }
}
export default TopView;