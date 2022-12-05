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
  </div>
</template>
<script>
import buildingHouse from "./js/buildingHouse.js";
let houseObj;
export default {
  props: ["visible"],
  data() {
    return {
      activeNext: false,
      activePrev: true,
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
      if (houseObj) houseObj.prev(null, this.handerCallBack);
    },
    next() {
      if (houseObj) {
        houseObj.next(null, this.handerCallBack);
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
      houseObj = buildingHouse(tileset);
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
  left: 350px;
  padding: 12px;
  border: 1px solid #fff;
  /* margin: 10px; */
  background: #ffffff0a;
  top: 250px;
  position: fixed;
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
</style>