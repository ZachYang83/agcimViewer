<template>
  <ag-popup
    v-model="visible"
    title="天气模拟"
    @onCancel="onCancel"
    class="weather-page"
  >
    <div class="content">
      <a-radio-group v-model="value" @change="onChange" defaultChecked="1">
        <a-radio :style="radioStyle" :value="1">
          晴天
        </a-radio>
        <a-radio :style="radioStyle" :value="2">
          雨天
        </a-radio>
        <a-radio :style="radioStyle" :value="3">
          雪天
        </a-radio>
        <a-radio :style="radioStyle" :value="4">
          雾天
        </a-radio>
        <a-radio :style="radioStyle" :value="5">
          天空
        </a-radio>
      </a-radio-group>
    </div>
  </ag-popup>
</template>
<script>
import WeatherShader from "./weatherShader";
import AgPopup from "@/views/components/AgPopup.vue";

let viewer = CIM.viewer;
let _groundSkyBox, _SkyBox;
export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: true,
      value: 1,
      radioStyle: {
        display: "block",
        height: "30px",
        lineHeight: "30px",
      },
    };
  },
  mounted() {},
  methods: {
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
      this.$emit("close", { code: "WeatherSimulation" });
    },
    onChange(e) {
      this.$emit("changeWeatherEffect", e);
      if (e.target.value == 1) {
        WeatherShader.removePostProcessStage(CIM.viewer, "rain");
        WeatherShader.removePostProcessStage(CIM.viewer, "snow");
        WeatherShader.removePostProcessStage(CIM.viewer, "fog");
      } else if (e.target.value == 2) {
        WeatherShader.removePostProcessStage(CIM.viewer, "snow");
        WeatherShader.removePostProcessStage(CIM.viewer, "fog");
        WeatherShader.addPostProcessStage(CIM.viewer, "rain", "rain");
      } else if (e.target.value == 3) {
        WeatherShader.removePostProcessStage(CIM.viewer, "rain");
        WeatherShader.removePostProcessStage(CIM.viewer, "fog");
        WeatherShader.addPostProcessStage(CIM.viewer, "snow", "snow");
      } else if (e.target.value == 4) {
        WeatherShader.removePostProcessStage(CIM.viewer, "rain");
        WeatherShader.removePostProcessStage(CIM.viewer, "snow");
        WeatherShader.addPostProcessStage(CIM.viewer, "fog", "fog");
      }

      if (e.target.value == 5) {
        // this.setSkyBox();
      }
    },
    setSkyBox() {
      CIM.viewer.scene.skyBox = _groundSkyBox;
      CIM.viewer.camera.flyTo({
        destination: new Cesium.Cartesian3.fromDegrees(
          113.32445849,
          23.12016038,
          2000
        ),
        duration: 1.0,
        orientation: {
          heading: 4.0354857170387755,
          pitch: -0.16528096127597447,
          roll: 6.280575565213471,
        },
      });
    },
  },
};
</script>
<style scoped>
.weather-page {
  width: 250px;
}
.weather-page .content {
  padding: 20px;
  line-height: 1.5;
}

.icon-sunny {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url(./img/sunny.png) no-repeat;
  background-size: 100%;
  vertical-align: -2px;
}
.icon-rain {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url(./img/rain.png) no-repeat;
  background-size: 100%;
  vertical-align: -2px;
}
.icon-snow {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url(./img/snow.png) no-repeat;
  background-size: 100%;
  vertical-align: -2px;
}
.icon-fog {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url(./img/fog.png) no-repeat;
  background-size: 100%;
  vertical-align: -2px;
}
</style>
