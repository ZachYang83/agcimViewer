<template>
  <div class="infoview">
    <div class="deep-msg">
      开挖深度：<a-input-number v-model="clipDeep" />（米）
      <a-icon type="close" class="close" @click="onCancel" />
    </div>
    <div class="terrain-infoBox-button">
      <a-button
        type="primary"
        @click="draw('polygon')"
        style="margin-right:15px"
        >绘制多边形</a-button
      ><a-button
        type="primary"
        @click="draw('rectangle')"
        style="margin-right:15px"
        >绘制矩形</a-button
      ><a-button type="danger" @click="clear">清除</a-button>
    </div>
  </div>
</template>
<script>
import Draw from "@/sdk/interactive/draw";
import AgTerrainExcavation from "@/sdk/interactive/terrainExcavation";
import coordinate from "@/sdk/maths/coordinate";
import agMath from "@/sdk/maths/math";
import AgPopup from "@/views/components/AgPopup.vue";

let arr = ["琶洲地下地形"];
let viewer = CIM.viewer;
let draw = null;
let agTerrainExcavation = new AgTerrainExcavation(viewer);

export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: true,
      clipDeep: 30,
    };
  },
  mounted() {
    draw = new Draw(viewer);
    for (let i = 0; i < arr.length; i++) {
      this.showLayer(arr[i]);
    }
  },
  methods: {
    showLayer(layerName) {
      let ly = CIM.layerTree.getLayerByText(layerName);
      if (CIM.layerTree.isLayerExist(ly)) {
        CIM.layerTree.addLayer(ly, viewer);
      }
    },
    draw(type) {
      var _this = this;
      agTerrainExcavation.remove();
      if (type == "polygon") {
        draw.drawPolygon().then(
          (result) => {
            var positions = result.positions;
            var p1 = positions[positions.length - 1];
            var p2 = positions[positions.length - 2];
            if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
              positions.pop();
            }
            draw.removeAll();
            var isR = agMath.judgeDirection(positions);
            var points = [];
            if (isR) {
              points = positions;
            } else {
              var count = 0;
              for (var i = positions.length - 1; i >= 0; i--) {
                points[count] = positions[i];
                count++;
              }
            }
            agTerrainExcavation.add(points, _this.clipDeep);
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (type == "rectangle") {
        draw.drawRect(null, false).then(
          (result) => {
            var positions = result.positions;
            draw.removeAll();
            var rectangle = Cesium.Rectangle.fromCartesianArray([
              positions[0],
              positions[1],
            ]);
            var points = _this.computeRectangleCartesian3(rectangle);
            agTerrainExcavation.add(points, _this.clipDeep);
          },
          (error) => {
            console.log(error);
          }
        );
      }
    },
    clear() {
      agTerrainExcavation.remove();
    },
    onCancel() {
      this.visible = false;
      this.$emit("close", { code: "TerrainExcavation" });
    },
    removeLayer() {
      let ly = CIM.layerTree.getLayerByText(arr[0]);
      let ids = CIM.layerTree._aglayerIds;
      if (ids.indexOf(ly.id) != -1) {
        CIM.layerTree.removeMany([ly.id], viewer);
      }
    },

    //计算矩形四个点坐标
    computeRectangleCartesian3(Rectangle) {
      var pointArr = [];
      var southeast = Cesium.Rectangle.southeast(Rectangle); //东南
      var northeast = Cesium.Rectangle.northeast(Rectangle); //东北
      var northwest = Cesium.Rectangle.northwest(Rectangle); //西北
      var southwest = Cesium.Rectangle.southwest(Rectangle); //西南
      southeast = coordinate.cartographicToCartesian3(southeast);
      northeast = coordinate.cartographicToCartesian3(northeast);
      northwest = coordinate.cartographicToCartesian3(northwest);
      southwest = coordinate.cartographicToCartesian3(southwest);
      pointArr.push(southeast, northeast, northwest, southwest);
      return pointArr;
    },
  },
  destroyed() {
    draw.dispose();
    agTerrainExcavation.remove();
    this.removeLayer();
  },
};
</script>
<style scoped>
.infoview {
  position: absolute;
  width: 330px;
  padding: 10px 20px;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.5);
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 3px 14px rgba(128, 128, 128, 0.5);
  z-index: 999;
  bottom: 10px;
  right: 35%;
  left: 35%;
  margin: auto;
}
.deep-msg {
  padding: 0 0 18px 0;
}
.deep-msg .close {
  top: 5px;
  right: 5px;
  position: absolute;
  color: red;
}
.terrain-infoBox-button {
  text-align: center;
}
</style>
