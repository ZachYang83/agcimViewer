<template>
  <div class="building-simulation">
    <div>
      BIM模型 ：<a-input type="input" id="bimModelName" style="width:180px" />
    </div>
    <div class="building-simulation-time">
      开始时间：
      <a-date-picker :format="dateFormat" @change="startTimeChange" />
    </div>
    <div class="building-simulation-time">
      结束时间：
      <a-date-picker :format="dateFormat" @change="endTimeChange" />
    </div>
    <div class="building-simulation-start">
      <span>进度模拟</span>
      <a-button
        @click="handleClick"
        :disabled="isDisabled"
        style="margin: 10px"
        icon="play-circle"
      >
      </a-button>

      <a-button
        @click="handleClickStop"
        :disabled="isDisabled"
        style="margin: 10px"
        icon="pause-circle"
      >
      </a-button>

      <a-button
        @click="handleClicks"
        :disabled="isDisabled"
        style="margin: 10px"
        icon="redo"
      >
      </a-button>
    </div>
    <div class="stating-box">
      <div class="situations">
        <div>已完成<a-progress :percent="this.testCoverages" style="margin-left: 5px;width: 230px"/></div>
        <div>进行中<a-progress :percent="races" style="margin-left: 5px;width: 230px"/></div>
        <div>未开始<a-progress :percent="100 - this.testCoverages" style="margin-left: 5px;width: 230px"/></div>
      </div>
      <div id="timeline" class="building-simulation-timeline">
        <a-table
          :bordered="true"
          :columns="columns"
          :data-source="dataList"
          :customRow="customRow"
        >
          <a slot="task" slot-scope="text, r">{{ r.task }}</a>
          <a slot="start_time" slot-scope="text, r">{{ r.start_time }}</a>
          <a slot="end_time" slot-scope="text, r">{{ r.end_time }}</a>
        </a-table>
      </div>
    </div>

    <div style="width: 250px; margin: 5px 0 5px 40px">
      <a-progress :successPercent="this.testCoverages" :show-info="false" />
    </div>
  </div>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
import buildingHouse from "./js/buildingHouse.js";
import StyleCondition from "@/sdk/renderer/styleCondition";
let styleCondition;
let houseObj;
let buildStep = 0; //建筑步骤数量
let currentTime = null; //当前时间
let interval = null;
let layerText = "GD综合大楼";
const columns = [
  {
    title: "任务名称",
    dataIndex: "task",
    scopedSlots: { customRender: "task" },
  },
  {
    title: "开始时间",
    dataIndex: "start_time",
    scopedSlots: { customRender: "start_time" },
  },
  {
    title: "结束时间",
    dataIndex: "end_time",
    scopedSlots: { customRender: "end_time" },
  },
];

export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      showTimeline: false,
      dateFormat: "YYYY/MM/DD",
      dataList: [],
      startTime: null,
      endTime: null,
      pending: true,
      loading: false,
      columns,
      testCoverages: 0,
      races: 0,
    };
  },
  computed: {
    isDisabled() {
      return this.startTime == null || this.endTime == null;
    },
  },
  mounted() {},
  methods: {
    startTimeChange(date, dateString) {
      this.startTime = dateString;
    },
    endTimeChange(date, dateString) {
      if (new Date(dateString) < new Date(this.startTime)) {
        this.$message.error("结束时间不能早于开始时间！");
        return;
      }
      this.endTime = dateString;
      this.count();
    },
    onCancel() {
      this.resetData();
      if (houseObj) {
        clearInterval(interval);
        houseObj.reset();
      }
    },
    handleClick() {
      this.resetData();
      var index = 1;
      let millisecond = this.getDiffTime(); //得到开始与结束时间差，毫秒

      interval = setInterval(() => {
        var timeline = document.getElementById("timeline");
        timeline.scrollTop = timeline.scrollHeight;
        let oneSecond = millisecond / (buildStep + 1);
        let time = this.transTime(oneSecond);
        let timeFormat = this.formatDate(time);
        let start_time = this.formatDate(time);
        var re = houseObj.next();
        // value = re.status;
        // console.log(value);

        this.dataList.push({
          key: re.status,
          // value: re.label + " " + timeFormat,
          task: re.label,
          start_time: start_time,
          end_time: timeFormat,
        });

        // var re = houseObj.next();
        var number = this.dataList.length / buildStep + 1;
        var strr = Number(number * 100).toFixed(2);
        var sts = strr.toString().substr(0, 2);
        var str = strr.toString().substr(2, 1);
        if (sts < 20) {
          var st = strr.toString().substr(1, 1) + "0";
        } else {
          var st = 100;
        }
        this.testCoverages = Number(st);

        let race = 0 ? 100 : str + "0";
        this.races = Number(race);

        index += 1;
        // var index=re.status+1;
        // console.log(index);
        if (index > buildStep + 1) {
          this.pending = false;
          this.loading = false;
          this.testCoverages = 100;
          this.races = 0;
          clearInterval(interval);
        }
      }, 500);
    },
    resetData() {
      this.pending = false;
      this.loading = false;
      // this.dataList = [];
      currentTime = new Date(this.startTime);
    },
    count() {
      var tileset = this.getTilesetByLayerText(layerText);
      styleCondition = new StyleCondition(tileset);
      console.log(styleCondition);
      if (tileset == null) {
        this.$message.error("{{agMetaData.text}}GD综合大楼图层未打开！");
        return;
      }
      this.showTimeline = true;
      // this.loading = true;
      buildingHouse(tileset).then((da) => {
        houseObj = da;
        // console.log(  houseObj );
        buildStep = houseObj.getCount();
        // console.log( buildStep);
        // var re = houseObj.next();
      });
    },
    getTilesetByLayerText(text) {
      var layerId = CIM.layerTree.getLayerByText(text).id;
      var layer = CIM.layerTree.getLayerById(layerId);
      // console.log(layer);

      if (layer) {
        return layer._primitives[0];
      }
      return null;
    },
    //获取时间差
    getDiffTime() {
      var start = new Date(this.startTime);
      var end = new Date(this.endTime);
      var difftime = end - start; //计算时间差
      return difftime;
    },
    transTime(time) {
      var currentTime_s = currentTime.getTime(); //转化为时间戳毫秒数
      currentTime.setTime(currentTime_s + time); //设置新时间
      return currentTime;
    },
    //格式化时间
    formatDate(date) {
      var YY = date.getFullYear() + "-";
      var MM =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      var DD = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hh =
        (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
      var mm =
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
        ":";
      var ss =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      return YY + MM + DD;
    },
    handleClickStop() {
      clearInterval(interval);
    },
    handleClicks() {
      this.count();
      this.pending = false;
      this.loading = false;
      this.dataList = [];
      currentTime = new Date(this.startTime);
      this.testCoverages = 0;
      this.races = 0;
    },
    customRow(record, index) {
      return {
        on: {
          // 鼠标单击行
          click: (event) => {
            // let step=record.key;

            console.log(record);
            var condition = `\${id} === '0f089a3bcf38d052f7882d12b3923a82'`;

            styleCondition.resetColorStyle("WHITE", 0.5);
            //  styleCondition.setShowStyle(condition,"TOMATO");
            styleCondition.addColorStyle(condition, "YELLOW");
          },
        },
      };
    },
  },
  destroyed() {
    if (houseObj) {
      clearInterval(interval);
      houseObj.reset();
    }
  },
};
</script>
<style scoped>
.building-simulation {
  text-align: center;
  font-size: 13px;
}
.building-simulation-time {
  padding: 2px 5px;
  line-height: 1;
}
.building-simulation-timeline {
  max-height: 800px;
  overflow-y: scroll;
  /* margin: 5px 0; */
}
.building-simulation-start {
  /* text-align: center;
  margin: 10px;
  float: right; */
}
.building-simulation-timeline::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 3px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}

.building-simulation-timeline::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 2px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(83, 83, 83, 0.8);
}
.situations {
  width: 280px;
  margin-left: 20px;
  text-align: left !important;
}
.stating-box {
  border: 1px #c7c1c1 solid;
  border-radius: 3px;
  margin: 4px;
}
</style>
