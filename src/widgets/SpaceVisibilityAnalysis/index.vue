<template>
  <div class="visual-analysis-box">
    <div class="h4">分析范围设定</div>
    <a-button type="primary" class="choose" @click="choose">开始</a-button>
    <a-button class="ml10" @click="clearMapRes">清除</a-button>

    <div>观察点</div>
    <div class="point">
      <a-input placeholder="x" v-model="startPoint.x" />
      <a-input placeholder="y" v-model="startPoint.y" />
      <a-input placeholder="z" v-model="startPoint.z" />
    </div>
    <div>目标点</div>
    <div class="point">
      <a-input placeholder="x" v-model="endPoint.x" />
      <a-input placeholder="y" v-model="endPoint.y" />
      <a-input placeholder="z" v-model="endPoint.z" />
    </div>

    <div class="item">
      <span class="label">水平张角:</span>
      <a-slider v-model="horizontalViewAngle" :min="1" :max="120" />
      <a-input-number v-model="horizontalViewAngle" :min="1" :max="120" />
    </div>
    <div class="item">
      <span class="label">垂直张角:</span>
      <a-slider v-model="verticalViewAngle" :min="1" :max="90" />
      <a-input-number v-model="verticalViewAngle" :min="1" :max="90" />
    </div>
    <div class="item">
      <span class="label">视点距离:</span>
      <a-input-number v-model="visualRange" />
    </div>
    <div class="btm">
      <a-button type="primary" @click.stop="analysis">开始分析</a-button>
      <a-button type="primary" class="ml10" @click.stop="save">保存</a-button>
    </div>
  </div>
</template>
<script>
import draw from "@/sdk/interactive/draw";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import ViewShed from "./js/viewShed";

let viewer = CIM.viewer;
let viewShed = new ViewShed();
let pickerHelper = new PickerHelper(viewer);
export default {
  data() {
    return {
      startPoint: { x: 0, y: 0, z: 0 },
      endPoint: { x: 0, y: 0, z: 0 },
      horizontalViewAngle: 90,
      verticalViewAngle: 45,
      visualRange: 0,
      direction: 0,
      isActive: false,
    };
  },
  methods: {
    choose() {
      var vm = this;
      vm.isActive = true;
      //地面着色
      viewer.scene.debugShowFramesPerSecond = false;
      viewer.scene.globe.shadows = Cesium.ShadowMode.ENABLED;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      pickerHelper.on("LEFT_DOUBLE_CLICK", function (movement) {
        var cartesian = viewer.scene.pickPosition(movement.position);
        if (vm.isActive) {
          vm.startPoint = cartesian;
          vm.isActive = false;
          if (viewShed) {
            viewShed.clear();
          }
        } else {
          vm.endPoint = cartesian;

          viewShed.initialize(
            vm.startPoint,
            vm.endPoint,
            vm.horizontalViewAngle,
            vm.verticalViewAngle,
            viewer,
          );
          vm.visualRange = viewShed.getVisualRange();
        }
      });
    },
    clearMapRes() {
      if (viewShed) {
        viewShed.clear();
      }
      this.startPoint = { x: 0, y: 0, z: 0 };
      this.endPoint = { x: 0, y: 0, z: 0 };
      this.isActive = false;
      this.visualRange = 0;
    },
    clearHandler() {
      pickerHelper.remove("LEFT_DOUBLE_CLICK");
    },
    analysis() {
      if (viewShed && !this.isActive) {
        viewShed.createPostStage();
        this.clearHandler();
      } else {
        this.$message.info("请双击地图选择观察点和目标点");
      }
    },
    save() { },
  },
  watch: {
    horizontalViewAngle: function (val) {
      val && viewShed && viewShed.setHorizontalViewAngle(val);
    },
    verticalViewAngle: function (val) {
      val && viewShed && viewShed.setVerticalViewAngle(val);
    },
  },
};
</script>
<style scoped>
.visual-analysis-box {
  padding: 0 15px;
}
.choose {
  margin: 10px 0;
}
.point {
  display: flex;
  margin: 10px 0;
}
.point input {
  margin-right: 8px;
}
.item {
  display: flex;
  justify-items: center;
  margin: 10px 0;
}
.item .label {
  width: 100px;
  line-height: 36px;
}
.ant-slider {
  flex: 1;
}
.ant-input-number {
  max-width: 68px;
  margin-left: 5px;
}

.ml10 {
  margin-left: 10px;
}
</style>
