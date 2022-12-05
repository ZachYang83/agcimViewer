<template>
  <div id="minMap"></div>
</template>
<script>
import camera from "@/sdk/camera/camera";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import coordinate from "@/sdk/maths/coordinate.js";

var minViewer;
var shape = {
  points: [],
  rect: null,
  entity: null,
};
var removeEventListener = undefined;
var pickerHelper = null;

export default {
  data() {
    return {
      startPosition: null,
      endPosition: null,
      isStartRect: false,
    };
  },
  mounted() {
    this.creatMap();
    this.mapChangeListener();
  },
  methods: {
    mapChangeListener() {
      CIM.agcimScene.addImageryLayerEvent("layerAdded", (e) => {
        var layers = minViewer.imageryLayers._layers;
        var layer = layers[layers.length - 1];
        minViewer.imageryLayers.remove(layer);
        minViewer.imageryLayers.addImageryProvider(e._imageryProvider);
      });
      // CIM.viewer.imageryLayers.layerAdded.addEventListener(function (e) {

      // });
    },
    creatMap() {
      var _this = this;
      minViewer = new Cesium.Viewer("minMap", {
        infoBox: false,
        geocoder: false,
        fullscreenButton: false,
        selectionIndicator: false,
        homeButton: false, //是否显示Home按钮
        sceneModePicker: false, //是否显示3D/2D选择器
        navigationHelpButton: false, //是否显示右上角的帮助按钮
        navigationInstructionsInitiallyVisible: false,
        animation: false, //是否创建动画小器件，左下角仪表
        timeline: false, //是否显示时间轴
        fullscreenButtion: false, //是否显示全屏按钮
        vrButton: false,
        selectionIndicator: false, //是否显示选取指示器组件
        baseLayerPicker: false,
      });
      minViewer._cesiumWidget._creditContainer.style.display = "none"; //隐藏版权信息
      minViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          113.39611762,
          23.46545876,
          580000
        ),
      });
      pickerHelper = new PickerHelper(minViewer);
      _this.setCameraController(minViewer, false);
      setTimeout(function () {
        var layers = CIM.viewer.imageryLayers._layers;
        var layer = layers[layers.length - 1];
        minViewer.imageryLayers.addImageryProvider(layer._imageryProvider);
        // document
        //   .getElementById("minMap")
        //   .getElementsByClassName("cesium-toolbar-button")[0].style.display =
        //   "none";
        // 添加范围矩形
        var redRectangle = minViewer.entities.add({
          rectangle: {
            coordinates: new Cesium.CallbackProperty(function (time, result) {
              var rectangle = CIM.viewer.camera.computeViewRectangle();
              return rectangle;
            }, false),
            fill: false,
            outline: true,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 10,
          },
        });
      }, 100);
      this.setInputActionLeftDown(minViewer);
      this.setInputActionMouseMove(minViewer);
      this.setInputActionLeftUp(minViewer);
    },
    /**
     * 设置控制相机操作事件，
     * @param {} isEnable true 或者 false
     */
    setCameraController(viewer, isEnable) {
      camera.setCameraController(viewer, {
        enableRotate: isEnable,
        enableTranslate: isEnable,
        enableZoom: isEnable,
        enableTilt: isEnable,
        enableLook: isEnable,
      });
    },
    setInputActionLeftDown(viewer) {
      let _this = this;
      pickerHelper.on("LEFT_DOWN", function (event) {
        var cartesian = viewer.scene.camera.pickEllipsoid(event.position);
        if (shape.entity) {
          viewer.entities.remove(shape.entity);
          shape.entity = null;
        }
        if (cartesian) {
          // 绘制最小矩形
          _this.startPosition = event.position;
          shape.points.push(
            viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
          );
          shape.rect = Cesium.Rectangle.fromCartographicArray(shape.points);
          shape.rect.east += 0.000001;
          shape.rect.north += 0.000001;
          shape.entity = viewer.entities.add({
            rectangle: {
              coordinates: shape.rect,
              material: Cesium.Color.YELLOW.withAlpha(0.4),
              outline: true,
              outlineWidth: 2,
              outlineColor: Cesium.Color.RED,
              height: 0,
            },
            name: "agRectangle",
          });
          _this.isStartRect = true;
        }
      });
    },
    setInputActionMouseMove(viewer) {
      let _this = this;
      pickerHelper.on("MOUSE_MOVE", function (event) {
        if (shape.points.length == 0 || !_this.isStartRect) {
          return;
        }
        var cartesian = viewer.scene.camera.pickEllipsoid(event.endPosition);
        if (cartesian) {
          // 更新矩形坐标
          shape.points[1] = viewer.scene.globe.ellipsoid.cartesianToCartographic(
            cartesian
          );
          shape.rect = Cesium.Rectangle.fromCartographicArray(shape.points);
          if (shape.rect.west == shape.rect.east) {
            shape.rect.east += 0.000001;
          }
          if (shape.rect.south == shape.rect.north) {
            shape.rect.north += 0.000001;
          }
          shape.entity.rectangle.coordinates = shape.rect;
        }
      });
    },
    setInputActionLeftUp(viewer) {
      let _this = this;
      pickerHelper.on("LEFT_UP", function (event) {
        _this.isStartRect = false;
        _this.endPosition = event.position;
        // 在鹰眼图中绘制矩形,主地图缩放到绘制矩形的范围
        if (
          Math.abs(_this.startPosition.x - _this.endPosition.x) > 1 ||
          Math.abs(_this.startPosition.y - _this.endPosition.y) > 1
        ) {
          CIM.viewer.camera.setView({
            destination: shape.rect,
          });
        } else {
          // 点击鹰眼图,主地图平移到点击点
          _this.setView(viewer, event);
        }
        if (shape.entity) {
          viewer.entities.remove(shape.entity);
          shape.entity = null;
          shape.points = [];
        }
      });
    },
    removeListenerCameraChanged() {
      CIM.agcimScene.removeImageryLayerEvent("layerAdded");
    },
    // 主地图平移到点击点
    setView(viewer, event) {
      var _viewer = CIM.viewer;
      var cartesian = viewer.scene.camera.pickEllipsoid(event.position);
      var mercator = coordinate.cartesianToMercator(_viewer, cartesian);
      var position = coordinate.cartesianToMercator(
        _viewer,
        _viewer.camera.position
      );
      mercator.z = position.z;
      cartesian = coordinate.mercatorToCartesian(_viewer, mercator);
      _viewer.camera.setView({
        destination: cartesian,
      });
    },
    removeInputAction(viewer) {
      if (viewer) {
        pickerHelper.remove("LEFT_DOWN");
        pickerHelper.remove("MOUSE_MOVE");
        pickerHelper.remove("LEFT_UP");
      }
      this.removeListenerCameraChanged();
    },
  },
  destroyed() {
    this.removeInputAction(minViewer);
  },
};
</script>
<style scoped>
#minMap {
  width: 300px;
  height: 200px;
  position: fixed;
  bottom: 15px;
  right: 15px;
  background: #fff;
  border: 1px solid #999;
  -webkit-box-shadow: 0px 0px 15px #999;
  box-shadow: 0px 0px 15px #999;
  z-index: 10;
}
#minMap .cesium-viewer-toolbar {
  display: none;
}
</style>
