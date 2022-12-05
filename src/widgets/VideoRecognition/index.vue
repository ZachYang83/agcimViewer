<template>
  <div class="kg-box vscroll">
    <p>
      实时识别视频中行人与车辆，统计当前场景中人、车流量和一段时间内的人、车总量。
    </p>
    <p class="tips">
      提示:暂无
    </p>
    <div class="video-origin">
      <a-select
        default-value="请选择监控数据源"
        style="width: 200px"
        @change="handleChange"
      >
        <a-select-option
          v-for="(item, key) in videoData"
          :value="item.id"
          :key="key"
          >{{ item.name }}</a-select-option
        >
      </a-select>
    </div>
    <div class="video-analysis">
      <a-button type="primary" @click="videoAnalysis">
        开始分析
      </a-button>
    </div>
    <chart-panel
      :visible="showChartPanel"
      @closeChartPanel="closeChartPanel"
      :analysisData="analysisData"
    />
  </div>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import ChartPanel from "./chartPanel.vue";
let proxyUrl = "/agsupport-rest";
let url = "/agsupport/identify/mancarSource/find";
let currentVideoId = "";

export default {
  name: "videoRecognition",
  components: {
    "chart-panel": ChartPanel,
  },
  data() {
    return {
      videoData: [],
      analysisData: [],
      showChartPanel: false,
    };
  },
  mounted() {
    this.getVideoData();
  },
  methods: {
    handleChange(value) {
      currentVideoId = value;
    },
    videoAnalysis() {
      if (!currentVideoId) {
        this.$message.error("请选择监控数据源！");
        return;
      }
      this.getAnalysisData();
    },

    closeChartPanel() {
      this.showChartPanel = false;
    },
    //获取分析结果
    async getAnalysisData(time = 5) {
      let res = await axiosWraper.getData(
        proxyUrl + "/agsupport/identify/mancarResult/statistics",
        { sourceId: currentVideoId, times: time }
      );
      if (res.success) {
        let data = res.content;
        var numPeopleList = [];
        var numCarList = [];
        var timeList = [];
        var list = data.list;
        for (let i = 0; i < list.length; i++) {
          numPeopleList.push(list[i].totalNumPeople);
          numCarList.push(list[i].totalNumCar);
          timeList.push(list[i].identifyTimeEnd);
        }
        this.analysisData = {
          sourceId: currentVideoId,
          startTime: data.startTime,
          endTime: data.endTime,
          numPeopleList: numPeopleList.slice(-10),
          numCarList: numCarList.slice(-10),
          timeList: timeList.slice(-10),
        };
        this.showChartPanel = true;
      }
    },
    //获取视频源数据
    async getVideoData() {
      let res = await axiosWraper.getData(proxyUrl + url);
      if (res.success) {
        let data = res.content;
        this.videoData = data;
      }
    },
  },
};
</script>
<style scoped>
.kg-box {
  padding: 10px;
}
.tips {
  margin: 20px 0;
  background: #fdfae9;
  font-size: 14px;
  border: 1px solid #e4dba6;
  line-height: 16px;
  padding: 10px;
}
.video-origin {
  text-align: center;
}
.video-analysis {
  text-align: center;
  padding: 20px;
}
</style>
