<template>
  <div class="switch-box">
    <div class="item">
      <label class="trlable">开启抗锯齿</label>
      <a-switch
        class="switch"
        @change="onSawtoothChange"
        :checked="isSawtooth"
      />
    </div>
    <div class="item">
      <label class="trlable">深度检测</label>
      <a-switch
        class="switch"
        @change="onDepthTestChange"
        :checked="isDepthTest"
      />
    </div>
    <div class="item">
      <label class="trlable">服务代理</label>
      <a-switch class="switch" @change="onProxyChange" :checked="isProxy" />
    </div>
    <!-- <div class="item">
      <label class="trlable">属性弹窗</label>
      <a-switch class="switch" @change="onInfoboxChange" :checked="isInfobox" />
    </div> -->
    <!-- <div class="item">
      <label class="trlable">日照颜色</label>
      <a-switch class="switch" @change="onSunColor" :checked="isSunColor" />
    </div> -->
  </div>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
export default {
  data() {
    return {
      visible: true,
      isSawtooth: false,
      isProxy: false,
      isDepthTest: false,
      // isInfobox: false,
      // isSunColor: false,
    };
  },
  mounted() {
    this.isDepthTest = CIM.viewer.scene.globe.depthTestAgainstTerrain;
    this.isSawtooth = CIM.viewer.scene.postProcessStages.fxaa.enabled;
  },
  methods: {
    onCancel() {
      this.visible = false;
    },
    onSawtoothChange(checked) {
      if (checked) {
        //是否开启抗锯齿
        if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
          //判断是否支持图像渲染像素化处理
          CIM.viewer.resolutionScale = window.devicePixelRatio;
        }
      }
      this.isSawtooth = checked;
      CIM.viewer.scene.postProcessStages.fxaa.enabled = checked;
    },
    onProxyChange(e) {
      this.isProxy = e;
      axiosWraper.getConfigProxyUrl(CIM_LAYERTREE_NAME, this.isProxy);
    },
    onDepthTestChange(e) {
      this.isDepthTest = e;
      CIM.viewer.scene.globe.depthTestAgainstTerrain = this.isDepthTest;
    },
    // onInfoboxChange(e) {
    //   this.isInfobox = e;
    //   CIM.viewer.infoBox._element.hidden = !e;
    // },
    // onSunColor(e) {
    //   // this.isDepthTest = e;
    //   // CIM.viewer.scene.globe.depthTestAgainstTerrain = this.isDepthTest;
    // },
  },
};
</script>
<style scoped>
.switch-box {
  padding: 5px 10px;
}
.switch-box .item {
  margin-bottom: 10px;
}
.switch {
  left: 15px;
}
.trlable {
  font-size: 12px;
}
</style>
