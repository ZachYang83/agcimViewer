<template>
  <div class="cesium-viewer-cutting">
    <div class="msg" v-show="msgShow">通过单击并拖动场景中的表面开始剖切</div>
    <div>
      <a-button type="primary" v-show="newsliceShow" @click="newSlice"
        >新剖切</a-button
      >
    </div>
    <div>
      <a-button type="primary" @click="onCancel">关闭</a-button>
    </div>
    <div class="note" v-show="noteShow">按住shfit键切换:纵剖/横剖</div>
  </div>
</template>
<script>
import PickerHelper from "@/sdk/interactive/pickerHelper";
import sliceTool from "./sliceTool";

let viewer = CIM.viewer;
export default {
  data() {
    return {
      msgShow: true,
      newsliceShow: false,
      noteShow:false
    };
  },
  mounted() {
    sliceTool.start(this, viewer);
  },
  methods: {
    //新剖切
    newSlice() {
      this.msgShow = true;
      this.newsliceShow = false;
      this.noteShow=false;
      sliceTool.isCreatePlanes = false;
      sliceTool.removeEntity();
      sliceTool.removeClippingPlanes();
      sliceTool.reset();
    },
    //关闭
    onCancel() {
      sliceTool.dispose();
      this.$emit("close", { code: "SliceTool" });
    },
  },
  destroyed() {
     sliceTool.dispose();
  },
};
</script>
<style scoped>
.cesium-viewer-cutting {
  position: absolute;
  width: 200px;
  right: 100px;
  bottom: 100px;
  background: rgba(0, 0, 0, 0.5);
  font-size: 14px;
  color: #fff;
  text-align: center;
  padding: 5px 10px;
}
.ant-btn {
  margin: 5px 0 0 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0);
  border-color: white;
}
</style>
