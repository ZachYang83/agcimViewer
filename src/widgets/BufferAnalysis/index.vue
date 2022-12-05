<template>
  <ag-popup
    v-model="visible"
    title="缓冲分析"
    @onCancel="onCancel"
    class="infoBox"
  >
    <div class="content">
      <div class="msg">{{ guide }}</div>

      <dt style="color: #f99d0d" class="result-msg">缓冲半径</dt>
      <a-input-number v-model="PointBufferradius" />
      <a-select v-model="classify" style="width: 195px">
        <a-select-option
          v-for="(value, key) in classifyItems"
          :value="key"
          :key="key"
          >{{ value }}</a-select-option
        >
      </a-select>
      <a-select v-model="analysisType" style="width: 195px">
        <a-select-option
          v-for="(value, key) in analysisTypeItems"
          :value="key"
          :key="key"
          >{{ value }}</a-select-option
        >
      </a-select>
      <div style="text-align: center">
        <a-button style="width: 100px" type="primary" block @click="onNew"
          >新测量</a-button
        >
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import BufferAnalysisTest from "./js/bufferAnalysisTest";
import {
  LEFTBUFFER,
  RIGHTBUFFER,
  DOUBLEBUFFER,
} from "@/sdk/spatialAnalysis/bufferType";

let currentMeasureType = "1";
export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      PointBufferradius: 10,
      visible: true,
      guide: "地图上拾取一点做缓冲分析",
      analysisType: "点缓冲",
      analysisTypeItems: {
        point: "点缓冲",
        line: "线缓冲",
        polygon: "多边形缓冲",
        plane: "面缓冲",
        cube: "体缓冲",
      },
      classify: "双边缓冲",
      classifyItems: {
        LEFTBUFFER: "左侧缓冲",
        RIGHTBUFFER: "右侧缓冲",
        DOUBLEBUFFER: "双边缓冲",
      },
    };
  },
  mounted() {
    BufferAnalysisTest.pointBufferTest(CIM.viewer, this.PointBufferradius);
  },
  methods: {
    onChangeTab(e) {
      this.closeMeasure(currentMeasureType);
      this.openMeasure(e, this);
      currentMeasureType = e;
    },
    onNew() {
      this.closeMeasure(currentMeasureType);
      this.openMeasure(this.analysisType, this);
    },
    onCancel() {
      this.visible = false;
      this.closeMeasure(currentMeasureType);
      this.$emit("close", { code: "MeasuringTool" });
    },
    openMeasure(type, vm) {
      let bufferType = DOUBLEBUFFER;
      if (vm.classify === "LEFTBUFFER") {
        bufferType = LEFTBUFFER;
      } else if (vm.classify === "RIGHTBUFFER") {
        bufferType = RIGHTBUFFER;
      }

      switch (type) {
        case "point":
          this.guide = "地图上拾取一点做缓冲分析";
          BufferAnalysisTest.pointBufferTest(CIM.viewer, vm.PointBufferradius);
          break;
        case "line":
          this.guide = "绘制线段做缓冲分析，双击结束线绘制";
          BufferAnalysisTest.lineBufferTest(
            CIM.viewer,
            vm.PointBufferradius,
            bufferType
          );
          break;
        case "polygon":
          this.guide = "绘制多边形做缓冲分析";
          BufferAnalysisTest.polygonBufferTest(
            CIM.viewer,
            vm.PointBufferradius,
            bufferType
          );
          break;
        case "plane":
          this.guide = "绘制面做缓冲分析";
          BufferAnalysisTest.planeBufferTest(
            CIM.viewer,
            vm.PointBufferradius,
            bufferType
          );
          break;
        case "cube":
          this.guide = "选择tile做缓冲分析";
          BufferAnalysisTest.tileBufferTest(
            CIM.viewer,
            vm.PointBufferradius,
            bufferType
          );
          break;
      }
    },
    closeMeasure(type) {
      BufferAnalysisTest.dispose();
    },
  },
  destroyed() {
    this.closeMeasure(currentMeasureType);
  },
};
</script>
<style scoped>
.infoBox {
  width: 400px;
}
.infoBox .content {
  padding: 20px;
  line-height: 1.5;
  background: #fff;
}
.infoBox .msg {
  margin-bottom: 20px;
  color: black;
}

.unit-box {
  width: 120px;
}

.result-msg {
  margin: 10px 0 0 10px;
}
</style>
