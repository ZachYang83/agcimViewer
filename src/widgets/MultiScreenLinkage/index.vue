<template>
  <div id="modelContainer"></div>
</template>
<script>
import MapInit from "./js/MapInit";
import linkage from "./js/index";

let view3D = CIM.viewer;
export default {
  data() {
    return {};
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap: function () {
      let view2D = MapInit.creatMap("modelContainer");
      linkage.initialize(view2D, view3D);
      view3D.imageryLayers.layerAdded.addEventListener(function (e) {
        var layers = view2D.imageryLayers._layers;
        var layer = layers[layers.length - 1];
        view2D.imageryLayers.remove(layer);
        view2D.imageryLayers.addImageryProvider(e._imageryProvider);
      });
    },
  },
  beforeDestroy() {
    linkage.dispose();
  },
};
</script>
<style scoped>
#modelContainer {
  width: 100%;
  height: 100%;
}
</style>