/*
 * @author: 张瀚
 * @description: 第一人称视角操作
 */
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'
import coordinate from "@/sdk/maths/coordinate";
export default class {
    #viewer
    #myReq
    #isEnable
    constructor(viewer) {
        this.#viewer = viewer
        this.pickerHelper = undefined
        this.flag = {
            heading: 0,
            pitch: 0,
            w: 0,
            a: 0,
            s: 0,
            d: 0,
            up: 0,
            down: 0,
            vUp: 0,
            vDown: 0,
            vLeft: 0,
            vRight: 0,
        }
        //是否正在启用中
        this.#isEnable = false
        this.cacheScreenSpaceCameraController = {
            enableRotate: viewer.scene.screenSpaceCameraController.enableRotate,
            enableTranslate: viewer.scene.screenSpaceCameraController.enableTranslate,
            enableZoom: viewer.scene.screenSpaceCameraController.enableZoom,
            enableTilt: viewer.scene.screenSpaceCameraController.enableTilt,
            enableLook: viewer.scene.screenSpaceCameraController.enableLook
        }
        this.maxPitch = Cesium.Math.toRadians(90)
        this.minPitch = Cesium.Math.toRadians(-90)
        this.maxMultiple = 5
        //视角每帧转动的角度
        this.visionStep = 0.1
        //视角每帧移动速度
        this.moveStep = 1
        //缓存用于删除
        this.keyControlFunction = this.keyControl.bind(this)
        //视角最低距离地面高度
        this.minVisionHeight = 0.5
    }
    /**
     * @lastUpdateBy : 张瀚
     * @description: 启用第一人称视角,鼠标右键按下拖动镜头，随着鼠标拖动距离越大，速度越来越快。
     * @param {*} keyControl 是否启用键盘操控，默认启用
     */
    enable(keyControl = true) {
        if (this.#isEnable) {
            //已经在启用中了
            return
        }
        this.#isEnable = true
        //禁用默认操作
        this.disableMouse()
        //开始刷新
        this.updateCamera()
        this.pickerHelper = new AgPickerHelper(this.#viewer)
        let startPosition, nowPosition
        this.pickerHelper.on('RIGHT_DOWN', event => {
            //鼠标右键按下
            startPosition = event.position.clone()
        }).on('RIGHT_UP', event => {
            //鼠标右键抬起
            this.flag.heading = 0
            this.flag.pitch = 0
            startPosition = undefined
        }).on('MOUSE_MOVE', event => {
            //右键按下时鼠标移动，视角移动
            if (!startPosition) {
                return
            }
            nowPosition = event.endPosition
            let dx = nowPosition.x - startPosition.x
            let dy = nowPosition.y - startPosition.y
            //鼠标拖动幅度越大越快,100以内不动
            let xp = Math.floor(Math.abs(dx) / 100)
            xp = Math.min(xp, this.maxMultiple)
            let yp = Math.floor(Math.abs(dy) / 100)
            yp = Math.min(yp, this.maxMultiple)
            //计算视角移动
            this.flag.heading = Cesium.Math.toRadians(dx > 0 ? this.visionStep : -this.visionStep) * xp
            this.flag.pitch = Cesium.Math.toRadians(dy > 0 ? -this.visionStep : this.visionStep) * yp
        })
        if (keyControl) {
            this.enableKeyControl()
        }
    }
    /**
     * @author: 张瀚
     * @description: 退出第一视角，恢复进入前状态
     * @param {*}
     * @return {*}
     */
    disable() {
        this.#isEnable = false
        cancelAnimationFrame(this.#myReq)
        //恢复默认操作
        this.restoreMouse()
        if (this.pickerHelper) {
            this.pickerHelper.off()
            this.pickerHelper = undefined
        }
        this.disableKeyControl()
    }
    /**
     * @author: 张瀚
     * @description: 按帧执行的视角刷新，根据需要移动的角度、距离调整摄像头
     */
    updateCamera() {
        this.#myReq = requestAnimationFrame(() => {
            let camera = this.#viewer.camera
            let heading = camera.heading, pitch = camera.pitch, position
            //计算新的方向
            heading += this.flag.heading
            if (this.flag.vLeft) {
                heading -= Cesium.Math.toRadians(this.flag.vLeft)
                this.flag.vLeft = 0
            }
            if (this.flag.vRight) {
                heading += Cesium.Math.toRadians(this.flag.vRight)
                this.flag.vRight = 0
            }
            //计算新的俯仰角
            if (this.flag.pitch) {
                pitch += this.flag.pitch
            }
            if (this.flag.vUp) {
                pitch += Cesium.Math.toRadians(this.flag.vUp)
                this.flag.vUp = 0
            }
            if (this.flag.vDown) {
                pitch -= Cesium.Math.toRadians(this.flag.vDown)
                this.flag.vDown = 0
            }
            //视角有最大最小值
            pitch = Math.min(pitch,this.maxPitch)
            pitch = Math.max(pitch,this.minPitch)
            //计算新的位置
            let cartesian = coordinate.cartesianToMercator(this.#viewer, camera.positionWC)
            let initialAngle, angle
            if (this.flag.w || this.flag.s || this.flag.a || this.flag.d) {
                initialAngle = Cesium.Math.toDegrees(camera.heading);
                angle = Cesium.Math.toRadians(initialAngle);
            }
            //计算前进距离
            if (this.flag.w) {
                cartesian.x += this.flag.w * Math.sin(angle);
                cartesian.y += this.flag.w * Math.cos(angle);
                this.flag.w = 0
            }
            //计算后退距离
            if (this.flag.s) {
                cartesian.x -= this.flag.s * Math.sin(angle);
                cartesian.y -= this.flag.s * Math.cos(angle);
                this.flag.s = 0
            }
            //左右移动的需要调整参数
            initialAngle = 360 - initialAngle
            angle = Cesium.Math.toRadians(initialAngle);
            //计算向左移动距离
            if (this.flag.a) {
                cartesian.x -= this.flag.a * Math.cos(angle);
                cartesian.y -= this.flag.a * Math.sin(angle);
                this.flag.a = 0
            }
            //计算向右移动距离
            if (this.flag.d) {
                cartesian.x += this.flag.d * Math.cos(angle);
                cartesian.y += this.flag.d * Math.sin(angle);
                this.flag.d = 0
            }
            position = coordinate.mercatorToCartesian(this.#viewer, cartesian)
            //计算是否需要调整高度
            let temp
            if (this.flag.down || this.flag.up) {
                temp = coordinate.cartesian3ToCartographic(position, "Degrees")
            }
            //计算上升距离
            if (this.flag.up) {
                temp.alt += this.flag.up
                this.flag.up = 0
            }
            //计算下降距离
            if (this.flag.down) {
                temp.alt -= this.flag.down
                //不能低于最低视角
                temp.alt = Math.max(temp.alt,this.minVisionHeight)
                this.flag.down = 0
            }
            if (temp) {
                position = coordinate.cartographicToCartesian3(temp)
            }
            camera.setView({
                destination: position,
                orientation: {
                    heading,
                    pitch,
                    roll: 0
                }
            })
            this.updateCamera()
        })
    }

    /**
     * @author: 张瀚
     * @description: 禁用鼠标默认操作，并且保存起来留着恢复用
     */
    disableMouse() {
        this.cacheScreenSpaceCameraController = {
            enableRotate: this.#viewer.scene.screenSpaceCameraController.enableRotate,
            enableTranslate: this.#viewer.scene.screenSpaceCameraController.enableTranslate,
            enableZoom: this.#viewer.scene.screenSpaceCameraController.enableZoom,
            enableTilt: this.#viewer.scene.screenSpaceCameraController.enableTilt,
            enableLook: this.#viewer.scene.screenSpaceCameraController.enableLook
        }
        this.#viewer.scene.screenSpaceCameraController.enableRotate = false;
        this.#viewer.scene.screenSpaceCameraController.enableTranslate = false;
        this.#viewer.scene.screenSpaceCameraController.enableZoom = false;
        this.#viewer.scene.screenSpaceCameraController.enableTilt = false;
        this.#viewer.scene.screenSpaceCameraController.enableLook = false;
    }
    /**
     * @author: 张瀚
     * @description: 恢复保存的鼠标默认操作配置
     */
    restoreMouse() {
        this.#viewer.scene.screenSpaceCameraController.enableRotate = this.cacheScreenSpaceCameraController.enableRotate
        this.#viewer.scene.screenSpaceCameraController.enableTranslate = this.cacheScreenSpaceCameraController.enableTranslate
        this.#viewer.scene.screenSpaceCameraController.enableZoom = this.cacheScreenSpaceCameraController.enableZoom
        this.#viewer.scene.screenSpaceCameraController.enableTilt = this.cacheScreenSpaceCameraController.enableTilt
        this.#viewer.scene.screenSpaceCameraController.enableLook = this.cacheScreenSpaceCameraController.enableLook
    }
    /**
     * @author: 张瀚
     * @description: 启用键盘操作
     */
    enableKeyControl() {
        document.addEventListener('keydown', this.keyControlFunction)
    }
    /**
     * @author: 张瀚
     * @description: 停用键盘操作
     */
    disableKeyControl() {
        document.removeEventListener("keydown", this.keyControlFunction)
    }
    /**
     * @author: 张瀚
     * @description: 键盘控制功能
     * @param {*} event 
     */
    keyControl(event) {
        switch (event.key) {
            case 'w':
                this.flag.w = this.moveStep
                break;
            case 's':
                this.flag.s = this.moveStep
                break;
            case 'a':
                this.flag.a = this.moveStep
                break;
            case 'd':
                this.flag.d = this.moveStep
                break;
            case 'q':
                //上升
                this.flag.up = this.moveStep
                break
            case 'e':
                //下降
                this.flag.down = this.moveStep
                break
            case 'ArrowUp':
                this.flag.vUp = this.visionStep * 3
                break
            case 'ArrowDown':
                this.flag.vDown = this.visionStep * 3
                break
            case 'ArrowLeft':
                this.flag.vLeft = this.visionStep * 3
                break
            case 'ArrowRight':
                this.flag.vRight = this.visionStep * 3
                break

        }
    }
    /**
     * @author: 张瀚
     * @description: 设置移动的步长，按键事件每触发一次移动的距离，长按移动速度和键盘触发频率有关
     * @param {*} moveStep 单位米
     */
    setMoveStep(moveStep = 1) {
        this.moveStep = moveStep
    }
    /**
     * @author: 张瀚
     * @description: 设置视角移动的角度值
     * @param {*} visionStep
     * @return {*}
     */
    setVisionStep(visionStep = 0.1){
        this.visionStep = visionStep
    }
}
