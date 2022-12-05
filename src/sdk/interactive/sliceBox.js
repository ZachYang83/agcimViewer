import agMath from "@/sdk/maths/math";
import agRevitHelper from "@/sdk/bim/revitHelper";
import PickerHelper from "@/sdk/interactive/pickerHelper";
/**
 *剖切盒子
 * @class SliceBox
 * @private
 */
class SliceBox {
    /**
     * 创建剖切盒子实例
     *Creates an instance of SliceBox.
     * @memberof SliceBox
     */
    constructor() {
        this.viewer;
        this.pickerHelper;
        this.selectedEntity;     //选中的实体，
        this.tileset;
        this.planeEntities;
    }
    start(vm, viewer) {
        this.vm = vm;
        this.viewer = viewer;
        this.pickerHelper = new PickerHelper(viewer);
        this.planeEntities = {};
        this.reset();
        this.setInputAction();

    }
    reset() {
        this.targetT = 0;
        this.targetB = 0;
        this.targetR = 0;
        this.targetT = 0;
        this.targetA = 0;
        this.targetF = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetZ = 0;
        this.centerOffer = null;
    }
    initClips(tileset) {
        let _this = this;

        this.tileset = tileset;
        var sphere = tileset.boundingSphere;
        var diameter = sphere.radius * 2;

        this.targetT = sphere.radius;
        this.targetB = sphere.radius;
        this.targetL = sphere.radius;
        this.targetR = sphere.radius;
        this.targetT = sphere.radius;
        this.targetA = sphere.radius;
        this.targetF = sphere.radius;

        var clippingPlanes = [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), this.targetT), //上
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, 1.0), this.targetB), //下
            new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0, 0.0), this.targetL),  //左
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0, 0.0), this.targetR),  //右 
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1, 0.0), this.targetF),  //前
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1, 0.0), this.targetA),   //后
        ];


        //计算局部坐标系偏移量
        var sphereCenter = tileset.boundingSphere.center;
        var transform = tileset._root.computedTransform;
        var root = Cesium.Matrix4.getTranslation(transform, new Cesium.Cartesian3);
        var offset = agMath.computePartOffset(transform, root, sphereCenter);

        this.centerOffer = offset;
        var modelMatrix = Cesium.Matrix4.fromTranslation(offset);

        let clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
            modelMatrix: modelMatrix,
            planes: clippingPlanes,
            unionClippingRegions: true,
            edgeColor: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
            edgeWidth: 1
        });


        var rotation = agMath.computeTilesetRotation(tileset);
        let rotationTransform = Cesium.Matrix4.fromRotationTranslation(rotation, Cesium.Cartesian3.ZERO, new Cesium.Matrix4);

        var lables = ["top", "bottom", "left", "right", "forward", "afterward"]
        for (var i = 0; i < clippingPlaneCollection.length; i++) {
            var clipPlane = clippingPlaneCollection.get(i);
            let plane = new Cesium.Plane(clipPlane.normal, clipPlane.distance);

            if (lables[i] != "top" && lables[i] != "bottom") {
                rotation = Cesium.Matrix3.IDENTITY;
                Cesium.Plane.transform(plane, rotationTransform, plane);
            }
            let planeV = new Cesium.CallbackProperty(updatePlane(plane, lables[i]), false);

            var entity = CIM.viewer.entities.add({
                position: new Cesium.CallbackProperty(updateposition(sphereCenter, lables[i]), false),
                name: lables[i],
                orientation: Cesium.Transforms.headingPitchRollQuaternion(
                    sphereCenter,
                    Cesium.HeadingPitchRoll.fromQuaternion(Cesium.Quaternion.fromRotationMatrix(rotation, new Cesium.Quaternion), new Cesium.HeadingPitchRoll)
                ),
                plane: {
                    dimensions: new Cesium.Cartesian2(
                        diameter,
                        diameter
                    ),

                    material: Cesium.Color.WHITE.withAlpha(0.2),
                    plane: planeV,
                    outline: true,
                    outlineColor: Cesium.Color.STEELBLUE,
                    outlineWidth: 4
                },
                show: true
            });

            this.planeEntities[lables[i]] = entity;
        }

        function updatePlane(plane, direction) {
            return function () {
                _this.updateHeight(plane, direction);
                return plane;
            };
        }

        function updateposition(tilesetPosition, direction) {
            return function () {
                var position = tilesetPosition;
                if (direction == "left" || direction == "right") {
                    position = agRevitHelper.getWorldPosition(
                        { X: _this.centerOffer.x, Y: -_this.offsetY + _this.centerOffer.y, Z: _this.offsetZ + _this.centerOffer.z },
                        tileset.root.computedTransform,
                    );
                    return position;
                }
                else if (direction == "top" || direction == "bottom") {
                    position = agRevitHelper.getWorldPosition(
                        { X: -_this.offsetX + _this.centerOffer.x, Y: -_this.offsetY + _this.centerOffer.y, Z: _this.centerOffer.z },
                        tileset.root.computedTransform,
                    );
                    return position;
                } else if (direction == "forward" || direction == "afterward") {
                    position = agRevitHelper.getWorldPosition(
                        { X: -_this.offsetX + _this.centerOffer.x, Y: _this.centerOffer.y, Z: _this.offsetZ + _this.centerOffer.z },
                        tileset.root.computedTransform,
                    );
                }
                return position;
            };
        }

        tileset.clippingPlanes = clippingPlaneCollection;
    }

    updateHeight(plane, direction) {

        if (direction == "top") {
            plane.distance = this.targetT;
        } else if (direction == "bottom") {
            plane.distance = this.targetB;
        }

        else if (direction == "left") {
            plane.distance = this.targetL;
        } else if (direction == "right") {
            plane.distance = this.targetR;
        }

        else if (direction == "forward") {
            plane.distance = this.targetF;
        } else if (direction == "afterward") {
            plane.distance = this.targetA;
        }
    }


    updateClippingPlane(direction, clippingPlaneCollection) {
        var tPlane = clippingPlaneCollection.get(0);
        var bPlane = clippingPlaneCollection.get(1);

        var lPlane = clippingPlaneCollection.get(2);
        var rPlane = clippingPlaneCollection.get(3);
        var fPlane = clippingPlaneCollection.get(4);
        var aPlane = clippingPlaneCollection.get(5);
        if (direction == "top") {
            this.updateHeight(tPlane, direction);
        } else if (direction == "left") {
            this.updateHeight(lPlane, direction);
        } else if (direction == "right") {
            this.updateHeight(rPlane, direction);
        } else if (direction == "forward") {
            this.updateHeight(fPlane, direction);
        } else if (direction == "afterward") {
            this.updateHeight(aPlane, direction);
        } else if (direction == "bottom") {
            this.updateHeight(bPlane, direction);
        }
    }


    /**
    * 添加鼠标监听事件
    */
    setInputAction() {
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.setInputActionLeftClick();
        this.setInputActionLeftDown();
        this.setInputActionMouseMove();
        this.setInputActionLeftUp();
    }
    setInputActionLeftClick() {
        var _this = this;
        this.pickerHelper.on("LEFT_CLICK", function (movement) {
            if (!_this.tileset) {
                var pickedObject = _this.viewer.scene.pick(movement.position); //判断是否拾取到模型
                if (Cesium.defined(pickedObject) && pickedObject.primitive) {
                    _this.tileset = pickedObject.primitive;
                    _this.initClips(_this.tileset);
                    _this.vm.msgShow = false;
                    _this.vm.newsliceShow = true;
                }
            }
        });
    }
    setInputActionLeftDown() {
        let _this = this;
        this.pickerHelper.on("LEFT_DOWN", function (event) {
            // 鼠标按下，选中实体
            var pickedObject = _this.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                if (pickedObject.id.plane) {
                    let entity = pickedObject.id;
                    entity.plane.material = Cesium.Color.STEELBLUE.withAlpha(0.5);
                    _this.selectedEntity = entity;
                }
            }
        });
    }

    /**
     * 添加鼠标移动监听事件
    */
    setInputActionMouseMove() {
        let _this = this;
        this.pickerHelper.on("MOUSE_MOVE", function (event) {


            // 选中线拖动改变框的大小
            if (_this.selectedEntity) {
                _this.viewer.scene.screenSpaceCameraController.enableInputs = false;
                let entity = _this.selectedEntity;

                let deltaY = event.startPosition.y - event.endPosition.y;

                var point = _this.viewer.scene.pickPosition(event.endPosition);
                var sphereCenter = _this.tileset.boundingSphere.center;
                var transform = _this.tileset._root.computedTransform;
                let delta = agMath.computePartOffset(transform, sphereCenter, point);



                if (entity.name == "top") {
                    _this.targetT += deltaY;
                    _this.offsetZ += deltaY / 2;
                    // var offset = delta.z - _this.targetT;
                    // _this.targetT += offset;
                    // _this.offsetZ += offset / 2;
                } else if (entity.name == "bottom") {
                    _this.targetB -= deltaY;
                    _this.offsetZ -= deltaY / 2;
                    // var offset = -delta.z - _this.targetB;
                    // _this.targetB += offset;
                    // _this.offsetZ -= offset / 2;
                }

                else if (entity.name == "left") {
                    var offset = -delta.x - _this.targetL;
                    _this.targetL += offset;
                    _this.offsetX += offset / 2;

                } else if (entity.name == "right") {
                    var offset = delta.x - _this.targetR;
                    _this.targetR += offset;
                    _this.offsetX -= offset / 2;

                }

                else if (entity.name == "forward") {

                    var offset = -delta.y - _this.targetF;
                    _this.targetF += offset;
                    _this.offsetY += offset / 2;
                } else if (entity.name == "afterward") {

                    var offset = delta.y - _this.targetA;
                    _this.targetA += offset;
                    _this.offsetY -= offset / 2;
                }

                _this.planeEntities["left"].plane.dimensions = new Cesium.Cartesian2(
                    _this.targetF + _this.targetA,
                    _this.targetT + _this.targetB
                )

                _this.planeEntities["right"].plane.dimensions = new Cesium.Cartesian2(
                    _this.targetF + _this.targetA,
                    _this.targetT + _this.targetB
                )


                _this.planeEntities["forward"].plane.dimensions = new Cesium.Cartesian2(
                    _this.targetL + _this.targetR,
                    _this.targetT + _this.targetB
                )


                _this.planeEntities["afterward"].plane.dimensions = new Cesium.Cartesian2(
                    _this.targetL + _this.targetR,
                    _this.targetT + _this.targetB
                )

                _this.planeEntities["top"].plane.dimensions = new Cesium.Cartesian2(
                    _this.targetL + _this.targetR,
                    _this.targetF + _this.targetA,
                )

                _this.planeEntities["bottom"].plane.dimensions = new Cesium.Cartesian2(
                    _this.targetL + _this.targetR,
                    _this.targetF + _this.targetA,
                )

                _this.updateClippingPlane(entity.name, _this.tileset.clippingPlanes)
            }

        });
    }

    setInputActionLeftUp() {
        let _this = this;
        this.pickerHelper.on("LEFT_UP", (function (event) {
            if (Cesium.defined(_this.selectedEntity)) {
                if (_this.selectedEntity.plane) {
                    _this.selectedEntity.plane.material = Cesium.Color.WHITE.withAlpha(0.2);
                }
                _this.selectedEntity = undefined;
            }
            _this.viewer.scene.screenSpaceCameraController.enableInputs = true;
        }));
    }

    /**
     * 移除鼠标监听事件
    */
    removeScreenSpaceEvent() {
        this.pickerHelper.remove("LEFT_CLICK");
        this.pickerHelper.remove("MOUSE_MOVE");
        this.pickerHelper.remove("LEFT_DOWN");
        this.pickerHelper.remove("LEFT_UP");
    }

    removeAll() {
        this.tileset.clippingPlanes.removeAll();
        for (let key in this.planeEntities) {
            this.viewer.entities.remove(this.planeEntities[key]);
        }
        this.planeEntities = {};
        this.tileset = null;

    }

    /**
     * 关闭功能
    */
    dispose() {
        this.removeAll();
        this.removeScreenSpaceEvent();
    }
}

var sliceBox = new SliceBox();
export default sliceBox;