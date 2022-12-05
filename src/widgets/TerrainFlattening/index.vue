<template>
  <div class="terrain-flat">
    <div class="terrain-flat-height">
      压平高度：<a-input-number v-model="flatHeight" />（米）
      <a-icon type="close" class="close" @click="onCancel" />
    </div>
    <div class="terrain-flat-button">
      <a-button type="primary" @click="draw" style="margin-right:15px"
        >绘制多边形</a-button
      >
      <a-button type="danger" @click="clear">清除</a-button>
    </div>
  </div>
</template>
<script>
import Draw from "@/sdk/interactive/draw";
import coordinate from "@/sdk/maths/coordinate";
import agMath from "@/sdk/maths/math";
import TerrainFlatten from "@/sdk/interactive/terrainFlatten";

let viewer = CIM.viewer;
let draw = null;
let terrainFlatten;
let tileSet;
export default {
  data() {
    return {
      flatHeight: 0,
    };
  },
  mounted() {
    tileSet = this.getTilesetByLayerText("龙山塘村OSGB");
    draw = new Draw(viewer);
  },
  methods: {
    draw() {
      var _this = this;
      draw.drawPolygon({ perPositionHeight: true }).then(
        (result) => {
          var positions = result.positions;
          var p1 = positions[positions.length - 1];
          var p2 = positions[positions.length - 2];
          if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
            positions.pop();
          }
          draw.removeAll();
          if (tileSet !== undefined) {
            terrainFlatten = new TerrainFlatten({
              viewer: viewer,
              tileset: tileSet,
              positions: positions,
              flatHeight: _this.flatHeight, //压平高度
              offsetZ: 0, //修正3d-tiles距离地面的高度
            });
            terrainFlatten.analysis();
          }
        },
        (error) => {
          console.log(error);
        }
      );
    },
    clear() {
      if (terrainFlatten !== undefined) {
        terrainFlatten.remove();
      }
    },
    onCancel() {
      this.$emit("close", { code: "TerrainFlattening" });
    },
    getTilesetByLayerText(text) {
      var layerId = CIM.layerTree.getLayerByText(text).id;
      var layer = CIM.layerTree.getLayerById(layerId);
      if (layer) {
        return layer._primitives[0];
      }
      return null;
    },
  },
  destroyed() {
    this.clear();
    draw.dispose();
  },
};
</script>
<style scoped>
.terrain-flat {
  position: absolute;
  width: 250px;
  padding: 10px 20px;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.5);
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 3px 14px rgba(128, 128, 128, 0.5);
  z-index: 10;
  bottom: 35px;
  right: 35%;
  left: 35%;
  margin: auto;
}
.terrain-flat-height {
  padding: 0 0 18px 0;
}
.terrain-flat-height .close {
  top: 5px;
  right: 5px;
  position: absolute;
  color: red;
}
.terrain-flat-button {
  text-align: center;
}
</style>
