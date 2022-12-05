<template>
  <div class="building_house_panlen" v-if="visible">
    <a-button-group>
      <a-button type="primary" v-on:click="prev" :disabled="activePrev">
        <a-icon type="left" />上一步
      </a-button>
      <a-button type="primary" v-on:click="next" :disabled="activeNext">
        下一步
        <a-icon type="right" />
      </a-button>
    </a-button-group>
    <div class="housebing_close">
      <a-icon class="closeBtn" type="close-circle" v-on:click="close" />
    </div>
    <div class="building_text">当前步骤：{{ buildLabel }}</div>
  </div>
</template>
<script>
import buildingHouse from "./js/buildingHouse";
let houseObj;
export default {
  props: ["visible"],
  data() {
    return {
      activeNext: false,
      activePrev: true,
      buildLabel: "测量放线",
    };
  },
  mounted() {},
  watch: {
    visible(newD, ouldD) {
      if (newD) {
        // houseObj=buildingHouse()
      }
    },
  },
  methods: {
    prev() {
      if (houseObj) {
        let re = houseObj.prev(null, this.handerCallBack);
        this.buildLabel = re.label;
      }
    },
    next() {
      if (houseObj) {
        let re = houseObj.next(null, this.handerCallBack);
        this.buildLabel = re.label;
        //建造完成
        if (!re.status) {
          this.$emit("closePanel");
        }
      }
    },
    close() {
      if (houseObj) {
        houseObj.remove();
        this.$emit("closePanel");
      }
    },
    startBuilding(tileset) {
      this.activeNext = false;
      this.activePrev = true;
      buildingHouse(tileset).then((da) => {
        houseObj = da;
      });
    },
    handerCallBack(prev, next) {
      this.activePrev = prev;
      this.activeNext = next;
    },
  },
};
</script>
<style scoped>
.building_house_panlen {
  z-index: 1;
  border-radius: 4px;
  /* right: 10px; */
      left: 500px;
  padding: 12px;
  border: 1px solid #fff;
  /* margin: 10px; */
  background: #ffffff0a;
  top: 250px;
  position: fixed;
  background: #141313ab;
}
.housebing_close {
  float: right;
}
.closeBtn {
  position: absolute;
  right: -2px;
  top: 0px;
  font-size: 16px;
  color: red;
  cursor: pointer;
}
.building_text {
  color: #fff;
  font-size: 22px;
}
</style>