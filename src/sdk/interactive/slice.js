/**
 * Class 剖切类
 */
import coordinate from "@/sdk/maths/coordinate";

class Slice {
  /**
   * 构造函数
   * @param {viewer} viewer viewer视图对象
   */
  constructor(viewer) {
    this.viewer = viewer;
    this.sliceLayer = null;
    this.tileAngle = null;
    this.clippingPlanes = [];
  }
  /**
   * 创建剖切面
   * @param {object} layer 执行剖切的图层
   * @param {cartesian3} centerPoint 剖切中心点
   * @param {number} options.forward 前方向剖切距离
   * @param {number} options.afterward 后方向剖切距离
   * @param {number} options.left 左方向剖切距离
   * @param {number} options.right 右方向剖切距离
   * @param {number} options.top 上方向剖切距离
   * @param {number} options.bottom 下方向剖切距离
   * @return {object} 剖切面板集合
   */
  createClippingPlane(layer, centerPoint, options, initialAngle = 0) {
    this.sliceLayer = layer;
    let modelMatrix = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(0.0, 0.0, 0.0));
    var transform = this.sliceLayer._root.computedTransform;

    let cp = coordinate.mercatorCartesian3ToCartographic(this.viewer, centerPoint);

    //3dtiles的旋转矩阵
    var tileMatrix3 = Cesium.Matrix4.getMatrix3(transform, new Cesium.Matrix3);

    //当前经纬度下的旋转矩阵
    var positionMatrax4 = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Matrix4.getTranslation(transform, new Cesium.Cartesian3)
    );
    var positionMatrax3 = Cesium.Matrix4.getMatrix3(positionMatrax4, new Cesium.Matrix3);

    
    //根据逆矩阵求所旋转的矩阵
    var inverseMatrix3 = Cesium.Matrix3.inverse(positionMatrax3, new Cesium.Matrix3);
    var rotation = Cesium.Matrix3.multiply(inverseMatrix3, tileMatrix3, new Cesium.Matrix3);
    var rotationTransform = new Cesium.Matrix4(rotation[0], rotation[1], rotation[2], 0,
      rotation[3], rotation[4], rotation[5], 0,
      rotation[6], rotation[7], rotation[8], 0,
      0, 0, 0, 1)

    //根据逆矩阵求局部坐标系偏移量
    var position = coordinate.cartographicToCartesian3(cp);
    var inverseMatrix4 = Cesium.Matrix4.inverse(transform, new Cesium.Matrix4);
    var resultMatrix = new Cesium.Matrix4(transform[0], transform[4], transform[8], position.x,
      transform[1], transform[5], transform[9], position.y,
      transform[2], transform[6], transform[10], position.z,
      transform[3], transform[7], transform[11], 1);
    var offsetMatrix = Cesium.Matrix4.multiply(inverseMatrix4, resultMatrix, new Cesium.Matrix3);

    modelMatrix = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(offsetMatrix[12], offsetMatrix[13], offsetMatrix[14]));


    this._initClipingPlane(initialAngle, options, rotationTransform);

    let clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
      modelMatrix: modelMatrix,
      planes: this.clippingPlanes,
      unionClippingRegions: false,
      edgeColor: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
      edgeWidth: 1
    });
    this.tileTransform = rotationTransform;
    return clippingPlaneCollection;
  }

  /**
   * 初始化剖切面
   * @param {number} angle 角度
   * @param {object} options 剖切方向
   * @private
   */
  _initClipingPlane(angle, options, transform) {
    angle = angle * Math.PI / 180;
    
    if (!isNaN(options.top)) {
      var panle = new Cesium.Plane(new Cesium.Cartesian3(0.0, 0.0, -1.0), options.top);
      Cesium.Plane.transform(panle, transform, panle);
      var clipPlane = new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), options.top);
      Cesium.ClippingPlane.fromPlane(panle, clipPlane);
      this.clippingPlanes.push(clipPlane);
    }
    if (!isNaN(options.left)) {
      var panle = new Cesium.Plane(new Cesium.Cartesian3(-Math.cos(angle), -Math.sin(angle), 0), options.left);
      Cesium.Plane.transform(panle, transform, panle);
      var clipPlane = Cesium.ClippingPlane.fromPlane(panle, new Cesium.ClippingPlane(new Cesium.Cartesian3(1, 0.0, 0), options.left));
      this.clippingPlanes.push(clipPlane);
    }
    if (!isNaN(options.right)) {
      var panle = new Cesium.Plane(new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0), options.right);
      Cesium.Plane.transform(panle, transform, panle);
      var clipPlane = Cesium.ClippingPlane.fromPlane(panle, new Cesium.ClippingPlane(new Cesium.Cartesian3(-1, 0.0, 0), options.right));
      this.clippingPlanes.push(clipPlane);
    }
    if (!isNaN(options.forward)) {
      var panle = new Cesium.Plane(new Cesium.Cartesian3(Math.sin(angle), -Math.cos(angle), 0), options.forward);
      Cesium.Plane.transform(panle, transform, panle);
      var clipPlane = Cesium.ClippingPlane.fromPlane(panle, new Cesium.ClippingPlane(new Cesium.Cartesian3(0, 1, 0), options.forward));
      this.clippingPlanes.push(clipPlane);
    }
    if (!isNaN(options.afterward)) {
      var panle = new Cesium.Plane(new Cesium.Cartesian3(-Math.sin(angle), Math.cos(angle), 0), options.afterward);
      Cesium.Plane.transform(panle, transform, panle);
      var clipPlane = Cesium.ClippingPlane.fromPlane(panle, new Cesium.ClippingPlane(new Cesium.Cartesian3(0, -1, 0), options.afterward));
      this.clippingPlanes.push(clipPlane);
    }
    if (!isNaN(options.bottom)) {
      var panle = new Cesium.Plane(new Cesium.Cartesian3(0, 0, 1), options.bottom);
      Cesium.Plane.transform(panle, transform, panle);
      var clipPlane = Cesium.ClippingPlane.fromPlane(panle, new Cesium.ClippingPlane(new Cesium.Cartesian3(0, 0, 1), options.bottom));
      this.clippingPlanes.push(clipPlane);
    }

  }

  /**
   * 更新剖切面
   * @param {string} direction 剖切方向 forward、afterward、left、right、top
   * @param {object} clippingPlaneCollection 剖切面
   * @param {number} distance 剖切距离
   * @param {number} angle 角度
   */
  updateClippingPlane(direction, clippingPlaneCollection, distance, angle) {
    var hPlane = clippingPlaneCollection.get(0);
    var lPlane = clippingPlaneCollection.get(1);
    var rPlane = clippingPlaneCollection.get(2);
    var fPlane = clippingPlaneCollection.get(3);
    var aPlane = clippingPlaneCollection.get(4);
    var dPlane = clippingPlaneCollection.get(5);
    angle = angle * Math.PI / 180;
    if (direction == "top") {
      this._updateHeight(hPlane, distance);
    } else if (direction == "left") {
      this._updateLWidth(lPlane, distance, angle);
    } else if (direction == "right") {
      this._updateRWidth(rPlane, distance, angle);
    } else if (direction == "forward") {
      this._updateFWidth(fPlane, distance, angle);
    } else if (direction == "afterward") {
      this._updateAWidth(aPlane, distance, angle);
    } else if (direction == "bottom") {
      this._updateHeight(dPlane, distance);
    }
  }

  _updateHeight(plane, distance) {
    plane.distance = distance;
  }
  _updateLWidth(plane, distance, angle) {
    plane.distance = distance;
    var panle = new Cesium.Plane(new Cesium.Cartesian3(-Math.cos(angle), -Math.sin(angle), 0), distance);
    Cesium.Plane.transform(panle, this.tileTransform , panle);
    plane.normal =panle.normal;
  }
  _updateRWidth(plane, distance, angle) {
    plane.distance = distance;
    var panle = new Cesium.Plane(new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0), distance);
    Cesium.Plane.transform(panle, this.tileTransform , panle);
    plane.normal = panle.normal;
  }
  _updateFWidth(plane, distance, angle) {
    plane.distance = distance;
    var panle = new Cesium.Plane(new Cesium.Cartesian3(Math.sin(angle), -Math.cos(angle), 0), distance);
    Cesium.Plane.transform(panle, this.tileTransform , panle);
    plane.normal = panle.normal;;
  }
  _updateAWidth(plane, distance, angle) {
    plane.distance = distance;
    var panle = new Cesium.Plane(new Cesium.Cartesian3(-Math.sin(angle), Math.cos(angle), 0),distance);
    Cesium.Plane.transform(panle, this.tileTransform , panle);
    plane.normal = panle.normal;
    return plane;
  }

  //根据旋转矩阵计算旋转值
  _matrix2Angle(rotateMatrix) {
    //判断cosy是否为0
    var sy = Math.sqrt(rotateMatrix[0] * rotateMatrix[0] + rotateMatrix[3] * rotateMatrix[3]);
    var singular = sy < 1e-6;
    var x, y, z;
    if (!singular) {
      x = Math.atan2(rotateMatrix[7], rotateMatrix[8]);
      y = Math.atan2(-rotateMatrix[6], sy);
      z = Math.atan2(rotateMatrix[3], rotateMatrix[0]);
    }
    else {
      //cosy为0时假设z旋转值为0
      x = Math.atan2(-rotateMatrix[5], rotateMatrix[4]);
      y = Math.atan2(-rotateMatrix[6], sy);
      z = 0;
    }
    var result = new Cesium.Cartesian3(x * (180.0 / Math.PI), y * (180.0 / Math.PI), z * (180.0 / Math.PI));
    return result;
  }

  //计算对应纬度的纬度圈周长
  _computePerimeter(latitude) {
    var semiaxis = 6378137; //椭球体长半轴
    var angle = (latitude * Math.PI) / 180
    var r = Math.cos(angle) * semiaxis;
    var perimeter = 2 * Math.PI * r;  //圆周长
    return perimeter;
  }

  /**
   * 移除剖切面
   */
  removeClippingPlanes() {
    if (this.sliceLayer) {
      this.sliceLayer.clippingPlanes.removeAll();
      this.sliceLayer = null;
      this.tileAngle = 0;
      this.clippingPlanes = [];
    }
  }
}
export default Slice;