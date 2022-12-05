<template>
  <ag-popup v-model="chartVisible" @onCancel="onCancel" class="popup-box">
    <div calss="chart" id="chart" ref="chartBox" style="height: 400px"></div>
    <div>
      <a-table
        :columns="columns"
        :data-source="tableData"
        :scroll="{ y: 300 }"
        size="small"
        tableLayout="auto"
        align="center"
        :pagination="false"
      >
        <a slot="name" slot-scope="text">{{ text }}</a>
      </a-table>
    </div>
  </ag-popup>
</template>

<script>
var echarts = require("echarts"); //引入echarts
import serverData4BIM from "@/views/js/net/serverData4BIM";
import AgPopup from "@/views/components/AgPopup.vue";

const columns = [
  // {
  //   title: "序号",
  //   dataIndex: "Index",
  //   key: "Index",
  //   width: 80,
  // },
  {
    title: "类型",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "数量",
    dataIndex: "value",
    key: "value",
  },
];

export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      chartVisible: false,
      columns,
      tableData: null,
      activeTabKey: null,
    };
  },
  mounted() {},
  methods: {
    open(node, activeKey, profession, tableName) {
      this.chartVisible = true;
      this.activeTabKey = activeKey;
      var category = node.dataRef.category;
      if (category == "Root") {
        countKey = "level";
        this.statistics(tableName, countKey, { profession: profession });
        return;
      }

      var parentValue = node.$parent.dataRef.name;
      var nodeValue = node.dataRef.name;
      var countKey = null;
      var option = {};
      switch (category) {
        case "Level":
          countKey = "catagory";
          option = {
            level: nodeValue,
            profession: profession,
          };
          break;
        case "Category":
          countKey = "familyname";
          option = {
            level: parentValue,
            catagory: nodeValue,
            profession: profession,
          };
          break;
        case "FamilyName":
          if (this.activeTabKey == "1") {
            var levelValue = node.$parent.$parent.dataRef.name;
            countKey = "familytype";
            option = {
              level: levelValue,
              catagory: parentValue,
              familyname: nodeValue,
              profession: profession,
            };
          }else if(this.activeTabKey == "3"){
            var catagoryValue = node.$parent.dataRef.name;
            countKey = "familytype";
            option = {
              catagory: catagoryValue,
              familyname: nodeValue,
              profession: profession,
            };
          }
          break;
        case "Catagory":
          countKey = "familyname";
          option = {
            catagory: nodeValue,
            profession: profession,
          };
          break;
      }
      this.statistics(tableName, countKey, option);
    },
    statistics(tableName, countKey, option) {
      var legendData = [];
      var _this = this;
      serverData4BIM.getStatics(tableName, countKey, option).then((result) => {
        if (!result.success) return;
        var data = result.content;
        var sum = 0;
        for (let i = 0; i < data.length; i++) {
          legendData.push(data[i].name);
          sum = sum + data[i].value;
        }

        this.buildingChart(data, legendData);
        data.push({ name: "总计", value: sum });
        _this.tableData = data;
      });
    },
    buildingChart(data, legendData) {
      const chart = this.$refs.chartBox;
      if (chart) {
        var myChart = echarts.init(document.getElementById("chart"));

        myChart.setOption({
          title: {
            text: "构件统计",
            left: "center",
          },
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b} : {c} ({d}%)",
          },
          legend: {
            bottom: 0,
            left: "center",
            data: legendData,
          },
          series: [
            {
              name: "构件信息",
              type: "pie",
              radius: "55%",
              data: data,
            },
          ],
        });
      }
    },
    onCancel() {
      this.chartVisible = false;
    },
  },
};
</script>
<style scoped>
.popup-box {
  width: 400px;
}
.chart {
  width: 400px;
  border-bottom: 1px solid #ccc;
}
</style>
