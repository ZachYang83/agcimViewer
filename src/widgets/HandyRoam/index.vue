<template>
  <ag-popup
    v-model="visible"
    title="绘制漫游"
    @onCancel="onCancel"
    class="infoBox"
  >
    <div class="content">
      <div class="h4">设置</div>
      <div class="draw_path_roam_config">
        选择视角:
        <a-select
          v-model="drawForm.visualAngleType"
          @change="visualAngleTypeChange"
          class="draw_path_roam_input"
        >
          <!-- <a-select-option value="empty">无</a-select-option> -->
          <!-- <a-select-option value="follow">跟随视角</a-select-option> -->
          <a-select-option value="lockFirst">锁定第一视角</a-select-option>
          <a-select-option value="lockGod">锁定上帝视角</a-select-option>
        </a-select>
        飞行速度:
        <a-input-number
          v-model="drawForm.speed"
          @change="speedChange"
          class="draw_path_roam_input"
        />

        <div style="margin:5px"></div>
        <span v-show="drawForm.visualAngleType == 'lockFirst'">
          视角距离:
          <a-input-number
            v-model="drawForm.width"
            @change="widthChange"
            class="draw_path_roam_input"
          />
        </span>
        <span>
          视角高度:
          <a-input-number
            v-model="drawForm.height"
            @change="heightChange"
            class="draw_path_roam_input"
          />
        </span>
      </div>
      <div style="margin:5px"></div>
      <a-divider />
      <div class="draw_path_roam_btngroup">
        <a-button type="primary" @click="onRedraw">绘制路线</a-button>
        <a-button
          type="primary"
          @click="onPauseOrContinue"
          disabled
          v-show="!drawForm.showRoamState"
          >开始漫游</a-button
        >
        <a-button
          type="primary"
          id="draw_btnRoad"
          @click="onPauseOrContinue"
          v-show="drawForm.showRoamState"
          >开始漫游</a-button
        >
      </div>
      <a-divider />
      <div class="h4">键盘提示</div>
      <div class="draw_path_roam_config">
        <h4 v-show="drawForm.visualAngleType === 'lockFirst'">
          W键低头 S键盘抬头 A键左偏 D键右偏
        </h4>
        <h4 v-show="drawForm.visualAngleType === 'lockGod'">
          W键下降 S键盘上升 A键左偏 D键右偏
        </h4>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import canvas2Image from "@/views/js/extension/canvas2Image.js";
import Draw from "@/sdk/interactive/draw.js";
import Roaming from "@/sdk/interactive/roaming.js";
import agMath from "@/sdk/maths/math";
import AgViewControl from "./agViewControl.js";

let viewer = CIM.viewer;
let draw = new Draw(viewer);
let roam = null;
let agViewControl = new AgViewControl({
  viewer,
});

export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: true,
      isContinue: false,
      modelUrl: "",
      isFlyHeight: false,
      drawForm: {
        name: "",
        code: "",
        width: 100,
        height: 100,
        modelType: "empty",
        roamType: "draw",
        flyheight: 1,
        visualAngleType: "lockFirst",
        isShowRoute: "true",
        speed: 30,
        sumDistance: 0,
        sumTime: 0,
        entities: null,
        showRoamState: false,
      },
    };
  },
  methods: {
    onCancel() {
      this.visible = false;
      this.removeEndRoaming();
      this.stopRoam();
      agViewControl.remove();
      draw.removeAll();
      this.$emit("close", { code: "HandyRoam" });
    },
    // 开始或暂停漫游
    onPauseOrContinue() {
      if (this.isContinue) {
        this.stopRoam();
      } else {
        this.startRoam();
      }
    },
    // 开始漫游
    startRoam() {
      this.isContinue = true;
      if (roam) {
        roam.PauseOrContinue(this.isContinue);
      }
      document.getElementById("draw_btnRoad").innerText = "停止漫游";
      agViewControl.controlView({
        visualAngleType: this.drawForm.visualAngleType,
        entity: roam.entity,
        config: this.drawForm,
      });
    },
    // 停止漫游
    stopRoam() {
      this.isContinue = false;
      if (!roam) return;
      roam.PauseOrContinue(this.isContinue);
      document.getElementById("draw_btnRoad").innerText = "开始漫游";
    },
    /**
     * @author: pwz（潘文周）
     * @description: 方法描述 绘制路线
     * @param {*}
     * @return {*}
     */
    onRedraw() {
      // viewer.scene.globe.depthTestAgainstTerrain = false;
      this.removeEndRoaming();
      this.stopRoam();
      draw.removeAll();
      this.drawLineStringAndCallBack();
    },
    // 绘制线段及回调
    drawLineStringAndCallBack() {
      var _this = this;
      draw.drawMultiPolyline().then(
        (result) => {
          var positions = result.positions;
          let genimg = canvas2Image.capturePng(viewer, "318", null, 0.8);
          _this.drawForm.code = genimg.src;
          _this.drawForm.positions = positions;
          _this.creatRoaming(positions);
          _this.drawForm.showRoamState = true;
        },
        (error) => {
          console.log(error);
        }
      );
    },
    // 创建漫游
    creatRoaming(positions) {
      this.drawForm.sumDistance = 0;
      this.drawForm.sumTime = 0;
      var disArr = [];
      this.drawForm.sumDistance = agMath.getDistances(positions, disArr);
      this.drawForm.sumTime = this.drawForm.sumDistance / this.drawForm.speed;

      if (roam) {
        roam.EndRoaming();
        roam = undefined;
      }
      let isShowRoute = this.drawForm.isShowRoute === "false" ? false : true;
      roam = new Roaming(viewer, {
        time: this.drawForm.sumTime,
        entityType: this.drawForm.modelType,
        modelUrl: this.modelUrl,
        Lines: positions,
        flyheight: this.drawForm.flyheight,
        speed: this.drawForm.speed,
        disArr: disArr,
        isPathShow: isShowRoute,
      });
    },
    // 移除绘制漫游实体
    removeEndRoaming() {
      if (roam) roam.EndRoaming();
    },
    // 修改模型类型
    modelTypeChange(value) {
      this.drawForm.modelType = value;
    },
    // 修改飞行速度
    speedChange(value) {
      roam.ChangeRoamingSpeed(value);
    },
    // 修改视角类型
    visualAngleTypeChange(value) {
      this.drawForm.visualAngleType = value;
      agViewControl.setFollowed(value, this.drawForm);
    },
    // 修改视角距离
    widthChange(value) {
      agViewControl.followedX = -value;
    },
    //改变视角高度
    heightChange(value) {
      agViewControl.followedZ = value;
    },
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
.draw_path_roam_btngroup {
  text-align: center;
}
.draw_path_roam_btngroup button {
  margin-right: 15px;
}
.draw_path_roam_input {
  width: 90px;
}
.draw_path_roam_config {
  text-align: center;
  padding: 5px;
}
</style>
