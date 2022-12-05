<!--
 * @author:
 * @description: 地下模式
-->
<template>
  <ag-popup v-model="visible" title="地上地下" @onCancel="onCancel" class="infoBox">
    <div class="content">
      <a-row type="flex" justify="space-around" align="middle">
        <a-col :span="12">
          <h5>地下模式</h5>
        </a-col>
        <a-col :span="12">
          <a-switch v-model="checked" @change="onChange" />
        </a-col>
        <a-col :span="12">
          <h5>进入地下视角</h5>
        </a-col>
        <a-col :span="12">
          <a-switch v-model="underChecked" @change="underView" />
        </a-col>
        <a-col :span="12">
          <h5>开启渐隐模式</h5>
        </a-col>
        <a-col :span="12">
          <a-switch v-model="translucency" @change="onTranslucency" />
        </a-col>
        <a-col :span="12">
          <h5>图层透明度</h5>
        </a-col>
        <a-col :span="12">
          <a-slider :min="0" :max="0.5" :step="0.01" :defaultValue="0.3" @afterChange="setMapAlpha" />
        </a-col>
      </a-row>
    </div>
  </ag-popup>
</template>
<script>
import UndergroundMode from "@/adk/UndergroundMode.js";
import AgPopup from "@/views/components/AgPopup.vue";
import Camera from "@/sdk/camera/camera.js";
import Coordinate from "@/sdk/maths/coordinate.js"
let undergroundMode = new UndergroundMode(CIM.viewer);
let viewer = CIM.viewer;
export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: true,
      checked: false,
      underChecked: false,
      translucency: false,
      alpha: 0.5,
    };
  },
  mounted() { },
  methods: {
    setMapAlpha(alpha) {
      undergroundMode.setMapAlpha(alpha);
    },

    onChange(checked) {
      if (checked) {
        undergroundMode.enable();
      } else {
        undergroundMode.cancel();
      }
    },
    onCancel() {
      if (Coordinate.latitude(viewer.camera._positionCartographic).alt < 0) {
        this.viewSwitch(1);
      }
      this.visible = false;
      this.checked = false;
      this.underChecked = false;
      this.$emit("close", { code: "UndergroundTool" });
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
    },
    onTranslucency(translucency) {
      if (translucency) {
        undergroundMode.openTranslucencyControl();
      }
      else {
        undergroundMode.closeTranslucencyControl();
      }
    },
    underView(underChecked) {
      if (underChecked) {
        //跳转到地下，关闭摄像头地面碰撞
        viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
        this.viewSwitch(0);
      } else {
        //回到地面，打开摄像头地面碰撞，打开后无法手动调整视野进入地下
        this.viewSwitch(1);
        viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
      }
    },
    //切换视角
    viewSwitch(b) {
      var c = viewer.camera;
      //获取当前位置摄像头的参数，将高度和俯仰角乘以-1，得到地底位置
      var option = {
        longitude: Coordinate.latitude(c._positionCartographic).lng,
        latitude: Coordinate.latitude(c._positionCartographic).lat,
        height: -Coordinate.latitude(c._positionCartographic).alt,
        heading: c.heading,
        roll: c.roll,
        pitch: -c.pitch
      }
      // 如果进入地下时.摄像头位于地上
      // 或返回地面时.摄像头位于地底
      // 才进行视野跳转
      if (b && (option.height > 0) || !b && (option.height < 0)) {
        Camera.setCameraByLongitude(viewer, option);
      }
      //否则视角不变
      else {
        return;
      }
    }
  },
  beforeDestroy() {
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
    undergroundMode.cancel();
  },
};
</script>
<style scoped>
.infoBox {
  width: 250px;
}
.infoBox .content {
  padding: 20px;
  line-height: 1.5;
  background: #fff;
}
.content {
  padding: 0 5px;
}
.ant-slider {
  margin: 0;
  padding: 0;
  width: 80%;
}
.ant-col {
  margin-bottom: 10px;
}
</style>
