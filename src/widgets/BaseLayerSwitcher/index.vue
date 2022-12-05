<template>
  <div class="baselayer-page">
    <!-- 底图 start-->
    <dl>
      <dt>
        底图
        <span class='setting'>设置</span>
      </dt>
      <div class="flex">
        <dd
          v-for="item in baseLayerArr"
          :key="item.name"
          @click="changeBaseLayer(item)"
        >
          <img :src="item.iconUrl" alt="item.name" />
          <p>{{ item.name }}</p>
        </dd>
      </div>
    </dl>
    <!-- 底图 end-->
    <!-- 地形 start-->
    <dl>
      <dt>地形</dt>
      <div class="flex">
        <dd
          v-for="item in terrainArr"
          :key="item.name"
          @click="changeTerrain(item)"
        >
          <img :src="item.iconUrl" alt="item.name" />
          <p>{{ item.name }}</p>
        </dd>
      </div>
    </dl>
    <!-- 地形 end-->
  </div>
</template>
<script>
let viewer = null;
import config from "./config";
export default {
  data() {
    return {
      baseLayerArr: config.baseLayerArr,
      terrainArr: config.terrainArr,
    };
  },
  mounted() {
    viewer = CIM.viewer;
  },
  methods: {
    changeBaseLayer(o) {
      var layers = viewer.imageryLayers._layers;
      var layer = layers[layers.length - 1];
      viewer.imageryLayers.remove(layer);
      viewer.imageryLayers.addImageryProvider(o.creationFunction());
    },
    changeTerrain(o) {
      viewer.terrainProvider = o.creationFunction();
    },
  },
};
</script>
<style scoped>
.baselayer-page {
  width: 300px;
}
.baselayer-page .flex {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  text-align: center;
}
.baselayer-page dt {
  font-size: 16px;
  margin-bottom: 5px;
}
.baselayer-page dd {
  flex: 1;
  width: 25%;
  min-width: 25%;
  max-width: 25%;
}
.baselayer-page dd:hover {
  cursor: pointer;
  color: rgb(53, 104, 151);
}
.baselayer-page dd img {
  width: 50px;
  height: 50px;
  border-radius: 2px;
}
.baselayer-page dd p {
  font-size: 12px;
  line-height: 1.2;
  margin-top: 5px;
}
.setting{
  float: right;
  font-size: 13px;
}
</style>
