import PickerHelper from "@/sdk/interactive/pickerHelper";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer;
// 坐标轴对象，entity
let axis = {};
let circle = {};
// 坐标轴顶点坐标
let axisEndPos = {};
let circlePoss = {};
// 选中的坐标轴
let selectedAxis;
let selectedCircle;
let modelObj;
let modelType;
// 模型坐标原点世界坐标
let originPos = new Cesium.Cartesian3();
let transform = new Cesium.Matrix4();
let modelMatrix = new Cesium.Matrix4();
//坐标轴颜色
let color = new Cesium.Color();
class AdjustModel {
  constructor() {
    this.viewer = null;
    this.listener = null;
    this.toolType = undefined;
    this.scalarNumByCam = 1;
    this.pickerHelper = null;
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }

  initialize(viewer) {
    this.viewer = viewer;
    this.pickerHelper = new PickerHelper(viewer);
  }

  /**
   * 设置要调整的模型
   * @static
   * @param {*} model
   * @memberof AdjustModel
   */
  setModel(model, type) {
    let _this = this;
    modelObj = model;
    modelType = type;
    _this.initPos();
    // modelObj.readyPromise.then(() => {
    if (axis.x) {
      _this.dispose();
    }
    _this.initTriAxis();
    _this.initTriCircle();
    _this.initListener();
    // });
  }

  useTriAxis() {
    if (Cesium.defined(selectedAxis)) {
      this.setAxisSelected(selectedAxis, false);
      selectedAxis = undefined;
    }
    if (this.toolType != "TriAxis") {
      this.setTriCircleShow(false);
    }
    this.setTriAxisShow(true);
    this.toolType = "TriAxis";
  }

  useTriCircle() {
    if (Cesium.defined(selectedCircle)) {
      this.setAxisSelected(selectedCircle, false);
      selectedCircle = undefined;
    }
    if (this.toolType != "TriCircle") {
      this.setTriAxisShow(false);
    }
    this.setTriCircleShow(true);
    this.toolType = "TriCircle";
  }

  initPos() {
    if (modelType == "tileset") {
      modelMatrix = modelObj.root.transform;
    } else if (modelType == "gltfPrimitive") {
      modelMatrix = modelObj.modelMatrix;
    } else if (modelType == "gltfEntity") {
      var modelPosition = modelObj.position._value;
      var matrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelPosition);
      modelMatrix = matrix;
    }
    Cesium.Matrix4.getTranslation(modelMatrix, originPos);
    transform = Cesium.Transforms.eastNorthUpToFixedFrame(originPos);
  }

  initTriAxis() {
    axisEndPos.x = Cesium.Matrix4.multiplyByPoint(
      transform,
      Cesium.Cartesian3.UNIT_X,
      new Cesium.Cartesian3()
    );
    axisEndPos.y = Cesium.Matrix4.multiplyByPoint(
      transform,
      Cesium.Cartesian3.UNIT_Y,
      new Cesium.Cartesian3()
    );
    axisEndPos.z = Cesium.Matrix4.multiplyByPoint(
      transform,
      Cesium.Cartesian3.UNIT_Z,
      new Cesium.Cartesian3()
    );
    axis.x = this.createAxis("xAxis", "X轴", Cesium.Color.RED);
    axis.y = this.createAxis("yAxis", "Y轴", Cesium.Color.GREEN);
    axis.z = this.createAxis("zAxis", "Z轴", Cesium.Color.BLUE);
  }

  /**
   * 创建坐标轴
   * @param {*} id 
   * @param {*} label 
   * @param {*} color 
   */
  createAxis(id, label, color) {
    let entity = agFeatureLayer.addEntity({
      id: id,
      show: false,
      position: new Cesium.CallbackProperty(() => {
        switch (label) {
          case "X轴":
            return axisEndPos.x;
          case "Y轴":
            return axisEndPos.y;
          case "Z轴":
            return axisEndPos.z;
        }
      }, false),
      // label: {
      //   text: label,
      //   eyeOffset: new Cesium.Cartesian3(1, 1, 1),
      //   fillColor: Cesium.Color.WHITE
      // },
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          switch (label) {
            case "X轴":
              return [originPos, axisEndPos.x];
            case "Y轴":
              return [originPos, axisEndPos.y];
            case "Z轴":
              return [originPos, axisEndPos.z];
          }
        }, false),
        width: 20,
        material: new Cesium.PolylineArrowMaterialProperty(color)
      }
    });
    entity.type = "axis";
    return entity;
  }

  initTriCircle() {
    this.computeCircle();
    circle.h = this.createCircle("heading", Cesium.Color.RED);
    circle.p = this.createCircle("pitch", Cesium.Color.GREEN);
    circle.r = this.createCircle("roll", Cesium.Color.BLUE);
  }

  createCircle(id, color) {
    let entity = agFeatureLayer.addEntity({
      id: id,
      show: false,
      position: new Cesium.CallbackProperty(() => {
        switch (id) {
          case "heading":
            return circlePoss.h[6];
          case "pitch":
            return circlePoss.p[6];
          case "roll":
            return circlePoss.r[6];
        }
      }, false),
      // label: {
      //   text: id,
      //   eyeOffset: new Cesium.Cartesian3(1, 1, 1),
      //   fillColor: Cesium.Color.WHITE
      // },
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          switch (id) {
            case "heading":
              return circlePoss.h;
            case "pitch":
              return circlePoss.p;
            case "roll":
              return circlePoss.r;
          }
        }, false),
        width: 6,
        material: color
      }
    });
    entity.type = "circle";
    return entity;
  }

  /**
   * 更新模型位置 
   */
  initListener() {
    let _this = this;
    let scratchCamToModelVector = new Cesium.Cartesian3();
    _this.listener = _this.viewer.scene.preRender.addEventListener(() => {
      transform = Cesium.Transforms.eastNorthUpToFixedFrame(originPos);
      Cesium.Cartesian3.subtract(
        _this.viewer.camera.position,
        originPos,
        scratchCamToModelVector
      );
      let dis = Cesium.Cartesian3.magnitude(scratchCamToModelVector);
      _this.scalarNumByCam = dis / 8;
      _this.computeAxis();
      _this.computeCircle();
    });
    _this.initMouseListener();
  }

  computeAxis() {
    Cesium.Cartesian3.multiplyByScalar(
      Cesium.Cartesian3.UNIT_X,
      this.scalarNumByCam,
      axisEndPos.x
    );
    Cesium.Cartesian3.multiplyByScalar(
      Cesium.Cartesian3.UNIT_Y,
      this.scalarNumByCam,
      axisEndPos.y
    );
    Cesium.Cartesian3.multiplyByScalar(
      Cesium.Cartesian3.UNIT_Z,
      this.scalarNumByCam,
      axisEndPos.z
    );
    Cesium.Matrix4.multiplyByPoint(transform, axisEndPos.x, axisEndPos.x);
    Cesium.Matrix4.multiplyByPoint(transform, axisEndPos.y, axisEndPos.y);
    Cesium.Matrix4.multiplyByPoint(transform, axisEndPos.z, axisEndPos.z);
  }

  computeCircle() {
    circlePoss.h = this.computeCirclePos("heading");
    circlePoss.p = this.computeCirclePos("pitch");
    circlePoss.r = this.computeCirclePos("roll");
  }

  computeCirclePos(circleType) {
    let scratchPointOnCircle = new Cesium.Cartesian3();
    let positions = [];
    let i = 0;
    let radius = this.scalarNumByCam;
    for (i = 0; i <= 360; i += 6) {
      let radians = Cesium.Math.toRadians(i);
      if (circleType == "heading") {
        scratchPointOnCircle = new Cesium.Cartesian3(
          radius * Math.cos(radians),
          radius * Math.sin(radians),
          0
        );
      } else if (circleType == "pitch") {
        scratchPointOnCircle = new Cesium.Cartesian3(
          radius * Math.cos(radians),
          0,
          radius * Math.sin(radians)
        );
      } else if (circleType == "roll") {
        scratchPointOnCircle = new Cesium.Cartesian3(
          0,
          radius * Math.cos(radians),
          radius * Math.sin(radians)
        );
      }
      Cesium.Matrix4.multiplyByPoint(
        modelMatrix,
        scratchPointOnCircle,
        scratchPointOnCircle
      );
      positions.push(scratchPointOnCircle);
    }
    return positions;
  }

  initMouseListener() {
    let _this = this;
    let scene = _this.viewer.scene;
    let invModelMatrix = new Cesium.Matrix4();
    let rotEndOn3D = new Cesium.Cartesian2();
    let rotStartOn3D = new Cesium.Cartesian2();
    let rotEndOn2D = new Cesium.Cartesian2();
    let rotStartOn2D = new Cesium.Cartesian2();
    let scratchRotation = new Cesium.Matrix3();
    let scratchAngle;
    let scratchOrigin2D = new Cesium.Cartesian3();
    let scratchNormal = new Cesium.Cartesian3();
    let scratchAxisVector3D = new Cesium.Cartesian3();
    let scratchAxisVector2D = new Cesium.Cartesian2();
    let scratchDelta3D = new Cesium.Cartesian3();
    let scratchDelta2D = new Cesium.Cartesian2();

    //左键点击事件
    _this.pickerHelper.on("LEFT_CLICK", function (movement) {
      var pickedObject = scene.pick(movement.position);
      if (pickedObject && pickedObject.id && pickedObject.id.polyline) {
        if (pickedObject.id.type === "axis") {
          if (selectedAxis) {
            _this.setAxisSelected(selectedAxis, false);
          }
          selectedAxis = pickedObject;
          _this.setAxisSelected(selectedAxis, true);
        } else if (pickedObject.id.type === "circle") {
          if (selectedCircle) {
            _this.setAxisSelected(selectedCircle, false);
          }
          selectedCircle = pickedObject;
          _this.setAxisSelected(selectedCircle, true);
        }
      } else {
        if (Cesium.defined(selectedAxis)) {
          _this.setAxisSelected(selectedAxis, false);
          selectedAxis = undefined;
        }
        if (Cesium.defined(selectedCircle)) {
          _this.setAxisSelected(selectedCircle, false);
          selectedCircle = undefined;
        }
      }
    });

    //鼠标移动事件
    _this.pickerHelper.on("MOUSE_MOVE", function (movement) {
      Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        originPos,
        scratchOrigin2D
      );
      if (Cesium.defined(selectedAxis)) {
        Cesium.Cartesian2.subtract(
          movement.endPosition,
          movement.startPosition,
          scratchDelta2D
        );
        if (selectedAxis.id.id === "xAxis") {
          Cesium.Cartesian3.subtract(
            axisEndPos.x,
            originPos,
            scratchAxisVector3D
          );
          Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            scene,
            axisEndPos.x,
            scratchAxisVector2D
          );
        } else if (selectedAxis.id.id === "yAxis") {
          Cesium.Cartesian3.subtract(
            axisEndPos.y,
            originPos,
            scratchAxisVector3D
          );
          Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            scene,
            axisEndPos.y,
            scratchAxisVector2D
          );
        } else if (selectedAxis.id.id === "zAxis") {
          Cesium.Cartesian3.subtract(
            axisEndPos.z,
            originPos,
            scratchAxisVector3D
          );
          Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            scene,
            axisEndPos.z,
            scratchAxisVector2D
          );
        }
        Cesium.Cartesian2.subtract(
          scratchAxisVector2D,
          scratchOrigin2D,
          scratchAxisVector2D
        );
        if (scratchAxisVector3D) {
          let dis =
            Cesium.Cartesian2.dot(scratchDelta2D, scratchAxisVector2D) /
            Cesium.Cartesian2.magnitudeSquared(scratchAxisVector2D);
          Cesium.Cartesian3.normalize(scratchAxisVector3D, scratchNormal);
          let axisLength = Cesium.Cartesian3.magnitude(scratchAxisVector3D);
          Cesium.Cartesian3.multiplyByScalar(
            scratchNormal,
            dis * axisLength,
            scratchDelta3D
          );
          Cesium.Cartesian3.add(originPos, scratchDelta3D, originPos);
          Cesium.Cartesian3.add(axisEndPos.x, scratchDelta3D, axisEndPos.x);
          Cesium.Cartesian3.add(axisEndPos.y, scratchDelta3D, axisEndPos.y);
          Cesium.Cartesian3.add(axisEndPos.z, scratchDelta3D, axisEndPos.z);
        }
        if (modelObj) {
          Cesium.Matrix4.setTranslation(
            modelMatrix,
            originPos,
            modelMatrix
          );
          if (modelType == "gltfEntity") {
            modelObj.position._value = new Cesium.Cartesian3(modelMatrix[12], modelMatrix[13], modelMatrix[14]);
          }
        }
      }
      if (Cesium.defined(selectedCircle)) {
        //鼠标移动开始点与模型原点向量
        Cesium.Cartesian2.subtract(
          movement.startPosition,
          scratchOrigin2D,
          rotStartOn2D
        );
        //鼠标移动结束点与模型原点向量
        Cesium.Cartesian2.subtract(
          movement.endPosition,
          scratchOrigin2D,
          rotEndOn2D
        );
        scratchAngle = Cesium.Cartesian2.angleBetween(rotEndOn2D, rotStartOn2D); //两向量间角度
        rotStartOn3D.x = rotStartOn2D.x;
        rotStartOn3D.y = rotStartOn2D.y;
        rotStartOn3D.z = 0;
        rotEndOn3D.x = rotEndOn2D.x;
        rotEndOn3D.y = rotEndOn2D.y;
        rotEndOn3D.z = 0;
        Cesium.Cartesian3.cross(rotStartOn3D, rotEndOn3D, scratchNormal);//计算两个笛卡尔的叉（外）乘积。
        if (scratchNormal.z > 0) {
          scratchAngle = -scratchAngle;
        }
        Cesium.Matrix4.inverse(modelMatrix, invModelMatrix);//计算所提供矩阵的逆
        let directionInTransform = Cesium.Matrix4.multiplyByPoint( //计算矩阵与 Cartesian3 的乘积
          invModelMatrix,
          _this.viewer.camera.positionWC,
          new Cesium.Cartesian3()
        );
        let angle;
        if (selectedCircle.id.id === "heading") {
          Cesium.Plane.projectPointOntoPlane( //将点投影到平面上
            Cesium.Plane.ORIGIN_ZX_PLANE,
            directionInTransform,
            directionInTransform
          );
          angle = Cesium.Cartesian3.angleBetween(//返回所提供的笛卡尔坐标之间的角度
            directionInTransform,
            Cesium.Cartesian3.UNIT_Z
          );
          if (Math.abs(angle) > Math.PI / 2) {
            scratchAngle = -scratchAngle;
          }
          Cesium.Matrix3.fromRotationZ(scratchAngle, scratchRotation);
        } else if (selectedCircle.id.id === "pitch") {
          Cesium.Plane.projectPointOntoPlane(
            Cesium.Plane.ORIGIN_YZ_PLANE,
            directionInTransform,
            directionInTransform
          );
          angle = Cesium.Cartesian3.angleBetween(
            directionInTransform,
            Cesium.Cartesian3.UNIT_Y
          );
          if (Math.abs(angle) > Math.PI / 2) {
            scratchAngle = -scratchAngle;
          }
          Cesium.Matrix3.fromRotationY(scratchAngle, scratchRotation);
        } else if (selectedCircle.id.id === "roll") {
          Cesium.Plane.projectPointOntoPlane(
            Cesium.Plane.ORIGIN_XY_PLANE,
            directionInTransform,
            directionInTransform
          );
          angle = Cesium.Cartesian3.angleBetween(
            directionInTransform,
            Cesium.Cartesian3.UNIT_X
          );
          if (Math.abs(angle) > Math.PI / 2) {
            scratchAngle = -scratchAngle;
          }
          Cesium.Matrix3.fromRotationX(scratchAngle, scratchRotation);
        }
        if (modelObj) {
          Cesium.Matrix4.multiplyByMatrix3(
            modelMatrix,
            scratchRotation,
            modelMatrix
          );
          if (modelType == "gltfEntity") {
            var hpr;
            if (!modelObj.angle) {
              modelObj.angle = 0;
            }
            var roateAngle = modelObj.angle + scratchAngle;
            if (selectedCircle.id.id === "heading") {
              hpr = new Cesium.HeadingPitchRoll(
                -roateAngle,
                0,
                0
              );
            } else if (selectedCircle.id.id === "pitch") {
              hpr = new Cesium.HeadingPitchRoll(
                0,
                -roateAngle,
                0
              );
            } else if (selectedCircle.id.id === "roll") {
              hpr = new Cesium.HeadingPitchRoll(
                0,
                0,
                roateAngle
              );
            }
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(
              modelObj.position._value,
              hpr
            );
            modelObj.orientation = orientation;
            modelObj.angle = roateAngle;
          }
        }
      }
    });
  }

  /**
   * 设置坐标轴选中
   * @param {*} axis 
   * @param {*} selected 
   */
  setAxisSelected(axis, selected) {
    if (selected) {
      color = axis.id.polyline.material.color.getValue(Cesium.JulianDate.now());
      axis.id.polyline.material.color.setValue(Cesium.Color.YELLOW);
    } else {
      axis.id.polyline.material.color.setValue(color);
    }
  }

  setTriAxisShow(show) {
    for (const key in axis) {
      axis[key].show = show;
    }
  }

  setTriCircleShow(show) {
    for (const key in circle) {
      circle[key].show = show;
    }
  }

  /**
   * 移除坐标轴
   */
  remove() {
    agFeatureLayer.removeAll();
    axis.x = undefined;
    axis.y = undefined;
    axis.z = undefined;
    circle.h = undefined;
    circle.p = undefined;
    circle.r = undefined;
  }

  /**
   * 移除事件监听
   */
  removeListener() {
    this.viewer.scene.preRender.removeEventListener(this.listener);
    this.pickerHelper.remove("LEFT_CLICK");
    this.pickerHelper.remove("MOUSE_MOVE");
  }

  dispose() {
    this.remove();
    this.removeListener();
    this.toolType = undefined;
  }
}

export default new AdjustModel();
