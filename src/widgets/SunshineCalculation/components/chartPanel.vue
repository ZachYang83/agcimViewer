<template>
  <ag-popup
    v-model="visible"
    title="日照计算统计图"
    @onCancel="onCancel"
    class="infoBox-chart"
  >
    <div class="analysis-description">
      最低日照时长标准为
      <span style="font-weight: 800; font-size: 15px">3小时；</span>
      <span style="color: red">红色</span>表示低于，<span style="color: blue"
        >蓝色</span
      >表示高于
    </div>
    <div class="analysis-chart" id="analysisChart"></div>
  </ag-popup>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
import agRevitHelper from "@/sdk/bim/revitHelper";
import serverData4BIM from "@/views/js/net/serverData4BIM";
var echarts = require("echarts"); //引入echarts
export default {
  components: { "ag-popup": AgPopup },
  props: ["visible", "windowsId", "sunDuration"],
  data() {
    return {};
  },
  mounted() {
    // this.analysisChart();
  },

  methods: {
    analysisChart() {
      var _this = this;
      var myChart = echarts.init(document.getElementById("analysisChart"));
      // 指定图表的配置项和数据
      var option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        xAxis: [
          {
            name: "编号",
            type: "category",
            data: _this.windowsId,
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
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "有效日照时长",
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
            name: "日照时长",
            type: "bar",
            barWidth: "10",
            itemStyle: {
              //---图形形状
              normal: {
                barBorderRadius: [18, 18, 0, 0],
                color: function (value) {
                  if (value.data <= 3) {
                    return "red";
                  } else {
                    return "blue";
                  }
                },
              },
            },
            markLine: {
              data: [
                {
                  type: "average",
                  name: "平均值",
                  lineStyle: { color: "rgb(46, 139, 87)" },
                  label: {
                    show: true,
                    position: "middle",
                    formatter: "平均日照时长",
                  },
                },
                {
                  lineStyle: { color: "rgb(255, 0, 0)" },
                  name: "3小时日照时间线",
                  yAxis: 3,
                  label: {
                    show: true,
                    position: "middle",
                    formatter: "最低日照时长3h",
                  },
                },
              ],
            },
            data: _this.sunDuration,
          },
        ],
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 1,
            end: 50
        },
        {
            type: 'inside',
            xAxisIndex: [0],
            start: 1,
            end: 50
        },
        ],
      };
      myChart.setOption(option);

      myChart.on("click", function (params) {
        console.log(params);
        var tileset = _this.getTilesetByLayerText("GD综合大楼");
        serverData4BIM
          .getProperty("agcim3dentity_a", params.name)
          .then((res) => {
            if (!res.success) return;
            var data = res.content;
            agRevitHelper.flyTo(data[0], tileset, "Element", CIM.viewer);
          });
        // agRevitHelper.flyTo(params.name, tileset, "Element", CIM.viewer);
      });
    },
    getTilesetByLayerText(text) {
      var layerId = CIM.layerTree.getLayerByText(text).id;
      var layer = CIM.layerTree.getLayerById(layerId);
      if (layer) {
        return layer._primitives[0];
      }
      return null;
    },
    onCancel() {
      this.$emit("closeChartPanel", false);
    },
  },
};
</script>
<style scoped>
.infoBox-chart {
  width: 500px;
  /* height: 400px; */
  top: 260px;
}
.analysis-description {
  margin-top: 10px;
  text-align: center;
  /* background-color: rgba(0, 0, 0, 0.2); */
}
#analysisChart {
  width: 480px;
  height: 380px;
  padding: 10px;
  margin: 0 auto;
}
</style>
