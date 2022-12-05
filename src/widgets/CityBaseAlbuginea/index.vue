<template>
  <div>
    <div style="margin-left:10px">
      <h3>
        <b>功能描述</b>
      </h3>
      <br />
      <p>加载世界范围内的城市基础白膜数据</p>
      <br />
    </div>
    <div class="button-group">
      <a-button class="locate" @click="loadData">
        <a-icon type="check-circle" style="font-size: 14px;" />加载
      </a-button>
      <a-button class="locate" @click="clear">
        <a-icon type="delete" style="font-size: 14px;" />清除
      </a-button>
    </div>
    <div class="button-slider" v-show="showOpacity">
      <h4>透明度:</h4>
      <a-slider
        :min="0"
        :max="1"
        :step="0.01"
        v-model="alphaValue"
        @change="setOpacity"
      />
    </div>
  </div>
</template>
<script>
import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
var osmBuildingsTileset;
export default {
  name: "cityBaseAlbuginea",
  data() {
    return {
      showOpacity: false,
      alphaValue: 1,
    };
  },
  mounted() {},
  methods: {
    loadData() {
      osmBuildingsTileset = Cesium.createOsmBuildings();
      agFeatureLayer.addPrimitive(osmBuildingsTileset);
      this.showOpacity = true;
    },
    clear() {
      agFeatureLayer.removeAll();
      this.showOpacity = false;
      this.alphaValue = 1;
    },
    setOpacity(alpha) {
      osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: "color('white', " + alpha + ")",
        show: true,
      });
    },
  },
  destroyed() {
    this.clear();
  },
};
</script>
<style scoped>
.button-group {
  margin: 10px;
  text-align: center;
}
.locate {
  background-color: rgb(24, 144, 255);
  color: white;
  border: 0;
  margin-right: 5px;
}
.locate:hover {
  background-color: rgb(85, 173, 255);
}
.button-slider {
  margin: 20px 10px 10px 10px;
}
</style>
