/**
 * 模型剖切|
 */
class SliceTool {
  constructor() {
    this._planeEntity = null;
    this.initialAngle = 50;
    this.angleValue = ((this.initialAngle * Math.PI) / 180);
    this.boxClippingPlanes = [
      new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.cos(this.angleValue), Math.sin(this.angleValue), 0.0), -30),       //右 
      new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.cos(this.angleValue), -Math.sin(this.angleValue), 0.0), -50),    //左 
      new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.sin(this.angleValue), Math.cos(this.angleValue), 0.0), -70),     //后
      new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.sin(this.angleValue), -Math.cos(this.angleValue), 0.0), -10)     //前
    ];
    this.entities = [];
  }
  /**
   * 创建剖切,剖切整个模型，后台传入 viewer, layer, heigth
   * @param {object} view  地图 viewer  
   * @param {object} layer  剖切的三维图层
   * @param {number} heigth 剖切高度\距离
   */
  createSlice(viewer, layer, heigth) {
    this.cleanPlane(viewer);
    this.clippingPlane(viewer, layer, heigth);
    this.clippingLayer = layer;
  }
  /**
   * 获取要剖切的图层，，暂时写死用
   */
  getClipLayer() {
    let layers = CIM.layerTree._aglayers;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].id == "a36b6b9f-c5e6-4df7-a0da-be9583472d0a") {
        var layer = layers[i]._primitives[0];
        this._baseClipLayer = layer;
      }
    }
  }
  /**
   * 创建剪切平面，后台传入planes
   * @param {Array} planes  地图 ClippingPlane数组，用于选择性地禁用每个平面外部的渲染
   * @param {object} modelMatrix  模型矩阵
   */
  createClippingPlane(planes, modelMatrix) {

    var modelMatrix1 = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(0.0, 0.0, 0.0));
    var modelMatrix2 = modelMatrix || modelMatrix1
    let clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
      modelMatrix: modelMatrix2,
      planes: planes,
      unionClippingRegions: false,
      edgeWidth: 1
    });
    return clippingPlaneCollection;
  }
  /**
   * 执行剖切，参数如 createSlice 方法
   */
  clippingPlane(viewer, layer, floor) {
    var viewer = CIM.viewer;
    var startHeight = 0;
    if (layer && layer.boundingSphere) {
      var cartographic = Cesium.Cartographic.fromCartesian(
        layer.boundingSphere.center
      );
      var lat = Cesium.Math.toDegrees(cartographic.latitude);
      var lng = Cesium.Math.toDegrees(cartographic.longitude);
      var clippingPlanes = [
        new Cesium.ClippingPlane(
          new Cesium.Cartesian3(0.0, 0.0, -1.0),
          startHeight + floor - cartographic.height
        ),
      ];
      layer.clippingPlanes = this.createClippingPlane(clippingPlanes);
      var position = Cesium.Cartesian3.fromDegrees(lng, lat, startHeight + floor);
      var plane = layer.clippingPlanes.get(0);
      var clippingPlaneEntity = this.addPlaneEntity(viewer, position, plane);
      this._planeEntity = clippingPlaneEntity;
    }

  }
  // 剖切 范围  todo  目前图层写死，中心点写死，旋转角度写死，，
  addBoxClippingPlane(layer) {
    var viewer = CIM.viewer;
    this.getClipLayer();
    var position = new Cesium.Cartesian3(
        -2228099.8861425673,
        5455364.450605256,
        2432398.072818908
      );

    let modelMatrix = Cesium.Matrix4.fromTranslation(
      new Cesium.Cartesian3(0.0, 0.0, 0.0)
    );
    layer = this._baseClipLayer || layer;
    if (layer.boundingSphere && layer.boundingSphere.center) {
      let boundingSphere = layer.boundingSphere;
      let boundingCenter = Cesium.Cartographic.fromCartesian(
        boundingSphere.center
      );
      let cartesian = this.cartographicToCartesian(boundingCenter);
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      let _position = this.cartographicToCartesian(cartographic);
      let offsetx = _position.x - cartesian.x;
      let offsety = _position.y - cartesian.y;
      let offsetz = _position.z - cartesian.z;
      modelMatrix = Cesium.Matrix4.fromTranslation(
        new Cesium.Cartesian3(offsetx, offsety, offsetz)
      );
    }

    layer.clippingPlanes = this.createClippingPlane(this.boxClippingPlanes, modelMatrix);
    this._baseClipEntities = [];

    for (var i = 0; i < layer.clippingPlanes.length; i++) {
      var plane = layer.clippingPlanes.get(i);
      var clippingPlaneEntity = this.addPlaneEntity(viewer, position, plane);
      this._baseClipEntities.push(clippingPlaneEntity);
    }
  }
  // 剖切地形 todo  目前图层写死，中心点写死，旋转角度写死，，
  addGlobePlane(viewer, position) {
    var _this = this;
    var globe = viewer.scene.globe;
    var cartesian3 = new Cesium.Cartesian3(
      -2228107.246338982,
      5455372.628533319,
      2432376.93571164
    );
    position = position || cartesian3;

    let centerEntity = viewer.entities.add({
      position: position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW
      },
      show:false
    });
    this.entities.push(centerEntity)
    var boxClippingPlanes = [
      new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.cos(this.angleValue), Math.sin(this.angleValue), 0.0), -35),       //右 
      new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.cos(this.angleValue), -Math.sin(this.angleValue), 0.0), -50),    //左 
      new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.sin(this.angleValue), Math.cos(this.angleValue), 0.0), -60),     //后
      new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.sin(this.angleValue), -Math.cos(this.angleValue), 0.0), -20)     //前
    ];
    globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
      modelMatrix: centerEntity.computeModelMatrix(Cesium.JulianDate.now()),
      planes: boxClippingPlanes,
      edgeWidth: 1.0 ,
      edgeColor: Cesium.Color.WHITE,
    });
  }
  /**
   * 添加剖切实体
  * @param {object} viewer 地图 viewer  
  * @param {object} position 中心位置，笛卡尔坐标 new Cesium.Cartesian3()
  * @param {object} plane 剖切面  创建clippingPlaneCollection中的 子集 
  */
  addPlaneEntity(viewer, position, plane) {
    var clippingPlaneEntity = viewer.entities.add({
      position: position,
      name: "clippingPlane",
      plane: {
        dimensions: new Cesium.Cartesian2(10.0, 10.0),
        material: Cesium.Color.WHITE.withAlpha(0.5),
        plane: plane,
        outline: true,
        unionClippingRegions: false,
        edgeWidth: 10
      },
      show: false
    });
    return clippingPlaneEntity
  }
  /**
   * 将以弧度表示的大地椭球坐标转换为等效的Web Mercator X，Y，Z坐标（以米表示，并以表示）
  * @param {*} cartographic 以弧度表示的大地椭球坐标 
  */
  cartographicToCartesian(cartographic) {
    var webMercatorProjection = new Cesium.WebMercatorProjection(CIM.viewer.scene.globe.ellipsoid);
    var cartesian = webMercatorProjection.project(cartographic);
    return cartesian;
  }
  /**
   * 清除图层剖切
   */
  cleanPlane(viewer) {
    if (this._planeEntity != null) {
      viewer.entities.remove(this._planeEntity);
    }
    if (this.clippingLayer) {
      this.clippingLayer.clippingPlanes = this.createClippingPlane([]);
    }
  }
  /**
   * 清除范围剖切
   */
  cleanBoxPlane(viewer) {
    if (this._baseClipEntities) {
      viewer.entities.remove(this._baseClipEntities);
      viewer.entities.remove(this.entities);
      
    }
    if (this._baseClipLayer) {
      this._baseClipLayer.clippingPlanes = this.createClippingPlane([]);
      viewer.scene.globe.clippingPlanes = this.createClippingPlane([]);
    }
  }
};
var slice = new SliceTool();
export default slice;