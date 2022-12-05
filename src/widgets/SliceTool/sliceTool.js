/**
 * 剖切类
 */
import agMath from "@/sdk/maths/math";
import coordinate from "@/sdk/maths/coordinate";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import AgSlice from "@/sdk/interactive/slice";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import AgPolyline from "@/sdk/geometry/polyline";
import AgBillboard from "@/sdk/geometry/billboard";
import stretchImg from "../SliceTool/img/stretch.png";
import rotateImg from "../SliceTool/img/rotate.png";
var agFeatureLayer;
class SliceTool {
    constructor() {
        this.vm = null;
        this.viewer = null;
        this.viewerContainer = null;
        this.pickerHelper = null;
        this.agSlice = null;
        this.slicePlanes = false;
        this.sliceEntity = false;
        agFeatureLayer = new AgFeatureLayer(CIM.viewer);
    }
    start(vm, viewer) {
        this.vm = vm;
        this.viewer = viewer;
        this.viewerContainer = this.viewer._element;
        this.pickerHelper = new PickerHelper(viewer);
        this.agSlice = new AgSlice(viewer);
        this.reset();
        this.setInputAction();
        this.bindKeyDown();
        this.sliceType = "crosswise";
        this.updateEntity = null;
    }
    reset() {
        this.left = 0.0; //左方向剖切距离
        this.right = 0.0; //右方向剖切距离
        this.afterward = 0.0; //后方向剖切距离
        this.forward = 0.0; //前方向剖切距离
        this.top = 0.0; //上方向剖切距离
        this.bottom = -10000;
        this.angleValue = 0;     //角度
        this.selectedEntity;     //选中的实体，
        this.moveInEntity;          //鼠标移入赋值实体
        this.centerPoint;     //剖切面板中心点坐标
        this.slicePlanes = false; //是否创建切割面板，用于没有确定切割面板时
        this.sliceEntity = false; //是否创建剖切entity
        this.clippingPlaneCollection; //定义的裁剪平面集合
        this.sliceLayer; //剖切图层
        this.sliceType = "crosswise";
    }

    /**
    * 绑定键盘按下事件
    */
    bindKeyDown() {
        var _this = this;
        document.addEventListener("keydown", _this.addKeyDownListener.bind(_this),
            false
        );
    }
    /**
     * 监听键盘按下事件
    */
    addKeyDownListener(event) {
        event = event || window.event;
        var _this = this;

        if (event.key != "Shift") return;
        if (_this.sliceType == "crosswise") {
            _this.sliceType = "vertical";

            _this.updateEntity.billboard.alignedAxis = Cesium.Cartesian3.UNIT_Y;
            _this.updateEntity.billboard.rotation = Cesium.Math.PI / 2;

            _this.bottom = -_this.panelWidth / 4;
            _this.top = -_this.centerPoint.z;
            _this.forward = -10000;
            _this.afterward = 0;
        } else if (_this.sliceType == "vertical") {
            _this.sliceType = "crosswise";

            _this.updateEntity.billboard.alignedAxis = Cesium.Cartesian3.UNIT_Z;
            _this.updateEntity.billboard.rotation = 0;

            _this.bottom = -10000;
            _this.top = 0;
        }
        let angle = 360 - CIM.viewer.scene.camera.heading * 180 / Math.PI;
        _this.angleValue = angle;
        _this.linePoint = _this.computeLinePoints();

        let targetDislr = agMath.getDistance(_this.mercatorToCartesian(_this.linePoint.ltPoint), _this.mercatorToCartesian(_this.linePoint.rtPoint));
        _this.left = -(targetDislr / 2);
        _this.right = -(targetDislr / 2);

        if (_this.sliceType == "crosswise") {
            let targetDistb = agMath.getDistance(_this.mercatorToCartesian(_this.linePoint.lbPoint), _this.mercatorToCartesian(_this.linePoint.ltPoint));
            _this.afterward = -(targetDistb / 2);
            _this.forward = -(targetDistb / 2);
        }

        _this.agSlice.removeClippingPlanes();
        _this.sliceLayer.clippingPlanes = _this.agSlice.createClippingPlane(_this.sliceLayer, _this.centerPoint, {
            forward: _this.forward,
            afterward: _this.afterward,
            left: _this.left,
            right: _this.right,
            top: _this.top,
            bottom: _this.bottom
        }, _this.angleValue);
    }

    /**
     * 添加鼠标监听事件
     */
    setInputAction() {
        this.setInputActionLeftClick();
        this.setInputActionMouseMove();
        this.setInputActionLeftDown();
        this.setInputActionLeftUp();
    }
    /**
     * 左键单击事件
     */
    setInputActionLeftClick() {
        var _this = this;
        _this.pickerHelper.on("LEFT_CLICK", function (movement) {
            if (!_this.slicePlanes) {
                var pickedObject = _this.viewer.scene.pick(movement.position); //判断是否拾取到模型
                if (Cesium.defined(pickedObject) && pickedObject.primitive) {
                    var cartesian = _this.viewer.scene.pickPosition(movement.position);
                    if (Cesium.defined(cartesian)) {
                        var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度
                        _this.top = 0;
                        _this.centerPoint = coordinate.cartographicToMercatorCartesian3(_this.viewer, cartographic);


                        let angle = 360 - CIM.viewer.scene.camera.heading * 180 / Math.PI;
                        _this.angleValue = angle;
                        console.log(360 - _this.angleValue, "剖切框角度");
                        _this.linePoint = _this.computeLinePoints();
                    }
                    _this.sliceLayer = pickedObject.primitive;
                    _this.sliceLayer.clippingPlanes = _this.agSlice.createClippingPlane(_this.sliceLayer, _this.centerPoint, {
                        forward: _this.forward,
                        afterward: _this.afterward,
                        left: _this.left,
                        right: _this.right,
                        top: _this.top,
                        bottom: _this.bottom
                    }, _this.angleValue);
                    _this.sliceLayer.backFaceCulling = false;
                    _this.slicePlanes = true;
                    _this.vm.msgShow = false;
                    _this.vm.newsliceShow = true;
                    _this.vm.noteShow = true;
                }
            }
        });
    }
    /**
     * 鼠标移动事件
     */
    setInputActionMouseMove() {
        var _this = this;
        _this.pickerHelper.on("MOUSE_MOVE", function (movement) {
            // 未确定切割面板位置时    
            if (!_this.slicePlanes) {
                _this.panelWidth = _this.computePanelWidth(movement.startPosition);

                var cartesian = _this.viewer.scene.pickPosition(movement.endPosition);
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度
                _this.centerPoint = coordinate.cartographicToMercatorCartesian3(_this.viewer, cartographic);


                // 跟随摄像机角度计算位置
                let angle = 360 - CIM.viewer.scene.camera.heading * 180 / Math.PI;
                _this.angleValue = angle;
                _this.linePoint = _this.computeLinePoints();


                let targetDistb = agMath.getDistance(_this.mercatorToCartesian(_this.linePoint.lbPoint), _this.mercatorToCartesian(_this.linePoint.ltPoint));
                let targetDislr = agMath.getDistance(_this.mercatorToCartesian(_this.linePoint.ltPoint), _this.mercatorToCartesian(_this.linePoint.rtPoint));

                _this.left = -(targetDislr / 2);
                _this.right = -(targetDislr / 2);
                _this.afterward = -(targetDistb / 2);
                _this.forward = -(targetDistb / 2);
                //判断是否创建剖切实体
                if (!_this.sliceEntity)
                    _this.createSliceEntity();
                return;
            }
            // 选中线拖动改变框的大小
            if (_this.selectedEntity) {
                let startPoint = movement.startPosition;
                let endPoint = movement.endPosition;


                _this.viewer.scene.screenSpaceCameraController.enableInputs = false;
                let entity = _this.selectedEntity;

                if (entity && entity.name == "leftLine") {
                    _this.computeLineDis('ltPoint', 'lbPoint', 'rtPoint', 'left', startPoint, endPoint);
                    _this.agSlice.updateClippingPlane("left", _this.sliceLayer.clippingPlanes, _this.left, _this.angleValue); //左

                } else if (entity && entity.name == "bottomLine") {

                    if (_this.sliceType == "vertical") {
                        let deltaY = movement.startPosition.y - movement.endPosition.y;
                        _this.top += deltaY; _this.linePoint.lbPoint.z += deltaY; _this.linePoint.rbPoint.z += deltaY;
                        _this.agSlice.updateClippingPlane("top", _this.sliceLayer.clippingPlanes, _this.top); //上
                    }
                    else {
                        _this.computeLineDis('rbPoint', 'lbPoint', 'ltPoint', 'forward', startPoint, endPoint);
                        _this.agSlice.updateClippingPlane("forward", _this.sliceLayer.clippingPlanes, _this.forward, _this.angleValue); //前
                    }

                } else if (entity && entity.name == "rightLine") {
                    _this.computeLineDis('rtPoint', 'rbPoint', 'lbPoint', 'right', startPoint, endPoint);
                    _this.agSlice.updateClippingPlane("right", _this.sliceLayer.clippingPlanes, _this.right, _this.angleValue); //右

                } else if (entity && entity.name == "topLine") {

                    if (_this.sliceType == "vertical") {
                        let deltaY = movement.startPosition.y - movement.endPosition.y;
                        _this.bottom -= deltaY; _this.linePoint.rtPoint.z += deltaY; _this.linePoint.ltPoint.z += deltaY;
                        _this.agSlice.updateClippingPlane("bottom", _this.sliceLayer.clippingPlanes, _this.bottom, _this.angleValue); //前
                    }
                    else {
                        _this.computeLineDis('ltPoint', 'rtPoint', 'rbPoint', 'afterward', startPoint, endPoint);
                        _this.agSlice.updateClippingPlane("afterward", _this.sliceLayer.clippingPlanes, _this.afterward, _this.angleValue); //后
                    }

                } else if (entity && entity.name == "updataHeight") {

                    if (_this.sliceType == "vertical") {
                        _this.computeLineDis('ltPoint', 'rtPoint', 'rbPoint', 'afterward', startPoint, endPoint);
                        _this.computeMoveEndLine2('rbPoint', 'lbPoint', endPoint);
                        _this.agSlice.updateClippingPlane("afterward", _this.sliceLayer.clippingPlanes, _this.afterward, _this.angleValue); //后
                    }
                    else {
                        let deltaY = movement.startPosition.y - movement.endPosition.y;
                        _this.top += deltaY; _this.centerPoint.z += deltaY;
                        _this.agSlice.updateClippingPlane("top", _this.sliceLayer.clippingPlanes, _this.top); //上
                    }

                } else if (entity && entity.name == "updataRotate") {
                    // 旋转

                    var start = _this.getWebMercator(startPoint); var end = _this.getWebMercator(endPoint);
                    let isR = agMath.judgeDirection([_this.mercatorToCartesian(start), _this.mercatorToCartesian(_this.centerPoint), _this.mercatorToCartesian(end)]);
                    let angle = agMath.computeAngle(_this.mercatorToCartesian(start), _this.mercatorToCartesian(_this.centerPoint), _this.mercatorToCartesian(end));
                    if (isR) {
                        angle = -angle;
                    }
                    _this.angleValue += angle;
                    if (_this.angleValue <= -360) {
                        _this.angleValue += 360;
                    } else if (_this.angleValue >= 360) {
                        _this.angleValue -= 360;
                    }
                    let linePoint = {
                        ltPoint: _this.retatedPoint(_this.linePoint.ltPoint, _this.centerPoint, angle),
                        rtPoint: _this.retatedPoint(_this.linePoint.rtPoint, _this.centerPoint, angle),
                        rbPoint: _this.retatedPoint(_this.linePoint.rbPoint, _this.centerPoint, angle),
                        lbPoint: _this.retatedPoint(_this.linePoint.lbPoint, _this.centerPoint, angle)
                    }
                    _this.linePoint = linePoint;
                    _this.agSlice.updateClippingPlane("left", _this.sliceLayer.clippingPlanes, _this.left, _this.angleValue);
                    _this.agSlice.updateClippingPlane("forward", _this.sliceLayer.clippingPlanes, _this.forward, _this.angleValue);
                    _this.agSlice.updateClippingPlane("right", _this.sliceLayer.clippingPlanes, _this.right, _this.angleValue);
                    _this.agSlice.updateClippingPlane("afterward", _this.sliceLayer.clippingPlanes, _this.afterward, _this.angleValue);
                }
            }
            // 移入移出改变线宽
            var pickedObject = _this.viewer.scene.pick(movement.startPosition);
            if (Cesium.defined(pickedObject)) {
                let entity = pickedObject.id;
                if (entity) {
                    if (entity.polyline) {
                        entity.polyline.width = 4;
                    } else if (entity.billboard) {
                        entity.billboard.scale = 1.0;
                    }
                }
                _this.moveInEntity = entity;

            } else {
                if (_this.moveInEntity) {
                    if (_this.moveInEntity.polyline) {
                        _this.moveInEntity.polyline.width = 2;
                    } else if (_this.moveInEntity.billboard) {
                        _this.moveInEntity.billboard.scale = 0.8;
                    }
                    _this.moveInEntity = undefined;
                }
            }
        });
    }
    /**
     * 鼠标按下事件
     */
    setInputActionLeftDown() {
        let _this = this;
        _this.pickerHelper.on("LEFT_DOWN", function (movement) {
            // 鼠标按下，选中实体
            var pickedObject = _this.viewer.scene.pick(movement.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                if (pickedObject.id.polyline) {
                    let entity = pickedObject.id;
                    entity.polyline.width = entity.polyline.width * 2;
                    _this.selectedEntity = entity;
                } else if (pickedObject.id.billboard) {
                    _this.selectedEntity = pickedObject.id;
                    pickedObject.id.billboard.scale = 1.0;
                }
            }
        });
    }
    /**
     * 鼠标弹起事件
     */
    setInputActionLeftUp() {
        let _this = this;
        _this.pickerHelper.on("LEFT_UP", function (movement) {
            if (Cesium.defined(_this.selectedEntity)) {
                if (_this.selectedEntity.polyline) {
                    _this.selectedEntity.polyline.width = _this.selectedEntity.polyline.width / 2;
                } else if (_this.selectedEntity.billboard) {
                    _this.selectedEntity.billboard.scale = 0.8;
                }
                _this.selectedEntity = undefined;
            }
            _this.viewer.scene.screenSpaceCameraController.enableInputs = true;
        });
    }

    /**
     * 创建剖切框
     */
    createSliceEntity() {
        let _this = this;
        // 四条边
        let lineEntities = [
            {
                name: 'leftLine',
                positions: new Cesium.CallbackProperty(function () {
                    return [_this.mercatorToCartesian(_this.linePoint.lbPoint), _this.mercatorToCartesian(_this.linePoint.ltPoint)]
                }, false)
            },
            {
                name: 'topLine',
                positions: new Cesium.CallbackProperty(function () {
                    return [_this.mercatorToCartesian(_this.linePoint.ltPoint), _this.mercatorToCartesian(_this.linePoint.rtPoint)]
                }, false)
            },
            {
                name: 'rightLine',
                positions: new Cesium.CallbackProperty(function () {
                    return [_this.mercatorToCartesian(_this.linePoint.rtPoint), _this.mercatorToCartesian(_this.linePoint.rbPoint)]
                }, false)
            },
            {
                name: 'bottomLine',
                positions: new Cesium.CallbackProperty(function () {
                    let lines = [_this.mercatorToCartesian(_this.linePoint.rbPoint), _this.mercatorToCartesian(_this.linePoint.lbPoint)];
                    return lines
                }, false)
            },
        ];
        //上移、旋转
        let billboard = [
            {
                name: 'updataHeight',
                img: stretchImg,
                positions: new Cesium.CallbackProperty(function () {
                    let position = _this.mercatorToCartesian(_this.linePoint.lbPoint);
                    return position;
                }, false)
            },
            {
                name: 'updataRotate',
                img: rotateImg,
                positions: new Cesium.CallbackProperty(function () {
                    let position = _this.mercatorToCartesian(_this.linePoint.rtPoint);
                    return position;
                }, false)
            },
        ];
        for (let i = 0; i < lineEntities.length; i++) {
            var agPolyline = new AgPolyline(lineEntities[i].name, lineEntities[i].positions, { material: Cesium.Color.ORANGERED });
            agPolyline.addToLayer(agFeatureLayer);
        }
        for (let i = 0; i < billboard.length; i++) {
            var agbillboard = new AgBillboard(billboard[i].name, billboard[i].positions, billboard[i].img, { scale: 0.8 });
            agbillboard.addToLayer(agFeatureLayer);
            if (billboard[i].name == 'updataHeight')
                this.updateEntity = agbillboard.agBillboard;
        }
        _this.sliceEntity = true;
    }

    //镜像点坐标点，重置初始四个坐标点
    retatedPoint(p, pCenter, angle) {
        var l = ((angle * Math.PI) / 180);
        var cosv = Math.cos(l);
        var sinv = Math.sin(l);
        var newX = ((p.x - pCenter.x) * cosv - (p.y - pCenter.y) * sinv + pCenter.x);
        var newY = ((p.x - pCenter.x) * sinv + (p.y - pCenter.y) * cosv + pCenter.y);
        var newZ = p.z;
        return new Cesium.Cartesian3(newX, newY, newZ);
    }
    // 计算拖动线后线与剖切原点的距离，pName1，pName2线的两端端点名称,pName3线段顺时针转的隔壁线段的点，pName4，修改的边的线段长名称
    computeLineDis(pName1, pName2, pName4, endPoint) {
        if (this.sliceType == "vertical" && pName4 == "afterward") this.computeMoveEndLine2(pName1, pName2, endPoint);
        else this.computeMoveEndLine(pName1, pName2, endPoint);

        var transform = agMath.computeTransformFromAngle(this.mercatorToCartesian(this.centerPoint), this.angleValue); // Cesium.Matrix4.fromRotationTranslation(rotation,this.mercatorToCartesian(this.centerPoint), new Cesium.Matrix4);
        var delta = agMath.computePartOffset(transform, this.mercatorToCartesian(this.centerPoint), this.mercatorToCartesian(this.linePoint[pName2]));

        var distance = delta.x;
        if (pName1.substring(0, 1) != pName2.substring(0, 1)) distance = delta.y;
        this[pName4] = -distance;

        if (pName4 == "left" || pName4 == "forward") this[pName4] = distance;
    }
    // 计算拖动线后，线的坐标，pName1，pName2线的两端端点名称，startPoint、endPoint鼠标拖动后的起点、终点坐标
    computeMoveEndLine(pName1, pName2, endPoint) {

        let tPoint = this.mercatorToCartesian(this.linePoint[pName1]);
        let bPoint = this.mercatorToCartesian(this.linePoint[pName2]);

        //计算线段两端在屏幕上的坐标
        var windowPoint1 =
            Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, tPoint);
        var windowPoint2 =
            Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, bPoint);


        let moveIntersection = this.computeIntersection(windowPoint1, windowPoint2, endPoint);
        let moveX = endPoint.x - moveIntersection.x;
        let moveY = endPoint.y - moveIntersection.y;

        var derection = "x";
        if (pName1.substring(0, 1) != pName2.substring(0, 1)) derection = "y";

        var delta = new Cesium.Cartesian3(moveX, moveY, 0);
        this.linePoint[pName1] = this.computePoint(tPoint, derection, delta);
        this.linePoint[pName2] = this.computePoint(bPoint, derection, delta);

    }

    // 计算纵剖情况下:拖动左或右的线后，线的坐标，pName1，pName2线的两端端点名称，endPoint鼠标拖动后的终点坐标
    computeMoveEndLine2(pName1, pName2, endPoint) {
        var point = this.getWebMercator(endPoint)
        let tPoint = this.linePoint[pName1];
        let bPoint = this.linePoint[pName2];
        let moveIntersection = this.computeIntersection(tPoint, bPoint, point);
        let moveX = point.x - moveIntersection.x;
        let moveY = point.y - moveIntersection.y;

        this.linePoint[pName1].x = tPoint.x + moveX;
        this.linePoint[pName2].x = bPoint.x + moveX;
        this.linePoint[pName1].y = tPoint.y + moveY;
        this.linePoint[pName2].y = bPoint.y + moveY;

    }

    //根据屏幕坐标移动的偏移量计算实际坐标
    computePoint(linePoint, direction, delta) {
        var cameraAngle = CIM.viewer.scene.camera.heading * 180 / Math.PI;
        var clipAngle = 360 - this.angleValue;
        var differentAngle = Math.abs(cameraAngle - clipAngle);

        if ((differentAngle > 45 && differentAngle < 135)) delta = new Cesium.Cartesian3(delta.y, -delta.x, delta.z);
        else if (differentAngle > 225 && differentAngle < 315) delta = new Cesium.Cartesian3(delta.y, -delta.x, delta.z);

        var param = 1; var minAngel = 45 + clipAngle; var maxAngle = 225 + clipAngle;
        if (clipAngle < 135 && (cameraAngle > minAngel && cameraAngle < maxAngle)) param = -1;
        else if (clipAngle > 135) {

            maxAngle = maxAngle > 360 ? Math.abs(360 - maxAngle) : maxAngle;
            if (minAngel > 360) {
                minAngel = Math.abs(360 - minAngel);
                if (cameraAngle > minAngel && cameraAngle < maxAngle) param = -1;
            } else {
                if (cameraAngle > minAngel || cameraAngle < maxAngle) param = -1;
            }
        }

        var scale = this.getScale();
        var mz = 0;
        var transform = agMath.computeTransformFromAngle(linePoint, this.angleValue);

        if (direction == "x")
            mz = new Cesium.Cartesian4(delta.x * scale * param, 0, 0, 0);
        else if (direction == "y")
            mz = new Cesium.Cartesian4(0, -delta.y * scale * param, 0, 0);
        var mz10 = Cesium.Matrix4.multiplyByTranslation(
            transform,
            mz,
            new Cesium.Matrix4()
        );

        var cartesian = Cesium.Matrix4.getTranslation(mz10, new Cesium.Cartesian3());

        var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度
        var position = coordinate.cartographicToMercatorCartesian3(this.viewer, cartographic);


        return position;

    }

    //计算屏幕与世界坐标的比例
    getScale() {
        let scene = CIM.viewer.scene;
        // 获取画布的大小
        var width = scene.canvas.clientWidth;
        var height = scene.canvas.clientHeight;

        // //获取画布中心两个像素的坐标（默认地图渲染在画布中心位置）
        var left = scene.camera.getPickRay(new Cesium.Cartesian2((width / 2) | 0, (height - 1) / 2));
        var right = scene.camera.getPickRay(new Cesium.Cartesian2(1 + (width / 2) | 0, (height - 1) / 2));


        var globe = scene.globe;
        var leftPosition = globe.pick(left, scene);
        var rightPosition = globe.pick(right, scene);

        if (!Cesium.defined(leftPosition) || !Cesium.defined(rightPosition)) {
            return;
        }

        var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
        var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(leftCartographic, rightCartographic);
        var distance = geodesic.surfaceDistance;//分辨率

        return distance;
    }

    // 计算点到线的垂直交点，p3 为线外点
    computeIntersection(p1, p2, p3) {
        let P = {};
        if (p1.x - p2.x == 0) {
            P.x = p1.x;
            P.y = p3.y;
        } else if (p1.y == p2.y) {
            P.x = p3.x;
            P.y = p1.y;
        } else {
            let A = (p1.y - p2.y) / (p1.x - p2.x);
            let B = p1.y - A * p1.x;
            let k = -1 / A;
            let m = p3.y - k * p3.x;
            let x = (m - B) / (A - k)
            P.x = x;
            P.y = A * x + B;
        }
        return new Cesium.Cartesian3(P.x, P.y, p3.z);
    }
    // 计算宽度
    computePanelWidth(position) {
        let width = this.viewerContainer.clientWidth;
        let heigth = this.viewerContainer.clientHeight;
        let wr = (width / 4);
        let hr = (heigth / 4);
        let minX, maxX, minY, maxY;
        if (position) {
            minX = Math.floor(position.x - wr) > 0 ? Math.floor(position.x - wr) : 0;
            maxX = Math.floor(position.x + wr) > width ? width : Math.floor(position.x + wr);
            minY = Math.floor(position.y - hr) > 0 ? Math.floor(position.y - hr) : 0;
            maxY = Math.floor(position.y + hr) > heigth ? heigth : Math.floor(position.y + hr);
        } else {
            minX = Math.floor(wr);
            maxX = Math.floor(wr * 3);
            minY = Math.floor(hr);
            maxY = Math.floor(hr * 3);
        };
        let points = {
            leftTop: coordinate.screenToCartesian(this.viewer, { x: minX, y: maxY }),
            rightTop: coordinate.screenToCartesian(this.viewer, { x: maxX, y: maxY }),
            rightBottom: coordinate.screenToCartesian(this.viewer, { x: maxX, y: minY }),
            leftBottom: coordinate.screenToCartesian(this.viewer, { x: minX, y: minY }),
        };
        let panelWidth = Math.floor(Cesium.Cartesian3.distance(points.leftTop, points.rightTop));
        return panelWidth;
    }
    // 计算四个点
    computeLinePoints() {
        let ltPoint = {
            x: this.centerPoint.x - this.panelWidth / 4,
            y: this.centerPoint.y + this.panelWidth / 4,
            z: this.centerPoint.z
        }
        let rtPoint = {
            x: this.centerPoint.x + this.panelWidth / 4,
            y: this.centerPoint.y + this.panelWidth / 4,
            z: this.centerPoint.z
        }
        let rbPoint = {
            x: this.centerPoint.x + this.panelWidth / 4,
            y: this.centerPoint.y - this.panelWidth / 4,
            z: this.centerPoint.z
        }
        let lbPoint = {
            x: this.centerPoint.x - this.panelWidth / 4,
            y: this.centerPoint.y - this.panelWidth / 4,
            z: this.centerPoint.z
        }

        if (this.sliceType == "vertical") {
            ltPoint = {
                x: this.centerPoint.x - this.panelWidth / 4,
                y: this.centerPoint.y,
                z: this.centerPoint.z + this.panelWidth / 4
            }
            rtPoint = {
                x: this.centerPoint.x + this.panelWidth / 4,
                y: this.centerPoint.y,
                z: this.centerPoint.z + this.panelWidth / 4
            }
            rbPoint = {
                x: this.centerPoint.x + this.panelWidth / 4,
                y: this.centerPoint.y,
                z: 0
            }
            lbPoint = {
                x: this.centerPoint.x - this.panelWidth / 4,
                y: this.centerPoint.y,
                z: 0
            }
        }

        let linePoint = {
            ltPoint: this.retatedPoint(ltPoint, this.centerPoint, this.angleValue),
            rtPoint: this.retatedPoint(rtPoint, this.centerPoint, this.angleValue),
            rbPoint: this.retatedPoint(rbPoint, this.centerPoint, this.angleValue),
            lbPoint: this.retatedPoint(lbPoint, this.centerPoint, this.angleValue)
        }
        return linePoint;
    }
    /**
     * 将屏幕坐标转换成。。坐标
    * @param {*} position 为屏幕坐标 
    */
    getWebMercator(position) {
        let cartesian = coordinate.screenToCartesian(this.viewer, position);
        // 世界坐标转换为投影坐标
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let viewPointWebMercator = coordinate.cartographicToMercatorCartesian3(this.viewer, cartographic)
        return viewPointWebMercator;
    }
    /**
     * 将投影坐标转换成世界坐标
    * @param {*} position  为getWebMercator获取的坐标
    */
    mercatorToCartesian(position) {
        let cartographic = coordinate.mercatorCartesian3ToCartographic(this.viewer, position);
        let point = coordinate.latitude(cartographic);
        var height = this.centerPoint.z;
        if (this.sliceType == "vertical")
            height = point.alt;
        let cartesian = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, height);
        return cartesian;
    }
    /**
    * 移除键盘按下事件
   */
    removeKeyDownListener() {
        var _this = this;
        document.removeEventListener("keydown", _this.addKeyDownListener, false);
    }
    /**
     * 移除鼠标监听事件
     */
    removeInputAction() {
        this.pickerHelper.remove("LEFT_CLICK");
        this.pickerHelper.remove("MOUSE_MOVE");
        this.pickerHelper.remove("LEFT_DOWN");
        this.pickerHelper.remove("LEFT_UP");
    }
    /**
     * 移除剖切面
     */
    removeClippingPlanes() {
        this.agSlice.removeClippingPlanes();
    }

    /**
     * 移除剖切框
     */
    removeEntity() {
        agFeatureLayer.removeAll();
    }

    dispose() {
        this.reset();
        this.removeEntity();
        this.removeInputAction();
        this.removeClippingPlanes();
        this.removeKeyDownListener();
    }
};

export default new SliceTool();