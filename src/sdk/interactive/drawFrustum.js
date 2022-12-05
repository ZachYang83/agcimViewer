/**
 *  Class   DrawFrustum 
 */
class DrawFrustum {
    constructor() {
        //绘制方式枚举
    }
    /** 
     *  初始化绘制
     * @param {number} far camera far 参数
     * @param {number} near camera near 参数
     * @param {number} fov camera fov参数
     */
    initialize(fov, near = 1, far = 300) {
        this._fov = fov
        this._far = far
        this._near = near
        Object.defineProperties(this, {
            //起始点
            startPoint: {
                get: function () {
                    return this._startPoint
                },
                set: function (e) {
                    return e
                }
            },
            //终点
            endPoint: {
                get: function () {
                    return this._endPoint
                },
                set: function (e) {
                    return e
                }
            },
            // 视椎体的fov
            fov: {
                get: function () {
                    return this._fov
                },
                set: function (e) {
                    return e
                }
            },
            // 视椎体的near
            near: {
                get: function () {
                    return this._near
                },
                set: function (e) {
                    return e
                }
            },
            // 视椎体的far
            far: {
                get: function () {
                    return this._far
                },
                set: function (e) {
                    return e
                }
            },
            // 视椎体的heading
            heading: {
                get: function () {
                    return this._isNullOrEmpty(this._heading) ? 0 : this._heading
                },
                set: function (e) {
                    return e
                }
            },
            // 视椎体的pitch
            pitch: {
                get: function () {
                    return this._isNullOrEmpty(this._pitch) ? 0 : this._pitch
                },
                set: function (e) {
                    return e
                }
            }
        })
    }
    /** 
    *  自定义起点终点绘制视椎体
    * @param {object} viewer CIM viewer
    * @param  {function} callback  callback 回调函数，绘制完成后自定义函数
    */
    addFrustumWithCustom(viewer, callback) {
        var viewer = viewer
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        var _this = this
        var isStart = false
        //鼠标单击左键
        this._inputActionLeftClick(handler, (leftClickEvt) => {
            var leftClickPick = viewer.scene.pick(leftClickEvt.position);
            if (!isStart) {
                //获取点击的点坐标
                var cartesian = _this._getPointByPick(leftClickPick, "agPoint", leftClickEvt.position, viewer);
                isStart = true
                var startPoint = cartesian
                this._startPoint = startPoint
            }
            //鼠标移动
            _this._inputActionMouseMove(handler, (mouseMoveEvt) => {
                var mouseMovePick = viewer.scene.pick(mouseMoveEvt.endPosition);
                //获取点击的点坐标
                var movecartesian = _this._getPointByPick(mouseMovePick, "agPoint", mouseMoveEvt.endPosition, viewer);

                _this._endPoint = movecartesian
                if (!this._isNullOrEmpty(this.cameraFrustum)) {
                    viewer.scene.primitives.remove(_this.cameraFrustum)
                    _this.cameraFrustum = null
                }
                //绘制视椎体
                _this._drawCamera(viewer)
            })
            //鼠标双击
            _this._inputActionLeftDoubleClick(handler, (leftDoubleClickEvt) => {
                var leftDoubleClickPick = viewer.scene.pick(leftDoubleClickEvt.position);
                //获取点击的点坐标
                var endcartesian = _this._getPointByPick(leftDoubleClickPick, "agPoint", leftDoubleClickEvt.position, viewer);
                isStart = false
                _this._endPoint = endcartesian
                handler.destroy()
                //回调函数，用于返回视椎体的信息
                var endPosition = this._cartesianToDeggre(this.endPoint, viewer)
                if (callback) {
                    callback({
                        cameraFrustum: _this.cameraFrustum,
                        cameraInfo: _this.camera,
                        endPosition: new Cesium.Cartesian3(endPosition.lng, endPosition.lat, endPosition.alt)
                    })
                }
            })
        })
    }
    /** 
    *  固定起点绘制视椎体
    * @param {object} viewer CIM viewer
    * @param {Cartesian3} startPoint 起点，世界坐标 lng/lat/alt
    * @param  {function} callback  callback 回调函数，绘制完成后自定义函数
   */
    addFrustumWithFiexdStartPoint(viewer, startPoint, callback) {
        var viewer = viewer
        this._startPoint = startPoint
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        var _this = this
        viewer.camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(this.startPoint.lng, this.startPoint.lat, this.startPoint.alt * 2)
        });
        this._startPoint = new Cesium.Cartesian3.fromDegrees(this.startPoint.lng, this.startPoint.lat, this.startPoint.alt)
        //鼠标移动
        _this._inputActionMouseMove(handler, (mouseMoveEvt) => {
            var mouseMovePick = viewer.scene.pick(mouseMoveEvt.endPosition);
            //获取点击的点坐标
            var movecartesian = _this._getPointByPick(mouseMovePick, "agPoint", mouseMoveEvt.endPosition, viewer);

            _this._endPoint = movecartesian
            if (!this._isNullOrEmpty(this.cameraFrustum)) {
                viewer.scene.primitives.remove(_this.cameraFrustum)
                _this.cameraFrustum = null
            }
            //绘制视椎体
            _this._drawCamera(viewer)
        })
        //鼠标双击
        _this._inputActionLeftDoubleClick(handler, (leftDoubleClickEvt) => {
            var leftDoubleClickPick = viewer.scene.pick(leftDoubleClickEvt.position);
            //获取点击的点坐标
            var endcartesian = _this._getPointByPick(leftDoubleClickPick, "agPoint", leftDoubleClickEvt.position, viewer);
            _this._endPoint = endcartesian
            handler.destroy()
            //回调函数，用于返回视椎体的信息
            var endPosition = this._cartesianToDeggre(this.endPoint, viewer)
            if (callback) {
                callback({
                    cameraFrustum: _this.cameraFrustum,
                    cameraInfo: _this.camera,
                    endPosition: new Cesium.Cartesian3(endPosition.lng, endPosition.lat, endPosition.alt)
                })
            }
        })
    }
    /** 
    *  固定起点终点绘制视椎体
    * @param {object} viewer CIM viewer
    * @param {Cartesian3} startPoint 起点，世界坐标 lng/lat/alt
    * @param {Cartesian3} endPoint 终点，世界坐标 lng/lat/alt
    * @param  {function} callback  callback 回调函数，绘制完成后自定义函数
    */
    addFrustumWithFiexdAllPoint(viewer, startPoint, endPoint, callback) {
        var viewer = viewer
        this._startPoint = startPoint
        this._endPoint = endPoint
        var _this = this
        viewer.camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(this.startPoint.lng, this.startPoint.lat, this.startPoint.alt * 2)
        });
        //坐标转换
        this._startPoint = new Cesium.Cartesian3.fromDegrees(this.startPoint.lng, this.startPoint.lat, this.startPoint.alt)
        this._endPoint = new Cesium.Cartesian3.fromDegrees(this.endPoint.lng, this.endPoint.lat, this.endPoint.alt)
        //绘制视椎体
        _this._drawCamera(viewer)
        //回调函数，用于返回视椎体的信息
        var endPosition = this._cartesianToDeggre(this.endPoint, viewer)
        if (callback) {
            callback({
                cameraFrustum: _this.cameraFrustum,
                cameraInfo: _this.camera,
                endPosition: new Cesium.Cartesian3(endPosition.lng, endPosition.lat, endPosition.alt)
            })
        }
    }

    /** 
    *  调整视椎体方向
    *  @param {object} viewer CIM viewer
    *  @param {number} heading 摄像机Camera heading
    *  @param {number} pitch 摄像机Camera pitch
    *  @param {number} roll 摄像机Camera roll
    */
    changeCameraOrientations(viewer, heading, pitch, roll) {
        var viewer = viewer
        var _this = this
        var tempHeading = this._isNullOrEmpty(heading) ? this.camera.heading : Cesium.Math.toRadians(heading)
        var tempPitch = this._isNullOrEmpty(pitch) ? this.camera.pitch : Cesium.Math.toRadians(pitch)
        var tempRoll = this._isNullOrEmpty(roll) ? this.camera.roll : Cesium.Math.toRadians(roll)
        var deggreStartPoint = this._cartesianToDeggre(this.startPoint, viewer)
        let origin = new Cesium.Cartesian3.fromDegrees(deggreStartPoint.lng, deggreStartPoint.lat, deggreStartPoint.alt)
        this.camera.setView({
            orientation: {
                heading: tempHeading,
                pitch: tempPitch,
                roll: tempRoll
            }
        });
        //计算视锥姿态
        var orientation = this._getFrustumOrientation()

        if (!this._isNullOrEmpty(this.cameraFrustum)) {
            viewer.scene.primitives.remove(_this.cameraFrustum)
            _this.cameraFrustum = null
        }
        this._drawCameraFrustumGeometry(viewer, origin, orientation)
    }
    /** 
    *  调整视椎体FOV
    *  @param {object} viewer CIM viewer
    *  @param {number} fov 视椎体FOV
    */
    changeCameraFov(viewer, fov) {
        var viewer = viewer
        var _this = this
        var tempFov = this._isNullOrEmpty(fov) ? this.camera.frustum.fov : Cesium.Math.toRadians(fov)
        var deggreStartPoint = this._cartesianToDeggre(this.startPoint, viewer)
        let origin = new Cesium.Cartesian3.fromDegrees(deggreStartPoint.lng, deggreStartPoint.lat, deggreStartPoint.alt)
        this.camera.frustum.fov = tempFov

        //计算视锥姿态
        var orientation = this._getFrustumOrientation()

        if (!this._isNullOrEmpty(this.cameraFrustum)) {
            viewer.scene.primitives.remove(_this.cameraFrustum)
            _this.cameraFrustum = null
        }
        this._drawCameraFrustumGeometry(viewer, origin, orientation)
    }
    /** 
    *  销毁视椎体
    *  @param {object} viewer CIM viewer
    */
    destroy(viewer) {
        if (!this._isNullOrEmpty(this.cameraFrustum)) {
            viewer.scene.primitives.remove(this.cameraFrustum)
            this.cameraFrustum = null
            this._startPoint = null
            this._endPoint = null
            this._fov = null
            this._far = null
            this._near = null
            this._heading = null
            this._pitch = null
        }
    }
    /** 
    *  求解视椎体orientation方向
    *  @private
    */
    _getFrustumOrientation() {
        //求解视椎体orientation方向
        let scratchRight = new Cesium.Cartesian3();
        let scratchRotation = new Cesium.Matrix3();
        var scratchOrientation = new Cesium.Quaternion();
        let direction = this.camera.directionWC;
        let up = this.camera.upWC;
        let right = this.camera.rightWC;
        right = Cesium.Cartesian3.negate(right, scratchRight);
        let rotation = scratchRotation;
        Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
        Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
        Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
        //计算视锥姿态
        var orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation);

        return orientation
    }
    /** 
    *  绘制视椎体
    *  @param {object} viewer CIM viewer
    *  @private
    */
    _drawCamera(viewer) {
        var _this = this
        var deggreStartPoint = this._cartesianToDeggre(this.startPoint, viewer)
        let startPos = new Cesium.Cartesian3(deggreStartPoint.lng, deggreStartPoint.lat, deggreStartPoint.alt)
        let origin = new Cesium.Cartesian3.fromDegrees(deggreStartPoint.lng, deggreStartPoint.lat, deggreStartPoint.alt)
        let cameraDirection = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.endPoint, this.startPoint, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        this.camera = new Cesium.Camera(viewer.scene);
        this.camera.position = startPos; //相机起点
        this.camera.direction = cameraDirection; //相机面向的方向
        this.camera.frustum.near = _this.near;
        this.camera.frustum.far = _this.far;
        this.camera.setView({
            orientation: {
                heading: this.camera.heading,
                pitch: this.camera.pitch,
                roll: this.camera.roll
            }
        });
        //计算视锥姿态
        var orientation = this._getFrustumOrientation()
        this._drawCameraFrustumGeometry(viewer, origin, orientation)
    }
    /** 
    *  绘制视椎体Geometry
    *  @param {object} viewer CIM viewer
    *  @param {object} origin CIM viewer
    *  @param {object} orientation CIM viewer
    *  @private
    */
    _drawCameraFrustumGeometry(viewer, origin, orientation) {
        this.cameraFrustum = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.FrustumOutlineGeometry({
                    frustum: this.camera.frustum,
                    origin: origin,
                    orientation: orientation,
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0, 0.5, 0.5))
                }
            }),
            appearance: new Cesium.PerInstanceColorAppearance({
                translucent: !1,
                flat: !0
            }),
            asynchronous: !1,
            show: true
        })
        viewer.scene.primitives.add(this.cameraFrustum)
    }
   /** 
   *  点击左键
   *  @param {element} _handler 
   *  @param {object} _callback 回调函数
   *  @private
   */
    _inputActionLeftClick(_handler, _callback) {
        _handler.setInputAction((evt) => {
            if (_callback) {
                _callback(evt)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    /** 
    *  鼠标移动
    *  @param {element} _handler 
    *  @param {object} _callback 回调函数
    *  @private
    */
    _inputActionMouseMove(_handler, _callback) {
        _handler.setInputAction((evt) => {
            if (_callback) {
                _callback(evt)
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
   /** 
   *  左键双击
   *  @param {element} _handler 
   *  @param {object} _callback 回调函数
   *  @private
   */
    _inputActionLeftDoubleClick(_handler, _callback) {
        _handler.setInputAction((evt) => {
            if (_callback) {
                _callback(evt)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }
    /** 
    *  获取点击点坐标
    * @param {object} _pickedFeature 鼠标操作返回值
    * @param {string} _entityName  _entityName 
    * @param {objce} _windowPosition 点击坐标点  
    * @param {object} _viewer  viewer CIM viewer
    * @private
    */
    _getPointByPick(_pickedFeature, _entityName, _windowPosition, _viewer) {
        var cartesian;
        if (!_pickedFeature || (_pickedFeature.id && _pickedFeature.id.name == _entityName)) {
            cartesian = _viewer.camera.pickEllipsoid(
                _windowPosition,
                _viewer.scene.globe.ellipsoid
            );
        } else {
            cartesian = _viewer.scene.pickPosition(_windowPosition);
        }
        return cartesian;
    }
    /** 
    *  判空
    *  @param {any} data  需要判断的参数 
    *  @private
    */
    _isNullOrEmpty(data) {
        return (
            data == null || data == undefined || data.length == 0 || data == ""
        );
    }
    /** 
    *  坐标转换
    *  @param {objce} position 点击坐标点  
    *  @param {object} viewer  viewer CIM viewer
    *  @private
    */
    _cartesianToDeggre(position, viewer) {
        const ellipsoid = viewer.scene.globe.ellipsoid
        const cartographic = ellipsoid.cartesianToCartographic(position)

        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const lng = Cesium.Math.toDegrees(cartographic.longitude)

        var alt = cartographic.height;
        // const alt = 3500
        return {
            lng: lng,
            lat: lat,
            alt: alt
        }
    }

};
export default DrawFrustum;