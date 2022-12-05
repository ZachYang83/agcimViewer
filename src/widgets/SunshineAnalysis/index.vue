<template>
  <div class="clock-box">
    <div class="time">
      <time id="timeHour" class="hour"></time>
      <time id="timeDay" class="day"></time>
    </div>
    <div class="bg-box">
      <a-icon type="close" @click="close" />
      <div id="clock" class="clock"></div>
      <label>
        <span>选择月份：</span>
        <a-slider v-model="month" :min="1" :max="12" @afterChange="changeMonth" />
      </label>
      <label>
        <span>选择日期：</span>
        <a-slider v-model="day" :min="1" :max="31" @afterChange="changeDay" />
      </label>
    </div>
  </div>
</template>
<script> 
import sunshineAnalysis from "./index";
const now = new Date();
export default {
  data() {
    return {
      month: now.getMonth() + 1,
      day: now.getDate(),
      time: now.getTime(),
      timeDay: this.month + this.day
    };
  },
  mounted() {
    sunshineAnalysis.init(this,CIM.viewer);
  },
  methods: {
    changeMonth(e) {
      sunshineAnalysis.updateTimebyEnvirment(this);
    },
    changeDay(e) {
      sunshineAnalysis.updateTimebyEnvirment(this);
    },
    close() {
      this.$emit("close", { code: "SunshineSimulation" });
    }
  },
  watch: {
    time(val) {
      let date = new Date(val);
      this.month = date.getMonth() + 1;
      this.day = date.getDate();
    }
  },
  destroyed() {
    sunshineAnalysis.remove(); 
    CIM.viewer.clock.currentTime.secondsOfDay = 50400;
  }
};
</script>
<style scoped>
.time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 21, 41, 0.8);
  color: #fff;
  padding: 0 10px;
}
.time .hour {
  font-size: 40px;
}
.time .day {
  font-size: 16px;
}
.clock-box {
  position: absolute;
  top: 120px;
  right: 10px;
  z-index: 2;
  border-radius: 2px;
  overflow: hidden;
}
.bg-box {
  position: relative;
  color: #666;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.88);
}
.clock {
  width: 160px;
  height: 160px;
}
.bg-box label {
  display: flex;
  align-items: center;
  line-height: 36px;
}
.bg-box .ant-slider {
  flex: 1;
}
.anticon-close {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>