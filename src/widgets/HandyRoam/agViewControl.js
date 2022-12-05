/*
 * @Author: pwz
 * @Date: 2020-11-05 10:31:18
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-11-24 17:37:29
 * @FilePath: \agcimViewer\src\widgets\HandyRoam\agViewControl.js
 */


const visualAngleTypeArr = ["lockFirst", "lockGod"];
class AgViewControl {
    /**
     * @description: 
     * @param {*} option.viewer 视图对象
     * @param {*} option.isContinue 是否启动视图控制
     * @param {*} option.keyControl 是否启动键盘控制
     * @param {*} option.
     * @return {*}
     */
    constructor(option) {
        this.viewer = option.viewer;
        this.isContinue = option.isContinue || true;
        this.followedX = 0;//视线距离
        this.followedY = 0;//视线左右偏向
        this.followedZ = 0;//视线高度
        this.keyControl = option.keyControl || true;
        this.isLock = false;
        this.visualAngleType = "empty";
        this.keyEvent();//用键盘控制
        this.keyEventHander = this.keyEventHander.bind(this);
    }
    /**
     * @description: 设置视角
     * @param {*} option.visualAngleType 视角类型
     * @param {*} option.entity 实体对象
     * @param {*} option.config 视角参数配置，比如视角距离option.config.width,视角高度option.config.height
     * @return {*}
     */

    controlView(option) {
        var _this = this;
        let viewer = this.viewer;
        let { visualAngleType, entity, config } = option;
        this.visualAngleType = visualAngleType;
        _this.setFollowed(visualAngleType, config);//设置视角类型
        let scratch = new Cesium.Matrix4();
        // doto 模型会不见问题，强制显示
        var primitives = viewer.scene.primitives._primitives;
        var cesium3DTilesets = [];
        for (var i = 0; i < primitives.length; i++) {
            if (primitives[i] instanceof Cesium.Cesium3DTileset) {
                if (primitives[i].show == true) {
                    cesium3DTilesets.push(primitives[i]);
                }

            }
        }
        // 监听并设置当前时间点的相机位置
        _this.listenerRoaming = function () {
            if (_this.isContinue == true) {
                var center = entity ? entity.position.getValue(viewer.clock.currentTime) : null;
                if (center) {
                    if (_this.isLock == true) {
                        for (var i = 0; i < cesium3DTilesets.length; i++) {
                            if (cesium3DTilesets[i].show == false) {
                                cesium3DTilesets[i].show = true;
                            }
                        }
                        _this.getModelMatrix(
                            entity,
                            viewer.clock.currentTime,
                            scratch
                        );
                        viewer.scene.camera.lookAtTransform(
                            scratch,
                            new Cesium.Cartesian3(
                                _this.followedX,
                                _this.followedY,
                                _this.followedZ
                            )
                        );
                    }
                } else {
                  
                    _this.resetCamera();
                    viewer.scene.preUpdate.removeEventListener(_this.listenerRoaming);
                }
            }
        };
        viewer.scene.preUpdate.addEventListener(_this.listenerRoaming);
    }
    /**
     * @description: 设置视角类型
     * @param {*} value 视角类型
     * @param {*} option.width 视角距离
     * @param {*} option.height 视角高度
     * @return {*} 
     */
    setFollowed(value, option) {
        this.visualAngleType = value;
        let viewer = this.viewer;
        if (value == "empty") {
            //无
            this.isLock = false;
            viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        } else if (value == visualAngleTypeArr[0]) {
            //锁定第一视角
            this.isLock = true;
            this.followedX = -option.width;
            this.followedY = 0;
            this.followedZ = option.height;
        } else if (value == visualAngleTypeArr[1]) {
            //上帝视角
            this.isLock = true;
            this.followedX = -1;
            this.followedY = 0;
            this.followedZ = option.height;
        }
    }
    /**
     * @description: 获取模型矩阵
     * @param {*} entity 传入是实体对象
     *  @param {*} time 传入是当前时间
     *  @param {*} result 保存结果对象
     * @return {*}
     */
    getModelMatrix(entity, time, result) {
        let matrix3Scratch = new Cesium.Matrix3();
        if (!entity) return undefined;
        let position = Cesium.Property.getValueOrUndefined(
            entity.position,
            time,
            new Cesium.Cartesian3()
        );
        if (!Cesium.defined(position)) {
            return undefined;
        }
        let lnglat = Cesium.Cartographic.fromCartesian(position);
        position = Cesium.Cartesian3.fromRadians(
            lnglat.longitude,
            lnglat.latitude,
            lnglat.height
        );
        let orientation = Cesium.Property.getValueOrUndefined(
            entity.orientation,
            time,
            new Cesium.Quaternion()
        );
        if (!Cesium.defined(orientation)) {
            result = Cesium.Transforms.eastNorthUpToFixedFrame(
                position,
                undefined,
                result
            );
        } else {
            result = Cesium.Matrix4.fromRotationTranslation(
                Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch),
                position,
                result
            );
        }
        return result;
    }
    /**
     * @description: 清除掉视图控制组件的所有状态
     * @param {*}
     * @return {*}
     */
    remove() {
        if (this.listenerRoaming) this.viewer.scene.preUpdate.removeEventListener(this.listenerRoaming);
        this.resetCamera();
        this.removeKeyEvent();
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 重置相机
     * @param {*}
     * @return {*}
     */
    resetCamera() {
        this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
    /**
     * @description: 键盘事件
     * @param {*}
     * @return {*}
     */
    keyEvent() {
        if (this.keyControl) {
            document.addEventListener('keydown', this.keyEventHander.bind(this), false);
        }
    }
    /**
     * @description: 添加键盘事件的回调
     * @param {*} evt 键盘按下的event回调参数
     * @return {*}
     */
    keyEventHander(evt) {
        let _this = this;
        let keyCode = evt.keyCode;
        if (_this.visualAngleType == visualAngleTypeArr[0]) {
            switch (keyCode) {
                case 'W'.charCodeAt(0):
                    _this.followedX++;
                    return 'moveForward';
                case 'S'.charCodeAt(0):
                    _this.followedX--;
                    return 'moveBackward';
                case 'Q'.charCodeAt(0):
                    return 'moveUp';
                case 'E'.charCodeAt(0):
                    return 'moveDown';
                case 'D'.charCodeAt(0):
                    _this.followedY--;
                    return 'moveRight';
                case 'A'.charCodeAt(0):
                    _this.followedY++;
                    return 'moveLeft';
                default:
                    return undefined;
            }
        } else if (_this.visualAngleType == visualAngleTypeArr[1]) {
            switch (keyCode) {
                case 'W'.charCodeAt(0)://w键抬高
                    _this.followedZ--;
                    return 'moveForward';
                case 'S'.charCodeAt(0):
                    _this.followedZ++;
                    return 'moveBackward';
                case 'Q'.charCodeAt(0):
                    return 'moveUp';
                case 'E'.charCodeAt(0):
                    return 'moveDown';
                case 'D'.charCodeAt(0):
                    _this.followedY--;
                    return 'moveRight';
                case 'A'.charCodeAt(0):
                    _this.followedY++;
                    return 'moveLeft';
                default:
                    return undefined;
            }
        }
    }
    /**
     * @description: 清除掉键盘事件
     * @param {*}
     * @return {*}
     */
    removeKeyEvent() {
        document.removeEventListener('keydown', this.keyEventHander.bind(this), false);
    }
}
export default AgViewControl;