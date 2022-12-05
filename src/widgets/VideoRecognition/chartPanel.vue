<template>
  <ag-popup
    v-model="visible"
    title="人、车流量识别"
    @onCancel="onCancel"
    class="infoBox-chart"
  >
    <div class="statistic-time">
      <span>统计频率：</span>
      <a-select default-value="5s" style="width: 100px" @change="handleChange">
        <a-select-option
          v-for="(item, key) in options"
          :value="item.key"
          :key="key"
          >{{ item.value }}</a-select-option
        >
      </a-select>
    </div>
    <div class="analysis-chart" id="analysisChart"></div>
    <div class="button-group">
      <div style="margin-bottom:20px">
        <a-button type="primary" :icon="icon" ghost @click="historyList" />
      </div>
      <div>
        <a-button type="primary" icon="video-camera" ghost @click="showVideo" />
      </div>
    </div>
    <div class="analysis-msg" v-show="videoShow">
      <video src=""></video>
    </div>
    <div class="analysis-msg" v-show="historyShow">
      <span>开始统计时间: {{ startTime }}</span>
      <a-slider
        style="width:300px"
        range
        :default-value="[0, 100]"
        @change="onChange"
        :tip-formatter="null"
      />
      <span>结束统计时间: {{ endTime }}</span>
      <div class="history-button">
        <div>
          <a-button type="primary" @click="query">查询</a-button>
        </div>
        <div style="margin-top:10px">
          <a-button type="primary">导出报告</a-button>
        </div>
      </div>
      <div class="history-table">
        <a-table
          style="height:200px"
          :columns="columns"
          :pagination="pagination"
          :data-source="tableData"
          :scroll="{ y: 240 }"
        />
      </div>
    </div>
  </ag-popup>
</template>

<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import AgPopup from "@/views/components/AgPopup.vue";

var echarts = require("echarts"); //引入echarts
let proxyUrl = "/agsupport-rest";
let options = [
  { key: 5, value: "5s" },
  { key: 30, value: "30s" },
  { key: 60, value: "1min" },
];
const columns = [
  {
    title: "时间",
    dataIndex: "time",
    width: 180,
  },
  {
    title: "人数",
    dataIndex: "numPeople",
    width: 100,
  },
  {
    title: "车辆数",
    dataIndex: "numCar",
  },
];

let chartTitle = "";
let numPeople = [];
let numCar = [];
let numTime = [];
let startTime = "";
let endTime = "";

export default {
  components: { "ag-popup": AgPopup },
  props: ["visible", "analysisData"],
  data() {
    return {
      videoShow: false,
      historyShow: false,
      icon: "menu-fold",
      startTime: "",
      endTime: "",
      pagination: false,
      options,
      tableData: [],
      columns,
    };
  },
  mounted() {
    this.analysisChart();
  },
  watch: {
    analysisData(newName, oldName) {
      let _this = this;
      numTime = [];
      if (newName) {
        startTime = newName.startTime;
        endTime = newName.endTime;
        _this.startTime = _this.timestampToTime(startTime);
        _this.endTime = _this.timestampToTime(endTime);
        chartTitle = _this.timestampToTime(newName.endTime);
        numPeople = newName.numPeopleList;
        numCar = newName.numCarList;
        newName.timeList.map((item) => {
          var time = _this.timestampToTime(item);
          numTime.push(time);
        });
        numTime.pop();
        numTime.push("最新");
        _this.analysisChart();
      }
    },
  },
  methods: {
    //统计频率改变
    handleChange(value) {
      this.$parent.getAnalysisData(value);
    },
    //滑动条改变
    onChange(value) {
      console.log("change: ", value);
      let diffTime = endTime - startTime;
      let tempStart = startTime + value[0] * (diffTime / 100);
      let tempEnd = endTime - (100 - value[1]) * (diffTime / 100);
      this.startTime = this.timestampToTime(tempStart);
      this.endTime = this.timestampToTime(tempEnd);
    },
    query() {
      this.getData();
    },

    historyList() {
      if (this.historyShow) {
        this.icon = "menu-unfold";
      } else {
        this.icon = "menu-fold";
        this.getData();
      }
      this.videoShow = false;
      this.historyShow = !this.historyShow;
    },
    showVideo() {
      this.historyShow = false;
      this.videoShow = !this.videoShow;
    },
    analysisChart() {
      var _this = this;
      var myChart = echarts.init(document.getElementById("analysisChart"));
      // 指定图表的配置项和数据
      var option = {
        title: {
          text: chartTitle,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "line", // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {
              type: "dashed",
              color: "rgb(128, 128, 128)",
            },
          },
        },
        legend: {
          bottom: "20",
          left: "60",
        },
        xAxis: [
          {
            name: "时间",
            type: "category",
            data: numTime,
            axisLine: {
              //---坐标轴 轴线
              show: true, //---是否显示
              //------------------- 箭头 -------------------------
              symbol: ["none", "arrow"], //---是否显示轴线箭头
              symbolSize: [8, 8], //---箭头大小
              symbolOffset: [0, 7], //---箭头位置
            },
            axisTick: {
              alignWithLabel: true,
              show: false,
            },
            axisLabel: {
              margin: 10,
              interval: 100000,
              showMinLabel: false,
              showMaxLabel: true,
            },
          },
        ],
        //滚动条
        // dataZoom: [
        //   {
        //     type: "slider",
        //     show: true,
        //     xAxisIndex: [0],
        //     left: "9%",
        //     bottom: 5,
        //     start: 0,
        //     end: 100, //初始化滚动条
        //   },
        // ],
        yAxis: [
          {
            type: "value",
            name: "数目",
            axisLine: {
              //---坐标轴 轴线
              show: true, //---是否显示
              //------------------- 箭头 -------------------------
              symbol: ["none", "arrow"], //---是否显示轴线箭头
              symbolSize: [8, 8], //---箭头大小
              symbolOffset: [0, 7], //---箭头位置
            },
          },
        ],
        series: [
          {
            name: "人",
            type: "line",
            barWidth: "10",
            itemStyle: {
              //---图形形状
              normal: {
                color: "red",
                label: {
                  show: true,
                  position: "right",
                  fontSize: "16",
                  formatter: function(data) {
                    if (data.name == "最新") {
                      return data.value + "人";
                    } else {
                      return "";
                    }
                  },
                },
              },
            },
            markLine: {
              symbol: ["none", "none"], //去掉箭头
              itemStyle: {
                normal: {
                  lineStyle: {
                    type: "dashed",
                    color: "rgb(0,0,0)",
                  },
                  label: {
                    show: false,
                    position: "middle",
                  },
                },
              },
              data: [
                {
                  xAxis: "最新", //这里设置false是隐藏不了的，可以设置为-1
                },
              ],
            },
            data: numPeople,
          },
          {
            name: "车",
            type: "line",
            barWidth: "10",
            itemStyle: {
              //---图形形状
              normal: {
                color: "blue",
                label: {
                  show: true,
                  position: "right",
                  fontSize: "16",
                  formatter: function(data) {
                    if (data.name == "最新") {
                      return data.value + "辆";
                    } else {
                      return "";
                    }
                  },
                },
              },
            },
            data: numCar,
          },
        ],
      };
      myChart.setOption(option);
    },
    onCancel() {
      this.$emit("closeChartPanel", false);
    },
    //时间戳转年月日
    timestampToTime(timestamp) {
      var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var Y = date.getFullYear() + "-";
      var M =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      var D =
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
      var h =
        (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
      var m =
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
        ":";
      var s =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

      var strDate = Y + M + D + h + m + s;
      return strDate;
    },
    //获取列表数据
    async getData() {
      let _this = this;
      let res = await axiosWraper.getData(
        proxyUrl + "/agsupport/identify/mancarResult/find",
        {
          sourceId: _this.analysisData.sourceId,
          startTimeParam: _this.startTime,
          endTimeParam: _this.endTime,
        }
      );
      if (res.success) {
        let tableData = [];
        let peopleSum = 0;
        let carSum = 0;
        let data = res.content;
        let tableList = data.list;
        tableList.map((item, index) => {
          let options = {};
          var time = _this.timestampToTime(item.identifyTime);
          options.key = index;
          options.time = time;
          options.numPeople = item.numPeople;
          options.numCar = item.numCar;
          peopleSum += item.numPeople;
          carSum += item.numCar;
          tableData.push(options);
        });
        tableData.push({
          key: tableList.length,
          time: "去重总数",
          numPeople: peopleSum,
          numCar: carSum,
        });
        _this.tableData = tableData;
      }
    },
  },
};
</script>
<style scoped>
.infoBox-chart {
  width: 500px;
}
#analysisChart {
  width: 480px;
  height: 380px;
  padding: 10px;
}
.statistic-time {
  position: absolute;
  right: 10px;
  top: 40px;
  z-index: 10;
}
.button-group {
  position: absolute;
  top: 100px;
  right: 15px;
}
.analysis-msg {
  width: 100%;
  height: 370px;
  padding: 0px 10px 10px 30px;
}
.history-button {
  position: absolute;
  right: 25px;
  bottom: 285px;
}
.history-table {
  padding: 10px;
}
</style>
