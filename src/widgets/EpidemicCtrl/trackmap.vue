<template>
  <div class="vdialog">
    <div class="dialog-cover" @click="closeMyself"></div>
    <div class="dialog-content">
      <div class="dialog_head">
        <!--弹窗头部 title-->
        <slot name="header">人员轨迹</slot>
      </div>
      <div class="dialog_main">
        <!--弹窗的内容-->
        <div id="trackContainer">
          <!--地球容器-->
        </div>
      </div>
      <!--弹窗关闭按钮-->
      <div class="foot_close" @click="closeMyself">
        <button>
          <a-icon type="close-circle" style="font-size: 35px;" @click="closeMyself" />
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import TrackMapInit from "./js/trackmap.js";
let viewer = CIM.viewer;
let cityEntitiesStore=null;
export default { 
  mounted() {
    TrackMapInit.createTrackMap( viewer, cityEntitiesStore);
    this.closeByEsc();
  },
  methods: {
    closeMyself() {
      this.$emit("hideTrack");
    },
    closeByEsc(){
      let _this = this;
      this.$nextTick(function() {
        document.addEventListener('keyup', function(e){
          if(e.keyCode == 27){
            _this.closeMyself();
          }
          })
      })
    }
  }
};
</script>
<style scoped>
#cesiumContainer {
  height: 100%;
  border-radius: 10px;
}
.vdialog {
  position: fixed;
  height: 100%;
}

.dialog-cover {
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.dialog-content {
  position: fixed;
  width: 86.5%;
  left: 11.5%;
  top: 10%;
  bottom: 10%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.dialog_head {
  color: white;
  width: 86.5%;
  font-size: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog_main {
  background: #ffffff;
  width: 70%;
  height: 80%;
  padding: 20px 20px 0px 20px;
  border-radius: 10px 10px 0 0;
}
.foot_close {
  background: #ffffff;
  width: 70%;
  height: auto;
  display: flex;
  justify-content: center;
  border-radius: 0 0 10px 10px;
  padding-bottom: 15px;
}
</style>
