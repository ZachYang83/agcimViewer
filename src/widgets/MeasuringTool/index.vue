<template>
  <ag-popup v-model="visible" title="测量" @onCancel="onCancel" class="infoBox">
    <div class="content">
      <div class="msg">{{ guide }}</div>
      <a-tabs default-active-key="1" @change="onChangeTab" type="card">
        <a-tab-pane key="1" tab="距离">
          <dl>
            <dt style="color:#f99d0d" class="result-msg">
              直线距离：{{ straightDistance }}m
            </dt>
            <dt style="color:#d52c40" class="result-msg">
              水平距离：{{ HorizontalDistance }}m
            </dt>
            <dt style="color:#7ccf21" class="result-msg">
              垂直距离：{{ verticalDistance }}m
            </dt>
          </dl>
        </a-tab-pane>
        <a-tab-pane key="2" tab="面积" force-render>
          <dl>
            <dt style="color:#f99d0d">面积：{{ area }}</dt>
            <dt style="color:#d52c40">周长：{{ lengths }}</dt>
          </dl>
        </a-tab-pane>
        <a-tab-pane key="3" tab="角度">
          <dl>
            <dt style="color:#f99d0d">角度：{{ angle }}°</dt>
          </dl>
        </a-tab-pane>
        <a-tab-pane key="4" tab="标高">
          <dl>
            <dt style="color:#f99d0d" class="result-msg">
              标高：{{ height }}m
            </dt>
          </dl>
        </a-tab-pane>
        <!-- <a-tab-pane key="5" tab="最小距离"
          ><dl>
            <dt style="color:#f99d0d">最小距离：{{ minDistance }}m</dt>
          </dl></a-tab-pane
        > -->
        <a-tab-pane key="6" tab="坐标拾取">
          <dl style="float: left;">
            <dt style="color:#f99d0d" class="result-msg">经纬度：</dt>
            <dt style="color:#f99d0d" class="result-msg">经度：{{ long }}</dt>
            <dt style="color:#f99d0d" class="result-msg">纬度：{{ lat }}</dt>
            <dt style="color:#f99d0d" class="result-msg">高程：{{ elev }}</dt>
          </dl>
          <dl style="margin-left:50%;position: absolute;">
            <dt style="color:#f99d0d;font-weight:normal" class="result-msg">WGS84：</dt>
            <dt style="color:#f99d0d" class="result-msg">x：{{ x }}</dt>
            <dt style="color:#f99d0d" class="result-msg">y：{{ y }}</dt>
            <dt style="color:#f99d0d" class="result-msg">z：{{ z }}</dt>
          </dl>
        </a-tab-pane>
      </a-tabs>
      <div style="text-align:center">
        <a-button style="width:100px" type="primary" block @click="onNew">新测量</a-button>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import DistanceMeasure from "./js/distanceMeasure";
import AreaMeasure from "./js/areaMeasure";
import AngleMeasure from "./js/angleMeasure";
import HeightMeasure from "./js/heightMeasure";
import CoordinatePick from "./js/coordinatePick";
import MinDistanceMeasure from "./js/minDistanceMeasure";

let currentMeasureType = "1";
export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: true,
      straightDistance: "--",
      HorizontalDistance: "--",
      verticalDistance: "--",
      area: "--",
      lengths:"--",
      angle: "--",
      height: "--",
      minDistance: "--",
      long: "--",
      lat: "--",
      elev: "--",
      x: "--",
      y: "--",
      z: "--",
      guide: "通过单击场景选择两点进行测量",
    };
  },
  mounted() {
    DistanceMeasure.initialize(CIM.viewer, this);
  },
  methods: {
    onChangeTab(e) {
      this.clearMeasureResult();
      this.closeMeasure(currentMeasureType);
      this.openMeasure(e, this);
      currentMeasureType = e;
    },
    onNew() {
      this.clearMeasureResult();
      this.closeMeasure(currentMeasureType);
      this.openMeasure(currentMeasureType, this);
    },
    onCancel() {
      this.visible = false;
      this.closeMeasure(currentMeasureType);
      this.$emit("close", { code: "MeasuringTool" });
    },
    openMeasure(type, vm) {
      switch (type) {
        case "1":
          this.guide = "通过单击场景选择两点测量距离";
          DistanceMeasure.initialize(CIM.viewer, vm);
          break;
        case "2":
          this.guide = "通过单击场景选择至少三点测量面积、周长，双击结束";
          AreaMeasure.initialize(CIM.viewer, vm);
          break;
        case "3":
          this.guide = "通过单击场景选择三点测量角度";
          AngleMeasure.initialize(CIM.viewer, vm);
          break;
        case "4":
          this.guide = "通过单击场景选择一点测量标高";
          HeightMeasure.initialize(CIM.viewer, vm);
          break;
        case "5":
          this.guide = "通过单击场景中两个构件测量最小距离";
          MinDistanceMeasure.initialize(CIM.viewer, vm);
          break;
        case "6":
          this.guide = "通过单击场景选择一点拾取坐标";
          CoordinatePick.pickAndDrawPoint(CIM.viewer).then(values => {
            this.long = values.long
            this.lat = values.lat
            this.elev = values.elev
            this.x = values.x
            this.y = values.y
            this.z = values.z
          })
          break;
      }
    },
    closeMeasure(type) {
      switch (type) {
        case "1":
          DistanceMeasure.dispose();
          break;
        case "2":
          AreaMeasure.dispose();
          break;
        case "3":
          AngleMeasure.dispose();
          break;
        case "4":
          HeightMeasure.dispose();
          break;
        case "5":
          MinDistanceMeasure.dispose();
          break;
        case "6":
          CoordinatePick.dispose();
          break;
      }
    },
    clearMeasureResult() {
      this.straightDistance = "--";
      this.HorizontalDistance = "--";
      this.verticalDistance = "--";
      this.area = "--";
      this.lengths= "--";
      this.angle = "--";
      this.height = "--";
      this.minDistance = "--";
      this.long = "--";
      this.lat = "--";
      this.elev = "--";
      this.x = "--";
      this.y = "--";
      this.z = "--";
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
