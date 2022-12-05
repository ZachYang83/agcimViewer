<template> </template>

<script>
import PickerHelper from "@/sdk/interactive/pickerHelper";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import coordinate from "@/sdk/maths/coordinate";

let viewer = CIM.viewer;
let isRotate = true;
let pickPosition = null;
let Exection = null;
let pickerHelper = new PickerHelper(viewer);
let agFeatureLayer = new AgFeatureLayer(viewer);

export default {
  name: "SurroundObservation",
  data() {
    return {};
  },
  mounted() {
    this.loadMiddleClick();
  },
  methods: {
    //中键点击事件
    loadMiddleClick() {
      // return;
      let _this = this;
      pickerHelper.on("MIDDLE_CLICK", function(e) {
        var cartesian = pickerHelper.getPositionByRay(e.position);
        var pickedObject = pickerHelper.getPickObject(e.position);
        if (
          viewer.scene.pickPositionSupported &&
          Cesium.defined(pickedObject)
        ) {
          let cartesian = pickerHelper.getPickPosition(e.position);
          if (Cesium.defined(cartesian)) {
            var cartographic = coordinate.cartesian3ToCartographic(
              cartesian,
              "Degrees"
            );
            pickPosition = {
              x: cartographic.lng,
              y: cartographic.lat,
              z: cartographic.alt,
            };
          }
        } else {
          //将笛卡尔坐标转换为地理坐标
          var cartographic = coordinate.cartesian3ToCartographic(
            cartesian,
            "Degrees"
          );
          pickPosition = {
            x: cartographic.lng,
            y: cartographic.lat,
            z: cartographic.alt,
          };
        }
        // 是否启动右键旋转
        if (isRotate) {
          _this.rotate(pickPosition);
        } else {
          _this.closeRotate(pickPosition);
        }
      });
    },

    //绕拾取点旋转
    rotate(pickPosition) {
      let _this = this;
      isRotate = false;
      var positionPick = Cesium.Cartesian3.fromDegrees(
        pickPosition.x,
        pickPosition.y
      );
      var positionCamera = viewer.camera.position;
      var entityTemp = agFeatureLayer.addEntity({
        id: "temp",
        position: Cesium.Cartesian3.fromDegrees(
          pickPosition.x,
          pickPosition.y,
          pickPosition.z
        ),
        point: {
          color: Cesium.Color.BLUE.withAlpha(0),
          outlineColor: Cesium.Color.BLUE.withAlpha(0),
          pixelSize: 10,
        },
      });
      var distance = Cesium.Cartesian3.distance(positionPick, positionCamera);
      var initHeading = viewer.camera.heading;
      var pitch1 = viewer.camera.pitch;
      var pitch;
      if (pitch1.toFixed(4) == -1.5708) {
        pitch = -1.569;
      } else {
        pitch = pitch1;
      }
      var offset = new Cesium.HeadingPitchRange(initHeading, pitch, distance);
      var counter = 0;
      viewer.zoomTo(entityTemp, offset).then(function() {
        Exection = function TimeExecution() {
          var heading = Cesium.Math.toRadians(counter * 0.5) + initHeading;
          counter += 1;
          offset = new Cesium.HeadingPitchRange(heading, pitch, distance);
          viewer.zoomTo(entityTemp, offset);
          viewer.scene.screenSpaceCameraController.enableInputs = false;
        };
        viewer.clock.onTick.addEventListener(Exection);
      });
    },

    //关闭旋转窗口
    closeRotate() {
      let _this = this;
      isRotate = true;
      viewer.clock.onTick.removeEventListener(Exection);
      agFeatureLayer.removeAll();
      viewer.scene.screenSpaceCameraController.enableInputs = true;
    },
  },
};
</script>
