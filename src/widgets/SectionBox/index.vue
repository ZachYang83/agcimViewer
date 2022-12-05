<template>
  <div class="cesium-viewer-cutting">
    <div class="msg" v-show="msgShow">点击选择某个BIM模型以生成剖切盒</div>
    <div>
      <a-button type="primary" v-show="newsliceShow" @click="newSlice">新剖切盒</a-button>
    </div>
    <div>
      <a-button type="primary" @click="onCancel">关闭</a-button>
    </div>
    <!-- <div class="note" v-show="noteShow">按住shfit键切换:纵剖/横剖</div> -->
  </div>
</template>

<script>
import sliceBox from "@/sdk/interactive/sliceBox";


export default {
  data() {
    return {
      chartVisible: false,
      msgShow: true,
      newsliceShow: false,
    };
  },
  mounted() {
    sliceBox.start(this, CIM.viewer);
  },
  methods: {
    newSlice() {
      this.msgShow = true;
      this.newsliceShow = false;
      sliceBox.dispose();
      sliceBox.start(this, CIM.viewer);
    },
    onCancel() {
      sliceBox.dispose();
      this.$emit("close", { code: "SectionBox" });
    },
  },
  destroyed() {
    sliceBox.dispose();
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

